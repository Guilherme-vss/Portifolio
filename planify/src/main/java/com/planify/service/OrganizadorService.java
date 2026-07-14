package com.planify.service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * O coração do Planify: todas as operações de organização de dados.
 *
 * As operações trabalham sobre uma estrutura simples — lista de linhas,
 * cada linha uma lista de células (String) — o que torna tudo aqui
 * testável sem arquivo, sem banco e sem rede.
 */
@Service
public class OrganizadorService {

    /* ==================== Leitura de arquivos ==================== */

    /** Lê um CSV (separado por vírgula ou ponto-e-vírgula) para a estrutura de linhas. */
    public List<List<String>> lerCsv(InputStream entrada) throws IOException {
        String conteudo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
        List<List<String>> linhas = new ArrayList<>();
        for (String linha : conteudo.split("\r?\n")) {
            // Detecta o separador mais comum em planilhas brasileiras: ";"
            String separador = linha.contains(";") ? ";" : ",";
            List<String> celulas = new ArrayList<>();
            for (String celula : linha.split(separador, -1)) {
                celulas.add(celula.trim());
            }
            linhas.add(celulas);
        }
        return linhas;
    }

    /** Lê a primeira aba de um arquivo .xlsx para a estrutura de linhas. */
    public List<List<String>> lerXlsx(InputStream entrada) throws IOException {
        List<List<String>> linhas = new ArrayList<>();
        DataFormatter formatador = new DataFormatter();
        try (XSSFWorkbook pasta = new XSSFWorkbook(entrada)) {
            Sheet aba = pasta.getSheetAt(0);
            for (Row linha : aba) {
                List<String> celulas = new ArrayList<>();
                short ultima = linha.getLastCellNum();
                for (int i = 0; i < ultima; i++) {
                    Cell celula = linha.getCell(i);
                    celulas.add(celula == null ? "" : formatador.formatCellValue(celula).trim());
                }
                linhas.add(celulas);
            }
        }
        return linhas;
    }

    /* ==================== Operações de limpeza ==================== */

    /** Remove linhas totalmente vazias (o clássico "buraco" no meio da planilha). */
    public List<List<String>> removerLinhasVazias(List<List<String>> linhas) {
        return linhas.stream()
                .filter(linha -> linha.stream().anyMatch(celula -> !celula.isBlank()))
                .toList();
    }

    /** Remove linhas duplicadas, mantendo a primeira ocorrência (o cabeçalho fica intacto). */
    public List<List<String>> removerDuplicadas(List<List<String>> linhas) {
        Set<String> vistas = new LinkedHashSet<>();
        List<List<String>> resultado = new ArrayList<>();
        for (List<String> linha : linhas) {
            String assinatura = String.join("", linha).toLowerCase(Locale.ROOT);
            if (vistas.add(assinatura)) {
                resultado.add(linha);
            }
        }
        return resultado;
    }

    /** Tira espaços duplicados e sobras de espaço em toda célula. */
    public List<List<String>> limparEspacos(List<List<String>> linhas) {
        return linhas.stream()
                .map(linha -> linha.stream()
                        .map(celula -> celula.trim().replaceAll("\\s+", " "))
                        .toList())
                .toList();
    }

    /**
     * Ordena pelas linhas de dados (a primeira linha é tratada como cabeçalho
     * e permanece no topo). Números são comparados como números — "9" vem
     * antes de "10", como qualquer pessoa espera.
     */
    public List<List<String>> ordenarPorColuna(List<List<String>> linhas, int coluna, boolean crescente) {
        if (linhas.size() <= 1) {
            return linhas;
        }
        List<List<String>> corpo = new ArrayList<>(linhas.subList(1, linhas.size()));

        Comparator<List<String>> comparador = Comparator.comparing(
                linha -> valorDaColuna(linha, coluna),
                (a, b) -> {
                    Double numA = tentarNumero(a);
                    Double numB = tentarNumero(b);
                    if (numA != null && numB != null) {
                        return numA.compareTo(numB);
                    }
                    return a.compareToIgnoreCase(b);
                });
        if (!crescente) {
            comparador = comparador.reversed();
        }
        corpo.sort(comparador);

        List<List<String>> resultado = new ArrayList<>();
        resultado.add(linhas.get(0));
        resultado.addAll(corpo);
        return resultado;
    }

    private String valorDaColuna(List<String> linha, int coluna) {
        return coluna >= 0 && coluna < linha.size() ? linha.get(coluna) : "";
    }

    /** Tenta interpretar o texto como número (aceita vírgula decimal brasileira). */
    Double tentarNumero(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        try {
            return Double.valueOf(texto.replace(".", "").replace(",", "."));
        } catch (NumberFormatException e) {
            try {
                return Double.valueOf(texto);
            } catch (NumberFormatException ignorada) {
                return null;
            }
        }
    }

    /* ==================== Escrita ==================== */

    /** Gera o CSV final (separado por ponto-e-vírgula, padrão do Excel brasileiro). */
    public String escreverCsv(List<List<String>> linhas) {
        StringBuilder saida = new StringBuilder();
        for (List<String> linha : linhas) {
            saida.append(String.join(";", linha)).append("\n");
        }
        return saida.toString();
    }
}
