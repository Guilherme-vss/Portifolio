"""Testes do caçador multi-fonte (parte pura, sem rede)."""
from app.services.fontes import extrair_ml, links_de_lojas, montar_url_ml


class TestMercadoLivre:
    resposta = {
        "results": [
            {"title": "PS5 usado", "price": 2800.0, "permalink": "https://ml/b", "condition": "used"},
            {"title": "PS5 novo", "price": 3500.0, "permalink": "https://ml/a", "condition": "new"},
            {"title": "Sem preço", "permalink": "https://ml/c", "condition": "new"},
        ]
    }

    def test_extrai_com_fonte_e_link_direto(self):
        ofertas = extrair_ml(self.resposta)
        assert ofertas[0]["fonte"] == "Mercado Livre"
        assert ofertas[0]["link"] == "https://ml/b"       # link direto ao anúncio
        assert ofertas[0]["tipo"] == "produto"

    def test_ordena_do_mais_barato_e_ignora_sem_preco(self):
        ofertas = extrair_ml(self.resposta)
        assert [o["preco"] for o in ofertas] == [2800.0, 3500.0]

    def test_url_de_busca_ordena_por_preco(self):
        assert "sort=price_asc" in montar_url_ml("PlayStation 5")


class TestLinksDeLojas:
    def test_gera_link_por_loja_para_o_mesmo_termo(self):
        links = links_de_lojas("iPhone 15")
        fontes = {l["fonte"] for l in links}
        assert "Amazon" in fontes and "Magalu" in fontes and "OLX" in fontes
        # todo link é de BUSCA (sem preço único) e leva ao termo pesquisado
        assert all(l["preco"] is None for l in links)
        assert all("iPhone+15" in l["link"] for l in links)

    def test_imovel_usa_portais_imobiliarios_e_nao_varejo(self):
        links = links_de_lojas("Apartamento 2 dormitórios", categoria="imovel")
        fontes = {l["fonte"] for l in links}
        assert "VivaReal" in fontes and "ZAP Imóveis" in fontes
        assert "Amazon" not in fontes  # não faz sentido comprar apê na Amazon

    def test_link_ordena_por_menor_preco_quando_a_loja_permite(self):
        amazon = next(l for l in links_de_lojas("notebook i5") if l["fonte"] == "Amazon")
        assert "price-asc" in amazon["link"]
