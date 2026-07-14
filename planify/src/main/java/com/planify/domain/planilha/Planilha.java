package com.planify.domain.planilha;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * DOMÍNIO — Agregado raiz do Planify.
 *
 * Uma Planilha é imutável: cada operação devolve uma NOVA planilha,
 * o que torna as regras de negócio previsíveis e fáceis de testar.
 * Nada aqui conhece HTTP, banco ou arquivos — só a regra pura.
 */
public final class Planilha {

    private final List<List<String>> linhas;

    private Planilha(List<List<String>> linhas) {
        this.linhas = List.copyOf(linhas);
    }

    /** Fábrica: cria a planilha a partir das linhas lidas de um arquivo. */
    public static Planilha de(List<List<String>> linhas) {
        return new Planilha(linhas == null ? List.of() : linhas);
    }

    public List<List<String>> linhas() {
        return linhas;
    }

    public int totalDeLinhas() {
        return linhas.size();
    }

    /* ==================== Operações do domínio ==================== */

    /** Remove linhas totalmente vazias (o clássico "buraco" no meio da planilha). */
    public Planilha semLinhasVazias() {
        return new Planilha(linhas.stream()
                .filter(linha -> linha.stream().anyMatch(celula -> !celula.isBlank()))
                .toList());
    }

    /** Remove duplicadas ignorando maiúsculas/minúsculas, mantendo a primeira. */
    public Planilha semDuplicadas() {
        Set<String> vistas = new LinkedHashSet<>();
        List<List<String>> resultado = new ArrayList<>();
        for (List<String> linha : linhas) {
            String assinatura = String.join("", linha).toLowerCase(Locale.ROOT);
            if (vistas.add(assinatura)) {
                resultado.add(linha);
            }
        }
        return new Planilha(resultado);
    }

    /** Tira espaços duplicados e sobras de espaço em toda célula. */
    public Planilha comEspacosLimpos() {
        return new Planilha(linhas.stream()
                .map(linha -> linha.stream()
                        .map(celula -> celula.trim().replaceAll("\\s+", " "))
                        .toList())
                .toList());
    }

    /**
     * Ordena as linhas de dados (a primeira linha é o cabeçalho e fica no topo).
     * Números são comparados como números — "9" vem antes de "10", incluindo
     * o formato brasileiro "1.234,56".
     */
    public Planilha ordenadaPor(int coluna, boolean crescente) {
        if (linhas.size() <= 1) {
            return this;
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
        return new Planilha(resultado);
    }

    /** Gera o CSV final (ponto-e-vírgula, o padrão do Excel brasileiro). */
    public String paraCsv() {
        StringBuilder saida = new StringBuilder();
        for (List<String> linha : linhas) {
            saida.append(String.join(";", linha)).append("\n");
        }
        return saida.toString();
    }

    /* ==================== Apoio interno ==================== */

    private String valorDaColuna(List<String> linha, int coluna) {
        return coluna >= 0 && coluna < linha.size() ? linha.get(coluna) : "";
    }

    /** Tenta interpretar o texto como número (aceita vírgula decimal brasileira). */
    static Double tentarNumero(String texto) {
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
}
