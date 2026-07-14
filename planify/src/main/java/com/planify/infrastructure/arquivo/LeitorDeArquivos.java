package com.planify.infrastructure.arquivo;

import com.planify.domain.planilha.Planilha;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * INFRAESTRUTURA — Adaptador de leitura de arquivos.
 *
 * Sabe transformar bytes (CSV ou XLSX) numa {@link Planilha} do domínio.
 * O domínio nunca toca em arquivo; esta classe é a fronteira.
 */
@Component
public class LeitorDeArquivos {

    /** Decide o leitor pelo nome do arquivo. */
    public Planilha ler(String nomeArquivo, InputStream entrada) throws IOException {
        if (nomeArquivo != null && nomeArquivo.toLowerCase().endsWith(".xlsx")) {
            return lerXlsx(entrada);
        }
        return lerCsv(entrada);
    }

    /** Lê um CSV (separado por vírgula ou ponto-e-vírgula). */
    public Planilha lerCsv(InputStream entrada) throws IOException {
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
        return Planilha.de(linhas);
    }

    /** Lê a primeira aba de um arquivo .xlsx. */
    public Planilha lerXlsx(InputStream entrada) throws IOException {
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
        return Planilha.de(linhas);
    }
}
