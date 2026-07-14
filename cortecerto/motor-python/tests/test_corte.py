"""Testes do motor de corte — o coração do CorteCerto. Rode com: pytest"""
import pytest

from app.corte import calcular_corte, plano_de_corte, quantas_chapas


class TestCalcularCorte:
    def test_exemplo_do_balcao_90_em_35_7(self):
        """O exemplo clássico: chapa de 90 em peças de 35,7 → 2 peças, sobra 18,6."""
        resultado = calcular_corte(90, 35.7)
        assert resultado["pecas"] == 2
        assert resultado["sobra"] == 18.6
        assert resultado["aproveitamento"] == 79.3

    def test_corte_exato_sem_sobra(self):
        resultado = calcular_corte(90, 30)
        assert resultado["pecas"] == 3
        assert resultado["sobra"] == 0

    def test_corte_maior_que_a_chapa_nao_sai_peca(self):
        resultado = calcular_corte(90, 100)
        assert resultado["pecas"] == 0
        assert resultado["sobra"] == 90

    def test_kerf_come_material_entre_pecas(self):
        # 3 peças de 30 caberiam justas, mas a lâmina de 0,3 entre elas
        # consome material: só saem 2, sobra 90 - (2*30 + 0,3) = 29,7
        resultado = calcular_corte(90, 30, kerf=0.3)
        assert resultado["pecas"] == 2
        assert resultado["sobra"] == 29.7

    def test_valores_invalidos_sao_rejeitados(self):
        with pytest.raises(ValueError):
            calcular_corte(0, 10)
        with pytest.raises(ValueError):
            calcular_corte(90, 0)
        with pytest.raises(ValueError):
            calcular_corte(90, 10, kerf=-1)


class TestQuantasChapas:
    def test_calcula_chapas_para_o_pedido(self):
        # 5 peças de 35,7, saem 2 por chapa → 3 chapas
        resultado = quantas_chapas(90, 35.7, pecas_necessarias=5)
        assert resultado["chapas"] == 3
        assert resultado["pecas_por_chapa"] == 2
        # a última chapa produz só 1 peça → sobra 90 - 35,7 = 54,3
        assert resultado["sobra_ultima_chapa"] == 54.3

    def test_pedido_que_fecha_exato(self):
        resultado = quantas_chapas(90, 30, pecas_necessarias=6)
        assert resultado["chapas"] == 2
        assert resultado["sobra_ultima_chapa"] == 0

    def test_corte_impossivel_avisa_em_vez_de_quebrar(self):
        resultado = quantas_chapas(90, 120, pecas_necessarias=2)
        assert resultado["possivel"] is False

    def test_quantidade_invalida(self):
        with pytest.raises(ValueError):
            quantas_chapas(90, 30, pecas_necessarias=0)


class TestPlanoDeCorte:
    def test_encaixa_cortes_em_uma_chapa_so(self):
        resultado = plano_de_corte(90, [35.7, 35.7])
        assert resultado["chapas_necessarias"] == 1
        assert resultado["plano"][0]["sobra"] == 18.6

    def test_distribui_em_varias_chapas_com_ffd(self):
        # 60+25 numa chapa (sobra 5) e 50+30 na outra (sobra 10):
        # o First-Fit Decreasing acha essa combinação sozinho
        resultado = plano_de_corte(90, [60, 50, 30, 25])
        assert resultado["chapas_necessarias"] == 2
        assert resultado["sobra_total"] == 15

    def test_corte_maior_que_a_chapa_e_erro_claro(self):
        with pytest.raises(ValueError, match="não cabem"):
            plano_de_corte(90, [100])

    def test_kerf_e_considerado_no_plano(self):
        # Sem kerf caberiam 3×30 na chapa; com lâmina de 1 cm, só 2
        resultado = plano_de_corte(90, [30, 30, 30], kerf=1)
        assert resultado["chapas_necessarias"] == 2

    def test_aproveitamento_total_do_plano(self):
        resultado = plano_de_corte(90, [90])
        assert resultado["aproveitamento"] == 100.0
        assert resultado["sobra_total"] == 0
