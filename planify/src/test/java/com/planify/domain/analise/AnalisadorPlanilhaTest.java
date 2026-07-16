package com.planify.domain.analise;

import com.planify.domain.planilha.Planilha;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Testes do analisador de dados: profiling e resumo financeiro. */
class AnalisadorPlanilhaTest {

    @Test
    @DisplayName("Perfila cada coluna com tipo, preenchimento e estatísticas")
    void perfilaColunas() {
        var planilha = Planilha.de(List.of(
                List.of("nome", "valor"),
                List.of("Ana", "100"),
                List.of("Bruno", ""),
                List.of("Carla", "300")
        ));

        var perfil = AnalisadorPlanilha.perfilar(planilha);

        assertEquals(2, perfil.size());

        var nome = perfil.get(0);
        assertEquals(TipoColuna.TEXTO, nome.tipo());
        assertEquals(3, nome.preenchidas());
        assertEquals(3, nome.distintos());

        var valor = perfil.get(1);
        assertEquals(TipoColuna.NUMERO, valor.tipo());
        assertEquals(1, valor.vazias());
        assertEquals(100.0, valor.minimo());
        assertEquals(300.0, valor.maximo());
        assertEquals(400.0, valor.soma());
        assertEquals(200.0, valor.media());
        assertEquals(67, valor.percentualPreenchido()); // 2 de 3
    }

    @Test
    @DisplayName("Detecta coluna de moeda pelo R$ predominante")
    void detectaColunaDeMoeda() {
        var planilha = Planilha.de(List.of(
                List.of("preco"),
                List.of("R$ 100,00"),
                List.of("R$ 250,50")
        ));

        assertEquals(TipoColuna.MOEDA, AnalisadorPlanilha.perfilar(planilha).get(0).tipo());
    }

    @Test
    @DisplayName("Detecta coluna de data pelo padrão dd/MM/yyyy")
    void detectaColunaDeData() {
        var planilha = Planilha.de(List.of(
                List.of("vencimento"),
                List.of("05/03/2026"),
                List.of("15/12/2026")
        ));

        assertEquals(TipoColuna.DATA, AnalisadorPlanilha.perfilar(planilha).get(0).tipo());
    }

    @Test
    @DisplayName("Resumo financeiro soma por categoria, do maior para o menor")
    void resumoFinanceiro() {
        var planilha = Planilha.de(List.of(
                List.of("categoria", "gasto"),
                List.of("mercado", "400"),
                List.of("lazer", "120"),
                List.of("mercado", "R$ 100,00"),
                List.of("contas", "300")
        ));

        var resumo = AnalisadorPlanilha.resumoFinanceiro(planilha, 0, 1);

        assertEquals(920.0, resumo.total());
        assertEquals(3, resumo.grupos().size());
        // mercado (500) > contas (300) > lazer (120)
        assertEquals("mercado", resumo.grupos().get(0).categoria());
        assertEquals(500.0, resumo.grupos().get(0).soma());
        assertEquals(2, resumo.grupos().get(0).itens());
        assertEquals("lazer", resumo.grupos().get(2).categoria());
    }

    @Test
    @DisplayName("Valores sem categoria caem em '(sem categoria)'")
    void categoriaVaziaTemRotulo() {
        var planilha = Planilha.de(List.of(
                List.of("categoria", "valor"),
                List.of("", "50")
        ));

        var resumo = AnalisadorPlanilha.resumoFinanceiro(planilha, 0, 1);

        assertEquals("(sem categoria)", resumo.grupos().get(0).categoria());
    }
}
