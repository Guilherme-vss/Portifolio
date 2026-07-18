"""fontes.py — o caçador de preços MULTI-FONTE do MetaGrana.

O pedido do Guilherme: não depender de um site só, mostrar de onde veio cada
preço e, ao clicar, ir DIRETO para o produto (não para a home do site).

A realidade honesta (regra 1 — frente do especialista): das grandes lojas,
só o **Mercado Livre** tem API pública que aceita busca sem chave e sem violar
os termos. Amazon, Magalu, Americanas etc. exigem parceria/afiliado com chave
privada — não dá para consultar do servidor sem acordo comercial.

A engenharia que resolve isso sem mentir:
  - O Mercado Livre entra com PREÇO REAL (API pública) e link direto ao anúncio.
  - As outras lojas entram como **link de busca profunda**: um clique já cai na
    página de resultados DAQUELE produto na loja, com o menor preço no topo.
    O usuário compara em 1 clique, e cada card diz de qual site é.

Cada oferta tem: titulo, preco (ou None se for link de busca), fonte, link.
"""
import httpx

SITE_BRASIL = "MLB"


# ---------- Mercado Livre: preço real via API pública ----------

def montar_url_ml(termo: str, limite: int = 6) -> str:
    termo = (termo or "").strip()
    if not termo:
        raise ValueError("Informe o que você quer buscar")
    consulta = httpx.QueryParams({"q": termo, "limit": limite, "sort": "price_asc"})
    return f"https://api.mercadolibre.com/sites/{SITE_BRASIL}/search?{consulta}"


def extrair_ml(resposta: dict) -> list[dict]:
    """Ofertas reais do Mercado Livre — com preço e link direto ao anúncio."""
    ofertas = []
    for item in resposta.get("results") or []:
        preco = item.get("price")
        if preco is None:
            continue
        ofertas.append({
            "titulo": item.get("title", "Sem título"),
            "preco": float(preco),
            "fonte": "Mercado Livre",
            "link": item.get("permalink", ""),  # vai DIRETO ao produto
            "condicao": "novo" if item.get("condition") == "new" else "usado",
            "tipo": "produto",
        })
    return sorted(ofertas, key=lambda o: o["preco"])


# ---------- Demais lojas: link de busca profunda ao produto ----------

# Cada função recebe o termo e devolve a URL que cai direto na busca DAQUELE
# produto na loja, já ordenada pelo menor preço quando a loja permite.
LOJAS = {
    "Amazon": lambda t: f"https://www.amazon.com.br/s?k={t}&s=price-asc-rank",
    "Magalu": lambda t: f"https://www.magazineluiza.com.br/busca/{t}/?ordenacao=menor-preco",
    "Americanas": lambda t: f"https://www.americanas.com.br/busca/{t}?sortBy=lowerPrice",
    "Casas Bahia": lambda t: f"https://www.casasbahia.com.br/{t}/b?ordenacao=menorPreco",
    "OLX": lambda t: f"https://www.olx.com.br/brasil?q={t}&sf=1",
}

# Categorias de imóvel mudam de loja: portal imobiliário, não varejo.
PORTAIS_IMOVEL = {
    "OLX Imóveis": lambda t: f"https://www.olx.com.br/imoveis?q={t}",
    "VivaReal": lambda t: f"https://www.vivareal.com.br/venda/?q={t}",
    "ZAP Imóveis": lambda t: f"https://www.zapimoveis.com.br/venda/?q={t}",
}


def links_de_lojas(termo: str, categoria: str | None = None) -> list[dict]:
    """Monta os links de busca profunda — a loja certa para cada categoria."""
    termo_url = httpx.QueryParams({"q": termo}).get("q").replace(" ", "+")
    lojas = PORTAIS_IMOVEL if categoria == "imovel" else LOJAS
    return [
        {
            "titulo": f"Ver ofertas de \"{termo}\" na {loja}",
            "preco": None,          # é link de busca, não um preço único
            "fonte": loja,
            "link": montar(termo_url),
            "tipo": "busca",
        }
        for loja, montar in lojas.items()
    ]


async def buscar_multifonte(termo: str, categoria: str | None = None) -> dict:
    """
    Junta tudo: preços reais do Mercado Livre + links das outras lojas.
    Devolve sempre — se o ML cair, ainda vêm os links das demais.
    """
    ofertas_ml: list[dict] = []
    erro_ml = None
    try:
        async with httpx.AsyncClient(timeout=10) as cliente:
            resposta = await cliente.get(montar_url_ml(termo))
            resposta.raise_for_status()
            ofertas_ml = extrair_ml(resposta.json())
    except httpx.HTTPError as e:
        erro_ml = str(e)

    return {
        "termo": termo,
        "com_preco": ofertas_ml,                      # Mercado Livre, ordenado
        "outras_lojas": links_de_lojas(termo, categoria),
        "menor_preco": ofertas_ml[0] if ofertas_ml else None,
        "aviso": erro_ml and "O Mercado Livre não respondeu agora — veja as outras lojas abaixo.",
    }
