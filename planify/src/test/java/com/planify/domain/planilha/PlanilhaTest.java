package com.planify.domain.planilha;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Testes do agregado Planilha — o coração do domínio.
 * Rode com: mvn test
 */
class PlanilhaTest {

    @Test
    @DisplayName("Remove apenas as linhas totalmente vazias")
    void removeLinhasVazias() {
        var planilha = Planilha.de(List.of(
                List.of("nome", "idade"),
                List.of("", ""),
                List.of("Ana", ""),
                List.of("  ", "")
        ));
        var resultado = planilha.semLinhasVazias();

        assertEquals(2, resultado.totalDeLinhas());
        assertEquals("Ana", resultado.linhas().get(1).get(0));
    }

    @Test
    @DisplayName("Remove duplicadas ignorando maiúsculas/minúsculas, mantendo a primeira")
    void removeDuplicadas() {
        var planilha = Planilha.de(List.of(
                List.of("nome"),
                List.of("Ana"),
                List.of("ANA"),
                List.of("Bruno")
        ));
        var resultado = planilha.semDuplicadas();

        assertEquals(3, resultado.totalDeLinhas());
        assertEquals("Ana", resultado.linhas().get(1).get(0));
    }

    @Test
    @DisplayName("Colapsa espaços duplicados dentro das células")
    void limpaEspacos() {
        var planilha = Planilha.de(List.of(List.of("  Ana   Maria  ", "São    Paulo")));
        var resultado = planilha.comEspacosLimpos();

        assertEquals("Ana Maria", resultado.linhas().get(0).get(0));
        assertEquals("São Paulo", resultado.linhas().get(0).get(1));
    }

    @Test
    @DisplayName("Ordena os dados mantendo o cabeçalho no topo")
    void ordenaMantendoCabecalho() {
        var planilha = Planilha.de(List.of(
                List.of("nome", "idade"),
                List.of("Carla", "40"),
                List.of("Ana", "30"),
                List.of("Bruno", "25")
        ));
        var resultado = planilha.ordenadaPor(0, true);

        assertEquals("nome", resultado.linhas().get(0).get(0));
        assertEquals("Ana", resultado.linhas().get(1).get(0));
        assertEquals("Carla", resultado.linhas().get(3).get(0));
    }

    @Test
    @DisplayName("Ordena números como números: 9 vem antes de 10")
    void ordenaNumerosComoNumeros() {
        var planilha = Planilha.de(List.of(
                List.of("valor"), List.of("10"), List.of("9"), List.of("100")
        ));
        var resultado = planilha.ordenadaPor(0, true);

        assertEquals("9", resultado.linhas().get(1).get(0));
        assertEquals("10", resultado.linhas().get(2).get(0));
        assertEquals("100", resultado.linhas().get(3).get(0));
    }

    @Test
    @DisplayName("Ordem decrescente inverte o resultado")
    void ordenaDecrescente() {
        var planilha = Planilha.de(List.of(List.of("nome"), List.of("Ana"), List.of("Bruno")));
        assertEquals("Bruno", planilha.ordenadaPor(0, false).linhas().get(1).get(0));
    }

    @Test
    @DisplayName("As operações não modificam a planilha original (imutabilidade)")
    void operacoesSaoImutaveis() {
        var original = Planilha.de(List.of(List.of("nome"), List.of(""), List.of("Ana")));
        original.semLinhasVazias();
        assertEquals(3, original.totalDeLinhas());
    }

    @Test
    @DisplayName("Entende número com vírgula decimal brasileira (1.234,56)")
    void entendeNumeroBrasileiro() {
        assertEquals(1234.56, Planilha.tentarNumero("1.234,56"));
    }

    @Test
    @DisplayName("Texto que não é número devolve null")
    void textoNaoENumero() {
        assertNull(Planilha.tentarNumero("abacaxi"));
        assertNull(Planilha.tentarNumero(""));
        assertNull(Planilha.tentarNumero(null));
    }

    @Test
    @DisplayName("Remove colunas em que todos os dados estão vazios")
    void removeColunasVazias() {
        var planilha = Planilha.de(List.of(
                List.of("nome", "obsoleto", "idade"),
                List.of("Ana", "", "30"),
                List.of("Bruno", "  ", "25")
        ));
        var resultado = planilha.semColunasVazias();

        assertEquals(List.of("nome", "idade"), resultado.linhas().get(0));
        assertEquals(List.of("Ana", "30"), resultado.linhas().get(1));
    }

    @Test
    @DisplayName("Padroniza texto em Título sem mexer em números nem no cabeçalho")
    void textoEmTitulo() {
        var planilha = Planilha.de(List.of(
                List.of("nome", "valor"),
                List.of("ana maria-souza", "1.234,56")
        ));
        var resultado = planilha.comTextoEmTitulo();

        assertEquals("nome", resultado.linhas().get(0).get(0));
        assertEquals("Ana Maria-Souza", resultado.linhas().get(1).get(0));
        assertEquals("1.234,56", resultado.linhas().get(1).get(1));
    }

    @Test
    @DisplayName("Preenche células vazias das linhas de dados com o valor padrão")
    void preencheVazios() {
        var planilha = Planilha.de(List.of(
                List.of("nome", "cidade"),
                List.of("Ana", "")
        ));
        var resultado = planilha.comVaziosPreenchidos("—");

        assertEquals("—", resultado.linhas().get(1).get(1));
        assertEquals("nome", resultado.linhas().get(0).get(0)); // cabeçalho intacto
    }

    @Test
    @DisplayName("Gera CSV com ponto-e-vírgula e uma linha por registro")
    void escreveCsv() {
        var planilha = Planilha.de(List.of(List.of("nome", "idade"), List.of("Ana", "30")));
        assertEquals("nome;idade\nAna;30\n", planilha.paraCsv());
    }
}
