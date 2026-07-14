"""mercadolivre.py — busca de menores preços na API pública do Mercado Livre.

Toda meta cadastrada tem um termo de busca (ex.: "PlayStation 5 Slim").
Diariamente (e sob demanda) o MetaGrana consulta a API, guarda o menor
preço no histórico e mostra o link do anúncio + vendedor para contato.
"""
import httpx

SITE_BRASIL = "MLB"  # código do Mercado Livre Brasil


def montar_url_busca(termo: str, limite: int = 5) -> str:
    """Monta a URL de busca da API pública (sem chave!) do Mercado Livre."""
    termo = (termo or "").strip()
    if not termo:
        raise ValueError("Informe o que você quer buscar")
    consulta = httpx.QueryParams({"q": termo, "limit": limite, "sort": "price_asc"})
    return f"https://api.mercadolibre.com/sites/{SITE_BRASIL}/search?{consulta}"


def extrair_ofertas(resposta: dict) -> list[dict]:
    """Converte a resposta crua da API em ofertas simples para a interface.

    Mantém só o que importa para decidir a compra: preço, título, link do
    anúncio (o "contato" com o vendedor) e condição do produto.
    """
    resultados = resposta.get("results") or []
    ofertas = []
    for item in resultados:
        preco = item.get("price")
        if preco is None:
            continue
        ofertas.append({
            "titulo": item.get("title", "Sem título"),
            "preco": float(preco),
            "link": item.get("permalink", ""),
            "condicao": "novo" if item.get("condition") == "new" else "usado",
            "vendedor_id": (item.get("seller") or {}).get("id"),
        })
    return sorted(ofertas, key=lambda oferta: oferta["preco"])


def menor_preco(ofertas: list[dict]) -> dict | None:
    """A melhor oferta da lista (ou None se a busca não achou nada)."""
    return ofertas[0] if ofertas else None


async def buscar_ofertas(termo: str, limite: int = 5) -> list[dict]:
    """Consulta a API do Mercado Livre e devolve as ofertas mais baratas."""
    async with httpx.AsyncClient(timeout=10) as cliente:
        resposta = await cliente.get(montar_url_busca(termo, limite))
        resposta.raise_for_status()
        return extrair_ofertas(resposta.json())
