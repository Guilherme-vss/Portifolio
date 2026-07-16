"""cotacoes.py — o robô de mercado do MetaGrana.

Busca cotações AO VIVO (dólar, euro e bitcoin) na AwesomeAPI — uma API
pública brasileira, sem chave — e transforma os números em dicas que
fazem sentido para o bolso do usuário. Nada de conselho genérico:
a dica cita o valor real de hoje.
"""
import httpx

URL_COTACOES = "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL"

_NOMES = {
    "USDBRL": ("💵 Dólar", "dolar"),
    "EURBRL": ("💶 Euro", "euro"),
    "BTCBRL": ("₿ Bitcoin", "bitcoin"),
}


def extrair_cotacoes(resposta: dict) -> list[dict]:
    """Converte a resposta crua da AwesomeAPI em cotações simples.

    Cada item vira {codigo, nome, valor, variacao_pct} — o suficiente
    para os cards da interface e para as regras de dica.
    """
    cotacoes = []
    for chave, (rotulo, codigo) in _NOMES.items():
        item = resposta.get(chave)
        if not item:
            continue
        try:
            cotacoes.append({
                "codigo": codigo,
                "nome": rotulo,
                "valor": round(float(item["bid"]), 2),
                "variacao_pct": round(float(item.get("pctChange", 0)), 2),
            })
        except (KeyError, TypeError, ValueError):
            continue
    return cotacoes


def dicas_de_mercado(cotacoes: list[dict]) -> list[str]:
    """Regras que transformam os números do dia em conselhos práticos."""
    dicas: list[str] = []
    por_codigo = {c["codigo"]: c for c in cotacoes}

    dolar = por_codigo.get("dolar")
    if dolar:
        if dolar["variacao_pct"] > 0.5:
            dicas.append(
                f"💵 O dólar subiu {dolar['variacao_pct']}% hoje (R$ {dolar['valor']:.2f}). "
                "Eletrônicos e importados tendem a encarecer — se sua meta é um deles, "
                "vale acompanhar de perto a vitrine de promoções."
            )
        elif dolar["variacao_pct"] < -0.5:
            dicas.append(
                f"💵 O dólar caiu {abs(dolar['variacao_pct'])}% hoje (R$ {dolar['valor']:.2f}). "
                "Boa janela para metas de eletrônicos e importados nas próximas semanas."
            )
        else:
            dicas.append(
                f"💵 Dólar estável hoje em R$ {dolar['valor']:.2f} — sem pressa nem pânico "
                "para compras de importados."
            )

    btc = por_codigo.get("bitcoin")
    if btc and abs(btc["variacao_pct"]) > 2:
        direcao = "subiu" if btc["variacao_pct"] > 0 else "caiu"
        dicas.append(
            f"₿ O bitcoin {direcao} {abs(btc['variacao_pct'])}% nas últimas 24h — "
            "lembre: reserva de emergência vem antes de qualquer investimento volátil."
        )

    return dicas


async def buscar_cotacoes() -> list[dict]:
    """Consulta a AwesomeAPI. Lista vazia se estiver fora do ar (nunca quebra)."""
    try:
        async with httpx.AsyncClient(timeout=8) as cliente:
            resposta = await cliente.get(URL_COTACOES)
            resposta.raise_for_status()
            return extrair_cotacoes(resposta.json())
    except httpx.HTTPError:
        return []
