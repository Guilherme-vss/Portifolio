package com.planify.domain.planilha;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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

    /** Remove colunas em que TODAS as células de dados estão vazias. */
    public Planilha semColunasVazias() {
        if (linhas.isEmpty()) {
            return this;
        }
        int totalColunas = linhas.stream().mapToInt(List::size).max().orElse(0);
        List<Integer> colunasUteis = new ArrayList<>();
        for (int coluna = 0; coluna < totalColunas; coluna++) {
            for (int linha = 1; linha < linhas.size(); linha++) {
                if (!valorDaColuna(linhas.get(linha), coluna).isBlank()) {
                    colunasUteis.add(coluna);
                    break;
                }
            }
            // planilha só com cabeçalho: preserva todas as colunas
            if (linhas.size() == 1 && !valorDaColuna(linhas.get(0), coluna).isBlank()) {
                colunasUteis.add(coluna);
            }
        }
        final List<Integer> mantidas = colunasUteis;
        return new Planilha(linhas.stream()
                .map(linha -> mantidas.stream().map(c -> valorDaColuna(linha, c)).toList())
                .toList());
    }

    /** Deixa o texto das células de dados em formato Título (ana lima → Ana Lima). */
    public Planilha comTextoEmTitulo() {
        if (linhas.size() <= 1) {
            return this;
        }
        List<List<String>> resultado = new ArrayList<>();
        resultado.add(linhas.get(0));
        for (int i = 1; i < linhas.size(); i++) {
            resultado.add(linhas.get(i).stream().map(Planilha::paraTitulo).toList());
        }
        return new Planilha(resultado);
    }

    static String paraTitulo(String texto) {
        if (texto == null || texto.isBlank() || tentarNumero(texto) != null) {
            return texto; // números e vazios ficam como estão
        }
        StringBuilder saida = new StringBuilder(texto.length());
        boolean inicioDePalavra = true;
        for (char letra : texto.toLowerCase(Locale.ROOT).toCharArray()) {
            saida.append(inicioDePalavra ? Character.toUpperCase(letra) : letra);
            inicioDePalavra = letra == ' ' || letra == '-';
        }
        return saida.toString();
    }

    /** Preenche células vazias das linhas de dados com um valor padrão. */
    public Planilha comVaziosPreenchidos(String valorPadrao) {
        if (linhas.size() <= 1 || valorPadrao == null || valorPadrao.isEmpty()) {
            return this;
        }
        List<List<String>> resultado = new ArrayList<>();
        resultado.add(linhas.get(0));
        for (int i = 1; i < linhas.size(); i++) {
            resultado.add(linhas.get(i).stream()
                    .map(celula -> celula.isBlank() ? valorPadrao : celula)
                    .toList());
        }
        return new Planilha(resultado);
    }

    /** Remove acentos das células de dados (café → cafe) — ótimo para chaves e buscas. */
    public Planilha semAcentos() {
        return mapearDados(Planilha::tirarAcentos);
    }

    /** Coloca uma coluna específica em MAIÚSCULAS (ex.: padronizar UF, siglas). */
    public Planilha comColunaMaiuscula(int coluna) {
        return mapearColuna(coluna, texto -> texto.toUpperCase(Locale.ROOT));
    }

    /** Coloca uma coluna específica em minúsculas (ex.: padronizar e-mails). */
    public Planilha comColunaMinuscula(int coluna) {
        return mapearColuna(coluna, texto -> texto.toLowerCase(Locale.ROOT));
    }

    /**
     * Normaliza uma coluna de dinheiro: "R$ 1.234,56", "1234,56", "1.234" viram
     * todos "1234.56" — o formato que qualquer ferramenta de dados entende.
     * Células que não são dinheiro ficam intactas.
     */
    public Planilha comMoedaNormalizada(int coluna) {
        return mapearColuna(coluna, texto -> {
            Double valor = tentarNumero(texto.replace("R$", "").trim());
            return valor == null ? texto : String.format(Locale.US, "%.2f", valor);
        });
    }

    /**
     * Normaliza uma coluna de datas para o padrão ISO (AAAA-MM-DD).
     * Entende os formatos brasileiros mais comuns: dd/MM/yyyy, dd-MM-yyyy,
     * dd/MM/yy e a própria ISO. O que não for data reconhecível fica igual.
     */
    public Planilha comDatasNormalizadas(int coluna) {
        return mapearColuna(coluna, Planilha::normalizarData);
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

    /** Aplica uma transformação a todas as células de dados (preserva o cabeçalho). */
    private Planilha mapearDados(java.util.function.UnaryOperator<String> transformacao) {
        if (linhas.size() <= 1) {
            return this;
        }
        List<List<String>> resultado = new ArrayList<>();
        resultado.add(linhas.get(0));
        for (int i = 1; i < linhas.size(); i++) {
            resultado.add(linhas.get(i).stream().map(transformacao).toList());
        }
        return new Planilha(resultado);
    }

    /** Aplica uma transformação só a UMA coluna das linhas de dados. */
    private Planilha mapearColuna(int coluna, java.util.function.UnaryOperator<String> transformacao) {
        if (linhas.size() <= 1 || coluna < 0) {
            return this;
        }
        List<List<String>> resultado = new ArrayList<>();
        resultado.add(linhas.get(0));
        for (int i = 1; i < linhas.size(); i++) {
            List<String> linha = new ArrayList<>(linhas.get(i));
            if (coluna < linha.size() && !linha.get(coluna).isBlank()) {
                linha.set(coluna, transformacao.apply(linha.get(coluna)));
            }
            resultado.add(linha);
        }
        return new Planilha(resultado);
    }

    static String tirarAcentos(String texto) {
        if (texto == null || texto.isBlank()) {
            return texto;
        }
        String decomposto = Normalizer.normalize(texto, Normalizer.Form.NFD);
        return decomposto.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final List<DateTimeFormatter> FORMATOS_DATA = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yy"),
            ISO
    );

    static String normalizarData(String texto) {
        String limpo = texto.trim();
        for (DateTimeFormatter formato : FORMATOS_DATA) {
            try {
                return LocalDate.parse(limpo, formato).format(ISO);
            } catch (Exception ignorada) {
                // tenta o próximo formato
            }
        }
        return texto; // não é uma data reconhecível
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
