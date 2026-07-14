"""MetaGrana — API principal (FastAPI).

Gerenciador de gastos mensais com metas de compra: o usuário registra
gastos, define metas (com marca e modelo), e o sistema busca DIARIAMENTE
os menores preços no Mercado Livre e gera dicas financeiras (IA ou regras).
"""
from datetime import date, datetime

from apscheduler.schedulers.background import BackgroundScheduler
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import db
from .services import financas, ia, mercadolivre

app = FastAPI(title="MetaGrana", version="1.0.0")


# ---------- Modelos de entrada (validação automática do FastAPI) ----------

class GastoEntrada(BaseModel):
    descricao: str = Field(min_length=1, max_length=120)
    categoria: str = Field(default="outros", max_length=40)
    valor: float = Field(gt=0)
    data: date = Field(default_factory=date.today)


class MetaEntrada(BaseModel):
    titulo: str = Field(min_length=1, max_length=120, description="Ex.: PlayStation 5")
    marca: str = Field(default="", max_length=60)
    modelo: str = Field(default="", max_length=60)
    valor_alvo: float = Field(gt=0)
    valor_guardado: float = Field(default=0, ge=0)


class GuardarEntrada(BaseModel):
    valor: float = Field(gt=0)


def _oid(id_texto: str) -> ObjectId:
    try:
        return ObjectId(id_texto)
    except (InvalidId, TypeError):
        raise HTTPException(404, "Registro não encontrado")


def _publico(documento: dict) -> dict:
    """Troca o ObjectId interno por uma string amigável para o front."""
    documento["id"] = str(documento.pop("_id"))
    return documento


# ---------- Saúde ----------

@app.get("/api/saude")
def saude():
    return {"ok": True, "servico": "metagrana"}


# ---------- Gastos ----------

@app.post("/api/gastos", status_code=201)
def criar_gasto(gasto: GastoEntrada):
    doc = gasto.model_dump()
    doc["data"] = doc["data"].isoformat()
    db.gastos.insert_one(doc)
    return _publico(doc)


@app.get("/api/gastos")
def listar_gastos(mes: str | None = None):
    """Lista os gastos; ?mes=2026-07 filtra pelo mês."""
    filtro = {"data": {"$regex": f"^{mes}"}} if mes else {}
    return [_publico(g) for g in db.gastos.find(filtro).sort("data", -1)]


@app.delete("/api/gastos/{gasto_id}")
def apagar_gasto(gasto_id: str):
    resultado = db.gastos.delete_one({"_id": _oid(gasto_id)})
    if resultado.deleted_count == 0:
        raise HTTPException(404, "Gasto não encontrado")
    return {"ok": True}


@app.get("/api/gastos/resumo")
def resumo_do_mes(mes: str | None = None):
    """Total do mês + gastos agrupados por categoria."""
    mes = mes or date.today().strftime("%Y-%m")
    gastos = list(db.gastos.find({"data": {"$regex": f"^{mes}"}}))
    return {
        "mes": mes,
        "total": financas.total_do_mes(gastos),
        "por_categoria": financas.resumo_por_categoria(gastos),
    }


# ---------- Metas ----------

@app.post("/api/metas", status_code=201)
def criar_meta(meta: MetaEntrada):
    doc = meta.model_dump()
    # Termo usado nas buscas diárias: título + marca + modelo
    doc["termo_busca"] = " ".join(p for p in [doc["titulo"], doc["marca"], doc["modelo"]] if p)
    doc["criada_em"] = datetime.utcnow().isoformat()
    db.metas.insert_one(doc)
    return _publico(doc)


@app.get("/api/metas")
def listar_metas():
    saida = []
    for meta in db.metas.find():
        meta = _publico(meta)
        meta["progresso"] = financas.progresso_da_meta(meta["valor_alvo"], meta["valor_guardado"])
        ultimo = db.historico_precos.find_one(
            {"meta_id": meta["id"]}, sort=[("data", -1)]
        )
        if ultimo:
            ultimo.pop("_id", None)
            meta["melhor_oferta"] = ultimo
        saida.append(meta)
    return saida


@app.post("/api/metas/{meta_id}/guardar")
def guardar_dinheiro(meta_id: str, entrada: GuardarEntrada):
    """Registra um depósito na 'caixinha' da meta."""
    resultado = db.metas.update_one(
        {"_id": _oid(meta_id)}, {"$inc": {"valor_guardado": entrada.valor}}
    )
    if resultado.matched_count == 0:
        raise HTTPException(404, "Meta não encontrada")
    return {"ok": True}


@app.delete("/api/metas/{meta_id}")
def apagar_meta(meta_id: str):
    resultado = db.metas.delete_one({"_id": _oid(meta_id)})
    if resultado.deleted_count == 0:
        raise HTTPException(404, "Meta não encontrada")
    db.historico_precos.delete_many({"meta_id": meta_id})
    return {"ok": True}


@app.get("/api/metas/{meta_id}/precos")
async def buscar_precos(meta_id: str):
    """Busca AGORA as melhores ofertas no Mercado Livre e grava no histórico."""
    meta = db.metas.find_one({"_id": _oid(meta_id)})
    if not meta:
        raise HTTPException(404, "Meta não encontrada")

    ofertas = await mercadolivre.buscar_ofertas(meta["termo_busca"])
    melhor = mercadolivre.menor_preco(ofertas)
    if melhor:
        db.historico_precos.insert_one({
            "meta_id": str(meta["_id"]),
            "data": date.today().isoformat(),
            "preco": melhor["preco"],
            "titulo": melhor["titulo"],
            "link": melhor["link"],
        })

    historico = [
        {"data": h["data"], "preco": h["preco"]}
        for h in db.historico_precos.find({"meta_id": str(meta["_id"])}).sort("data", 1)
    ]
    return {
        "ofertas": ofertas,
        "variacao": financas.variacao_de_preco(historico),
        "historico": historico,
    }


# ---------- Dicas (IA ou regras) ----------

@app.get("/api/dicas")
async def dicas(renda: float = 0):
    """Dicas do mês com base nos números reais do usuário."""
    mes = date.today().strftime("%Y-%m")
    gastos = list(db.gastos.find({"data": {"$regex": f"^{mes}"}}))
    categorias = financas.resumo_por_categoria(gastos)
    total = financas.total_do_mes(gastos)
    metas = list(db.metas.find())
    return await ia.gerar_dicas(renda, total, categorias, metas)


# ---------- Busca diária automática de preços ----------

def atualizar_precos_diariamente():
    """Job do agendador: roda todo dia às 8h e grava o menor preço de cada meta."""
    import asyncio

    async def _rodar():
        for meta in db.metas.find():
            try:
                ofertas = await mercadolivre.buscar_ofertas(meta["termo_busca"])
                melhor = mercadolivre.menor_preco(ofertas)
                if melhor:
                    db.historico_precos.insert_one({
                        "meta_id": str(meta["_id"]),
                        "data": date.today().isoformat(),
                        "preco": melhor["preco"],
                        "titulo": melhor["titulo"],
                        "link": melhor["link"],
                    })
            except Exception as erro:  # uma meta com erro não derruba as demais
                print(f"[agendador] falha ao atualizar '{meta.get('titulo')}': {erro}")

    asyncio.run(_rodar())


agendador = BackgroundScheduler()
agendador.add_job(atualizar_precos_diariamente, "cron", hour=8, minute=0)


@app.on_event("startup")
def iniciar_agendador():
    if not agendador.running:
        agendador.start()


# O painel (front-end) é servido pela própria API
app.mount("/", StaticFiles(directory="static", html=True), name="painel")
