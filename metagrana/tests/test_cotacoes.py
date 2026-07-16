"""Testes do robô de mercado (parte pura, sem rede)."""
from app.services.cotacoes import dicas_de_mercado, extrair_cotacoes


class TestExtrairCotacoes:
    resposta = {
        "USDBRL": {"bid": "5.4321", "pctChange": "0.85"},
        "EURBRL": {"bid": "5.9876", "pctChange": "-0.12"},
        "BTCBRL": {"bid": "612345.67", "pctChange": "3.4"},
    }

    def test_converte_as_tres_moedas(self):
        cotacoes = extrair_cotacoes(self.resposta)
        assert [c["codigo"] for c in cotacoes] == ["dolar", "euro", "bitcoin"]
        assert cotacoes[0]["valor"] == 5.43
        assert cotacoes[0]["variacao_pct"] == 0.85

    def test_moeda_faltando_nao_quebra(self):
        cotacoes = extrair_cotacoes({"USDBRL": {"bid": "5.40", "pctChange": "0"}})
        assert len(cotacoes) == 1

    def test_resposta_vazia_da_lista_vazia(self):
        assert extrair_cotacoes({}) == []


class TestDicasDeMercado:
    def test_dolar_em_alta_gera_alerta_de_importados(self):
        dicas = dicas_de_mercado([
            {"codigo": "dolar", "nome": "💵 Dólar", "valor": 5.43, "variacao_pct": 0.85},
        ])
        assert any("subiu" in dica and "5.43" in dica for dica in dicas)

    def test_dolar_em_queda_sugere_janela_de_compra(self):
        dicas = dicas_de_mercado([
            {"codigo": "dolar", "nome": "💵 Dólar", "valor": 5.10, "variacao_pct": -0.9},
        ])
        assert any("caiu" in dica for dica in dicas)

    def test_bitcoin_volatil_lembra_da_reserva(self):
        dicas = dicas_de_mercado([
            {"codigo": "bitcoin", "nome": "₿ Bitcoin", "valor": 612000, "variacao_pct": 3.4},
        ])
        assert any("reserva de emergência" in dica for dica in dicas)

    def test_sem_cotacoes_sem_dicas_de_mercado(self):
        assert dicas_de_mercado([]) == []
