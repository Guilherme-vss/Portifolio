"""corte.py — o motor de cálculo do CorteCerto.

Tudo aqui é matemática pura de corte de chapas de esquadria:
quantas peças saem de uma chapa, qual a sobra exata e como
distribuir uma lista de cortes no estoque desperdiçando o mínimo.

O parâmetro `kerf` é a espessura da lâmina da serra (em cm):
cada corte "come" um pouquinho de material. Por padrão é 0,
mas o fornecedor pode informar o valor real da máquina dele.
"""
from dataclasses import dataclass, field


def calcular_corte(tamanho_chapa: float, tamanho_corte: float, kerf: float = 0.0) -> dict:
    """Quantas peças de `tamanho_corte` saem de uma chapa e qual a sobra.

    Exemplo clássico do balcão: chapa de 90 cortada em peças de 35,7
    → saem 2 peças e sobra 18,6 (90 - 2×35,7).

    >>> calcular_corte(90, 35.7)
    {'pecas': 2, 'sobra': 18.6, 'aproveitamento': 79.3}
    """
    if tamanho_chapa <= 0:
        raise ValueError("O tamanho da chapa precisa ser maior que zero")
    if tamanho_corte <= 0:
        raise ValueError("O tamanho do corte precisa ser maior que zero")
    if kerf < 0:
        raise ValueError("A espessura da lâmina (kerf) não pode ser negativa")
    if tamanho_corte > tamanho_chapa:
        return {"pecas": 0, "sobra": round(tamanho_chapa, 2), "aproveitamento": 0.0}

    # Cada peça consome o corte + a lâmina (menos o último corte, que
    # aproveita a borda da chapa — por isso somamos o kerf de volta).
    consumo_por_peca = tamanho_corte + kerf
    pecas = int((tamanho_chapa + kerf) // consumo_por_peca)
    usado = pecas * tamanho_corte + max(0, pecas - 1) * kerf
    sobra = round(tamanho_chapa - usado, 2)
    aproveitamento = round(pecas * tamanho_corte / tamanho_chapa * 100, 1)

    return {"pecas": pecas, "sobra": sobra, "aproveitamento": aproveitamento}


def quantas_chapas(tamanho_chapa: float, tamanho_corte: float,
                   pecas_necessarias: int, kerf: float = 0.0) -> dict:
    """Quantas chapas o fornecedor precisa para produzir N peças.

    Devolve também a sobra da última chapa (as anteriores são usadas
    por inteiro no mesmo padrão de corte).
    """
    if pecas_necessarias <= 0:
        raise ValueError("Informe quantas peças você precisa")

    por_chapa = calcular_corte(tamanho_chapa, tamanho_corte, kerf)
    if por_chapa["pecas"] == 0:
        return {"chapas": 0, "possivel": False,
                "motivo": "O corte é maior que a chapa"}

    chapas_cheias, pecas_restantes = divmod(pecas_necessarias, por_chapa["pecas"])
    total_chapas = chapas_cheias + (1 if pecas_restantes else 0)

    if pecas_restantes:
        usado = pecas_restantes * tamanho_corte + max(0, pecas_restantes - 1) * kerf
        sobra_ultima = round(tamanho_chapa - usado, 2)
    else:
        sobra_ultima = por_chapa["sobra"]

    return {
        "chapas": total_chapas,
        "possivel": True,
        "pecas_por_chapa": por_chapa["pecas"],
        "sobra_ultima_chapa": sobra_ultima,
    }


@dataclass
class _ChapaEmUso:
    """Estado interno do plano: uma chapa aberta e o que já saiu dela."""
    tamanho: float
    restante: float
    cortes: list = field(default_factory=list)


def plano_de_corte(tamanho_chapa: float, cortes: list[float], kerf: float = 0.0) -> dict:
    """Distribui uma lista de cortes em chapas, desperdiçando o mínimo.

    Usa a heurística First-Fit Decreasing (a mais usada na indústria
    para corte unidimensional): ordena os cortes do maior para o menor
    e encaixa cada um na primeira chapa onde couber.

    Devolve o plano chapa a chapa, com a sobra de cada uma.
    """
    if tamanho_chapa <= 0:
        raise ValueError("O tamanho da chapa precisa ser maior que zero")
    impossiveis = [corte for corte in cortes if corte > tamanho_chapa]
    if impossiveis:
        raise ValueError(
            f"Estes cortes não cabem numa chapa de {tamanho_chapa}: {impossiveis}")

    chapas: list[_ChapaEmUso] = []
    for corte in sorted(cortes, reverse=True):
        consumo = corte + kerf
        destino = next(
            (chapa for chapa in chapas
             # a última peça da chapa pode dispensar o kerf (borda livre)
             if chapa.restante >= corte and (chapa.restante >= consumo or not chapa.cortes)),
            None,
        )
        if destino is None:
            destino = _ChapaEmUso(tamanho=tamanho_chapa, restante=tamanho_chapa)
            chapas.append(destino)
        gasto = corte if not destino.cortes else consumo
        destino.restante = round(destino.restante - gasto, 2)
        destino.cortes.append(corte)

    total_material = tamanho_chapa * len(chapas)
    total_cortado = sum(cortes)
    return {
        "chapas_necessarias": len(chapas),
        "plano": [
            {"chapa": i + 1, "cortes": chapa.cortes, "sobra": chapa.restante}
            for i, chapa in enumerate(chapas)
        ],
        "sobra_total": round(sum(chapa.restante for chapa in chapas), 2),
        "aproveitamento": round(total_cortado / total_material * 100, 1) if total_material else 0.0,
    }
