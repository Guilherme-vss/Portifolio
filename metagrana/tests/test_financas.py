"""Testes unitários da matemática do MetaGrana. Rode com: pytest"""
import pytest

from app.services.financas import (
    dicas_locais,
    progresso_da_meta,
    quanto_poupar_por_mes,
    resumo_por_categoria,
    saude_financeira,
    total_do_mes,
    variacao_de_preco,
)


class TestResumoPorCategoria:
    def test_agrupa_e_soma_por_categoria(self):
        gastos = [
            {"categoria": "Mercado", "valor": 100.50},
            {"categoria": "mercado", "valor": 49.50},
            {"categoria": "lazer", "valor": 80},
        ]
        assert resumo_por_categoria(gastos) == {"mercado": 150.0, "lazer": 80.0}

    def test_gasto_sem_categoria_vai_para_outros(self):
        assert resumo_por_categoria([{"valor": 10}]) == {"outros": 10.0}

    def test_lista_vazia(self):
        assert resumo_por_categoria([]) == {}


class TestTotalDoMes:
    def test_soma_todos_os_valores(self):
        assert total_do_mes([{"valor": 10.10}, {"valor": 20.20}]) == 30.30

    def test_lista_vazia_da_zero(self):
        assert total_do_mes([]) == 0.0


class TestProgressoDaMeta:
    def test_meio_do_caminho(self):
        resultado = progresso_da_meta(valor_alvo=1000, valor_guardado=500)
        assert resultado == {"percentual": 50.0, "falta": 500.0, "concluida": False}

    def test_meta_concluida_trava_em_100_por_cento(self):
        resultado = progresso_da_meta(valor_alvo=1000, valor_guardado=1500)
        assert resultado["percentual"] == 100.0
        assert resultado["concluida"] is True
        assert resultado["falta"] == 0.0

    def test_valor_alvo_invalido(self):
        with pytest.raises(ValueError):
            progresso_da_meta(valor_alvo=0, valor_guardado=100)


class TestQuantoPouparPorMes:
    def test_divide_o_que_falta_pelo_prazo(self):
        assert quanto_poupar_por_mes(1200, 200, 10) == 100.0

    def test_meta_ja_batida_pede_zero(self):
        assert quanto_poupar_por_mes(1000, 2000, 5) == 0.0

    def test_prazo_invalido(self):
        with pytest.raises(ValueError):
            quanto_poupar_por_mes(1000, 0, 0)


class TestSaudeFinanceira:
    def test_gastando_pouco_e_saudavel(self):
        assert saude_financeira(renda_mensal=5000, total_gasto=2000) == "saudavel"

    def test_mais_da_metade_pede_atencao(self):
        assert saude_financeira(5000, 3000) == "atencao"

    def test_acima_de_80_por_cento_e_critico(self):
        assert saude_financeira(5000, 4500) == "critico"

    def test_sem_renda_informada(self):
        assert saude_financeira(0, 100) == "sem_renda_informada"


class TestVariacaoDePreco:
    def test_detecta_queda_de_preco(self):
        historico = [
            {"data": "2026-07-01", "preco": 4000.0},
            {"data": "2026-07-02", "preco": 3600.0},
        ]
        variacao = variacao_de_preco(historico)
        assert variacao["caiu"] is True
        assert variacao["diferenca"] == -400.0
        assert variacao["percentual"] == -10.0

    def test_historico_curto_nao_compara(self):
        assert variacao_de_preco([{"data": "2026-07-01", "preco": 100}]) is None

    def test_ordena_por_data_antes_de_comparar(self):
        historico = [
            {"data": "2026-07-02", "preco": 90.0},
            {"data": "2026-07-01", "preco": 100.0},
        ]
        assert variacao_de_preco(historico)["caiu"] is True


class TestDicasLocais:
    def test_gasto_critico_gera_alerta(self):
        dicas = dicas_locais(renda=1000, total_gasto=900, categorias={}, metas_abertas=1)
        assert any("80%" in dica for dica in dicas)

    def test_aponta_a_maior_categoria(self):
        dicas = dicas_locais(3000, 1000, {"mercado": 700, "lazer": 300}, 1)
        assert any("mercado" in dica for dica in dicas)

    def test_sem_metas_incentiva_a_criar(self):
        dicas = dicas_locais(3000, 1000, {}, metas_abertas=0)
        assert any("meta" in dica.lower() for dica in dicas)
