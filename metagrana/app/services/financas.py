"""financas.py — a matemática do MetaGrana.

Funções puras (sem banco, sem rede) de propósito: são o coração do
produto e precisam ser fáceis de testar. Tudo aqui tem teste unitário
em tests/test_financas.py.
"""
from collections import defaultdict
from datetime import date


def resumo_por_categoria(gastos: list[dict]) -> dict[str, float]:
    """Soma os gastos agrupados por categoria.

    >>> resumo_por_categoria([{"categoria": "mercado", "valor": 100},
    ...                       {"categoria": "mercado", "valor": 50}])
    {'mercado': 150.0}
    """
    resumo: dict[str, float] = defaultdict(float)
    for gasto in gastos:
        categoria = (gasto.get("categoria") or "outros").strip().lower()
        resumo[categoria] += float(gasto.get("valor", 0))
    return {k: round(v, 2) for k, v in resumo.items()}


def total_do_mes(gastos: list[dict]) -> float:
    """Total gasto na lista recebida (já filtrada pelo mês na consulta)."""
    return round(sum(float(g.get("valor", 0)) for g in gastos), 2)


def progresso_da_meta(valor_alvo: float, valor_guardado: float) -> dict:
    """Percentual de progresso e quanto falta para alcançar a meta."""
    if valor_alvo <= 0:
        raise ValueError("O valor alvo da meta precisa ser maior que zero")
    guardado = max(0.0, float(valor_guardado))
    percentual = min(100.0, round(guardado / valor_alvo * 100, 1))
    return {
        "percentual": percentual,
        "falta": round(max(0.0, valor_alvo - guardado), 2),
        "concluida": guardado >= valor_alvo,
    }


def quanto_poupar_por_mes(valor_alvo: float, valor_guardado: float, meses: int) -> float:
    """Quanto guardar por mês para bater a meta no prazo desejado."""
    if meses <= 0:
        raise ValueError("O prazo precisa ser de pelo menos 1 mês")
    falta = max(0.0, valor_alvo - valor_guardado)
    return round(falta / meses, 2)


def saude_financeira(renda_mensal: float, total_gasto: float) -> str:
    """Classificação simples e honesta de como o mês está indo.

    Baseada na regra popular 50/30/20: comprometer mais de 80% da renda
    com gastos deixa pouco espaço para poupar e alcançar metas.
    """
    if renda_mensal <= 0:
        return "sem_renda_informada"
    comprometido = total_gasto / renda_mensal
    if comprometido < 0.5:
        return "saudavel"
    if comprometido < 0.8:
        return "atencao"
    return "critico"


def variacao_de_preco(historico: list[dict]) -> dict | None:
    """Compara o preço mais recente com o registro anterior.

    Cada item do histórico tem {"data": date/str, "preco": float}.
    Retorna a variação absoluta e percentual, ou None se não houver
    dados suficientes para comparar.
    """
    if len(historico) < 2:
        return None
    ordenado = sorted(historico, key=lambda item: str(item["data"]))
    anterior, atual = ordenado[-2]["preco"], ordenado[-1]["preco"]
    if anterior <= 0:
        return None
    diferenca = round(atual - anterior, 2)
    return {
        "anterior": anterior,
        "atual": atual,
        "diferenca": diferenca,
        "percentual": round(diferenca / anterior * 100, 1),
        "caiu": diferenca < 0,
    }


def dicas_locais(renda: float, total_gasto: float, categorias: dict[str, float],
                 metas_abertas: int) -> list[str]:
    """Dicas baseadas em regras — usadas quando não há chave de IA configurada.

    A ideia é a mesma que a IA reforçaria: sem controle, não há meta que saia
    do papel. As regras olham para os números reais do usuário.
    """
    dicas: list[str] = []
    situacao = saude_financeira(renda, total_gasto)

    if situacao == "critico":
        dicas.append(
            "🚨 Seus gastos passaram de 80% da renda este mês. Antes de pensar em "
            "novas compras, vale cortar o que não é essencial — metas só saem do "
            "papel com sobra no fim do mês."
        )
    elif situacao == "atencao":
        dicas.append(
            "⚠️ Você já comprometeu mais da metade da renda. Tente fechar o mês "
            "gastando menos de 80% para sobrar dinheiro para suas metas."
        )
    elif situacao == "saudavel":
        dicas.append(
            "✅ Boa! Seus gastos estão abaixo de 50% da renda. É o cenário ideal "
            "para acelerar suas metas — que tal aumentar o valor guardado?"
        )

    if categorias:
        maior = max(categorias, key=categorias.get)
        dicas.append(
            f"🔎 Sua maior despesa do mês é com \"{maior}\" "
            f"(R$ {categorias[maior]:.2f}). Reveja se dá para reduzir aí primeiro."
        )

    if metas_abertas == 0:
        dicas.append(
            "🎯 Você ainda não tem metas cadastradas. Definir um objetivo concreto "
            "(com marca e modelo!) é o que transforma economia em conquista."
        )
    else:
        dicas.append(
            "📉 O MetaGrana acompanha os preços das suas metas todos os dias no "
            "Mercado Livre — fique de olho nas quedas para comprar na hora certa."
        )

    return dicas
