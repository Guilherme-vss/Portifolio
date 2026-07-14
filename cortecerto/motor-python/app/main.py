"""Motor de corte do CorteCerto — microsserviço Python (FastAPI).

A API .NET chama este serviço para todos os cálculos de corte.
Separar o "motor" num serviço próprio permite evoluir os algoritmos
(e até plugar otimização pesada) sem tocar no resto do sistema.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .corte import calcular_corte, plano_de_corte, quantas_chapas

app = FastAPI(title="CorteCerto — Motor de Corte", version="1.0.0")


class CorteEntrada(BaseModel):
    tamanho_chapa: float = Field(gt=0, description="Tamanho da chapa em cm (ex.: 90)")
    tamanho_corte: float = Field(gt=0, description="Tamanho de cada peça em cm (ex.: 35.7)")
    kerf: float = Field(default=0, ge=0, description="Espessura da lâmina em cm")


class QuantidadeEntrada(CorteEntrada):
    pecas_necessarias: int = Field(gt=0, description="Quantas peças produzir")


class PlanoEntrada(BaseModel):
    tamanho_chapa: float = Field(gt=0)
    cortes: list[float] = Field(min_length=1, description="Lista de cortes em cm")
    kerf: float = Field(default=0, ge=0)


@app.get("/saude")
def saude():
    return {"ok": True, "servico": "motor-de-corte"}


@app.post("/corte")
def corte(entrada: CorteEntrada):
    """Quantas peças saem de UMA chapa e qual a sobra exata."""
    return calcular_corte(entrada.tamanho_chapa, entrada.tamanho_corte, entrada.kerf)


@app.post("/chapas-necessarias")
def chapas_necessarias(entrada: QuantidadeEntrada):
    """Quantas chapas comprar para produzir N peças."""
    return quantas_chapas(entrada.tamanho_chapa, entrada.tamanho_corte,
                          entrada.pecas_necessarias, entrada.kerf)


@app.post("/plano")
def plano(entrada: PlanoEntrada):
    """Plano de corte otimizado (First-Fit Decreasing) para vários cortes."""
    try:
        return plano_de_corte(entrada.tamanho_chapa, entrada.cortes, entrada.kerf)
    except ValueError as erro:
        raise HTTPException(status_code=422, detail=str(erro))
