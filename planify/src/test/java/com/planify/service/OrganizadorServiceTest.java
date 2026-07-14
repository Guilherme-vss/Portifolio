package com.planify.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Testes unitários do coração do Planify — as operações de organização.
 * Rode com: mvn test
 */
class OrganizadorServiceTest {

    private final OrganizadorService servico = new OrganizadorService();

    /* ---------- Leitura de CSV ---------- */

    @Test
    @DisplayName("Lê CSV separado por ponto-e-vírgula (padrão do Excel brasileiro)")
    void leCsvComPontoEVirgula() throws Exception {
        var entrada = new ByteArrayInputStream(
                "nome;idade\nAna;30\nBruno;25".getBytes(StandardCharsets.UTF_8));
        List<List<String>> linhas = servico.lerCsv(entrada);

        assertEquals(3, linhas.size());
        assertEquals(List.of("nome", "idade"), linhas.get(0));
        assertEquals(List.of("Bruno", "25"), linhas.get(2));
    }

    @Test
    @DisplayName("Lê CSV separado por vírgula quando não há ponto-e-vírgula")
    void leCsvComVirgula() throws Exception {
        var entrada = new ByteArrayInputStream("nome,idade\nAna,30".getBytes(StandardCharsets.UTF_8));
        assertEquals(List.of("Ana", "30"), servico.lerCsv(entrada).get(1));
    }

    /* ---------- Limpeza ---------- */

    @Test
    @DisplayName("Remove apenas as linhas totalmente vazias")
    void removeLinhasVazias() {
        var linhas = List.of(
                List.of("nome", "idade"),
                List.of("", ""),
                List.of("Ana", ""),
                List.of("  ", "")
        );
        var resultado = servico.removerLinhasVazias(linhas);

        assertEquals(2, resultado.size());
        assertEquals("Ana", resultado.get(1).get(0));
    }

    @Test
    @DisplayName("Remove duplicadas ignorando maiúsculas/minúsculas, mantendo a primeira")
    void removeDuplicadas() {
        var linhas = List.of(
                List.of("nome"),
                List.of("Ana"),
                List.of("ANA"),
                List.of("Bruno")
        );
        var resultado = servico.removerDuplicadas(linhas);

        assertEquals(3, resultado.size());
        assertEquals("Ana", resultado.get(1).get(0)); // a primeira ocorrência fica
    }

    @Test
    @DisplayName("Colapsa espaços duplicados dentro das células")
    void limpaEspacos() {
        var linhas = List.of(List.of("  Ana   Maria  ", "São    Paulo"));
        var resultado = servico.limparEspacos(linhas);

        assertEquals("Ana Maria", resultado.get(0).get(0));
        assertEquals("São Paulo", resultado.get(0).get(1));
    }

    /* ---------- Ordenação ---------- */

    @Test
    @DisplayName("Ordena os dados mantendo o cabeçalho no topo")
    void ordenaMantendoCabecalho() {
        var linhas = List.of(
                List.of("nome", "idade"),
                List.of("Carla", "40"),
                List.of("Ana", "30"),
                List.of("Bruno", "25")
        );
        var resultado = servico.ordenarPorColuna(linhas, 0, true);

        assertEquals("nome", resultado.get(0).get(0));
        assertEquals("Ana", resultado.get(1).get(0));
        assertEquals("Carla", resultado.get(3).get(0));
    }

    @Test
    @DisplayName("Ordena números como números: 9 vem antes de 10")
    void ordenaNumerosComoNumeros() {
        var linhas = List.of(
                List.of("valor"),
                List.of("10"),
                List.of("9"),
                List.of("100")
        );
        var resultado = servico.ordenarPorColuna(linhas, 0, true);

        assertEquals("9", resultado.get(1).get(0));
        assertEquals("10", resultado.get(2).get(0));
        assertEquals("100", resultado.get(3).get(0));
    }

    @Test
    @DisplayName("Ordem decrescente inverte o resultado")
    void ordenaDecrescente() {
        var linhas = List.of(List.of("nome"), List.of("Ana"), List.of("Bruno"));
        var resultado = servico.ordenarPorColuna(linhas, 0, false);
        assertEquals("Bruno", resultado.get(1).get(0));
    }

    /* ---------- Conversão de números ---------- */

    @Test
    @DisplayName("Entende número com vírgula decimal brasileira (1.234,56)")
    void entendeNumeroBrasileiro() {
        assertEquals(1234.56, servico.tentarNumero("1.234,56"));
    }

    @Test
    @DisplayName("Texto que não é número devolve null")
    void textoNaoENumero() {
        assertNull(servico.tentarNumero("abacaxi"));
        assertNull(servico.tentarNumero(""));
        assertNull(servico.tentarNumero(null));
    }

    /* ---------- Escrita ---------- */

    @Test
    @DisplayName("Gera CSV com ponto-e-vírgula e uma linha por registro")
    void escreveCsv() {
        var linhas = List.of(List.of("nome", "idade"), List.of("Ana", "30"));
        assertEquals("nome;idade\nAna;30\n", servico.escreverCsv(linhas));
    }
}
