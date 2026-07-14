"""ia.py — dicas financeiras mensais com IA (Claude, da Anthropic).

Se a variável ANTHROPIC_API_KEY estiver configurada, as dicas são geradas
pela IA com base nos números reais do usuário. Sem a chave, caímos nas
dicas por regras (financas.dicas_locais) — o app nunca fica sem conselho.
"""
import os

import httpx

from .financas import dicas_locais

URL_API = "https://api.anthropic.com/v1/messages"
MODELO = "claude-sonnet-5"


def montar_prompt(renda: float, total_gasto: float, categorias: dict,
                  metas: list[dict]) -> str:
    """Prompt enxuto e objetivo: contexto financeiro + o que queremos de volta."""
    linhas_metas = "\n".join(
        f"- {m.get('titulo')} (alvo R$ {m.get('valor_alvo', 0):.2f}, "
        f"guardado R$ {m.get('valor_guardado', 0):.2f})"
        for m in metas
    ) or "- nenhuma meta cadastrada"

    linhas_categorias = "\n".join(
        f"- {cat}: R$ {valor:.2f}" for cat, valor in categorias.items()
    ) or "- nenhum gasto registrado"

    return (
        "Você é um consultor financeiro pessoal, direto e encorajador, falando "
        "com um brasileiro comum. Com base nos dados abaixo, dê de 3 a 5 dicas "
        "curtas e práticas (uma por linha, começando com um emoji) para a pessoa "
        "controlar os gastos e alcançar as metas. Reforce que controle e "
        "constância são o caminho.\n\n"
        f"Renda mensal: R$ {renda:.2f}\n"
        f"Total gasto no mês: R$ {total_gasto:.2f}\n"
        f"Gastos por categoria:\n{linhas_categorias}\n"
        f"Metas de compra:\n{linhas_metas}"
    )


async def gerar_dicas(renda: float, total_gasto: float, categorias: dict,
                      metas: list[dict]) -> dict:
    """Devolve {"fonte": "ia" | "regras", "dicas": [...]}."""
    chave = os.getenv("ANTHROPIC_API_KEY", "").strip()

    if chave:
        try:
            async with httpx.AsyncClient(timeout=30) as cliente:
                resposta = await cliente.post(
                    URL_API,
                    headers={
                        "x-api-key": chave,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": MODELO,
                        "max_tokens": 600,
                        "messages": [{
                            "role": "user",
                            "content": montar_prompt(renda, total_gasto, categorias, metas),
                        }],
                    },
                )
                resposta.raise_for_status()
                texto = resposta.json()["content"][0]["text"]
                dicas = [linha.strip() for linha in texto.splitlines() if linha.strip()]
                return {"fonte": "ia", "dicas": dicas}
        except Exception:
            pass  # IA indisponível → seguimos com as regras locais

    return {
        "fonte": "regras",
        "dicas": dicas_locais(renda, total_gasto, categorias, len(metas)),
    }
