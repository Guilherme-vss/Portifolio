"""Testes da integração com o Mercado Livre (parte pura, sem rede)."""
import pytest

from app.services.mercadolivre import (
    extrair_ofertas,
    extrair_promocoes,
    menor_preco,
    montar_url_busca,
)


class TestMontarUrlBusca:
    def test_monta_url_do_site_brasileiro_ordenada_por_preco(self):
        url = montar_url_busca("PlayStation 5")
        assert "api.mercadolibre.com/sites/MLB/search" in url
        assert "sort=price_asc" in url
        assert "PlayStation" in url

    def test_termo_vazio_e_rejeitado(self):
        with pytest.raises(ValueError):
            montar_url_busca("   ")


class TestExtrairOfertas:
    resposta = {
        "results": [
            {"title": "PS5 usado", "price": 2800.0, "permalink": "https://ml/b",
             "condition": "used", "seller": {"id": 2}},
            {"title": "PS5 novo", "price": 3500.0, "permalink": "https://ml/a",
             "condition": "new", "seller": {"id": 1}},
            {"title": "Sem preço", "permalink": "https://ml/c", "condition": "new"},
        ]
    }

    def test_ordena_do_mais_barato_para_o_mais_caro(self):
        ofertas = extrair_ofertas(self.resposta)
        assert [oferta["preco"] for oferta in ofertas] == [2800.0, 3500.0]

    def test_ignora_anuncios_sem_preco(self):
        assert len(extrair_ofertas(self.resposta)) == 2

    def test_traduz_a_condicao_do_produto(self):
        ofertas = extrair_ofertas(self.resposta)
        assert ofertas[0]["condicao"] == "usado"
        assert ofertas[1]["condicao"] == "novo"

    def test_resposta_vazia_da_lista_vazia(self):
        assert extrair_ofertas({}) == []


class TestExtrairPromocoes:
    resposta = {
        "results": [
            {"title": "TV com desconto", "price": 1800.0, "original_price": 2400.0,
             "permalink": "https://ml/tv"},
            {"title": "Sem promoção", "price": 1000.0, "original_price": None,
             "permalink": "https://ml/x"},
            {"title": "Preço subiu (não é promo)", "price": 500.0, "original_price": 400.0,
             "permalink": "https://ml/y"},
        ]
    }

    def test_mantem_so_itens_com_desconto_real(self):
        promocoes = extrair_promocoes(self.resposta)
        assert len(promocoes) == 1
        assert promocoes[0]["titulo"] == "TV com desconto"

    def test_calcula_o_percentual_de_desconto(self):
        assert extrair_promocoes(self.resposta)[0]["desconto"] == 25

    def test_resposta_vazia_da_lista_vazia(self):
        assert extrair_promocoes({}) == []


class TestMenorPreco:
    def test_devolve_a_primeira_oferta(self):
        ofertas = [{"preco": 10}, {"preco": 20}]
        assert menor_preco(ofertas) == {"preco": 10}

    def test_sem_ofertas_devolve_none(self):
        assert menor_preco([]) is None
