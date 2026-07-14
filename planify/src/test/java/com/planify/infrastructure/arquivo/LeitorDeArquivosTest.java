package com.planify.infrastructure.arquivo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Testes do adaptador de leitura de arquivos. */
class LeitorDeArquivosTest {

    private final LeitorDeArquivos leitor = new LeitorDeArquivos();

    @Test
    @DisplayName("Lê CSV separado por ponto-e-vírgula (padrão do Excel brasileiro)")
    void leCsvComPontoEVirgula() throws Exception {
        var entrada = new ByteArrayInputStream(
                "nome;idade\nAna;30\nBruno;25".getBytes(StandardCharsets.UTF_8));
        var planilha = leitor.lerCsv(entrada);

        assertEquals(3, planilha.totalDeLinhas());
        assertEquals(List.of("nome", "idade"), planilha.linhas().get(0));
        assertEquals(List.of("Bruno", "25"), planilha.linhas().get(2));
    }

    @Test
    @DisplayName("Lê CSV separado por vírgula quando não há ponto-e-vírgula")
    void leCsvComVirgula() throws Exception {
        var entrada = new ByteArrayInputStream("nome,idade\nAna,30".getBytes(StandardCharsets.UTF_8));
        assertEquals(List.of("Ana", "30"), leitor.lerCsv(entrada).linhas().get(1));
    }

    @Test
    @DisplayName("Escolhe o leitor de CSV para arquivos que não são .xlsx")
    void escolheLeitorPeloNome() throws Exception {
        var entrada = new ByteArrayInputStream("a;b".getBytes(StandardCharsets.UTF_8));
        assertEquals(1, leitor.ler("dados.csv", entrada).totalDeLinhas());
    }
}
