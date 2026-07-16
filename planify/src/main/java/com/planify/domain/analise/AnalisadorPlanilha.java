package com.planify.domain.analise;

import com.planify.domain.planilha.Planilha;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * DOMÍNIO — serviço de análise de dados do Planify.
 *
 * Duas capacidades que um analista de dados usa o tempo todo:
 *  - {@link #perfilar} — o raio-X de cada coluna (tipo, preenchimento, únicos, estatísticas)
 *  - {@link #resumoFinanceiro} — consolida "valor por categoria" e o total
 *
 * Tudo função pura sobre a Planilha: sem banco, sem rede, 100% testável.
 */
public final class AnalisadorPlanilha {

    private AnalisadorPlanilha() {
    }

    /** Gera o perfil (profiling) de cada coluna da planilha. */
    public static List<PerfilColuna> perfilar(Planilha planilha) {
        List<List<String>> linhas = planilha.linhas();
        if (linhas.isEmpty()) {
            return List.of();
        }
        List<String> cabecalho = linhas.get(0);
        int totalColunas = cabecalho.size();
        List<PerfilColuna> perfis = new ArrayList<>();

        for (int coluna = 0; coluna < totalColunas; coluna++) {
            List<String> valores = new ArrayList<>();
            for (int i = 1; i < linhas.size(); i++) {
                List<String> linha = linhas.get(i);
                valores.add(coluna < linha.size() ? linha.get(coluna) : "");
            }
            perfis.add(perfilarColuna(cabecalho.get(coluna), valores));
        }
        return perfis;
    }

    private static PerfilColuna perfilarColuna(String nome, List<String> valores) {
        int total = valores.size();
        int vazias = 0;
        int numericas = 0;
        int monetarias = 0;
        int datas = 0;
        Set<String> distintos = new TreeSet<>();
        List<Double> numeros = new ArrayList<>();

        for (String valor : valores) {
            if (valor == null || valor.isBlank()) {
                vazias++;
                continue;
            }
            distintos.add(valor.trim().toLowerCase());
            if (valor.contains("R$")) {
                monetarias++;
            }
            Double numero = numeroOuNulo(valor);
            if (numero != null) {
                numericas++;
                numeros.add(numero);
            } else if (pareceData(valor)) {
                datas++;
            }
        }

        int preenchidas = total - vazias;
        TipoColuna tipo = classificar(preenchidas, numericas, monetarias, datas);

        Double minimo = null, maximo = null, media = null, soma = null;
        if (!numeros.isEmpty()) {
            minimo = numeros.stream().mapToDouble(Double::doubleValue).min().orElse(0);
            maximo = numeros.stream().mapToDouble(Double::doubleValue).max().orElse(0);
            soma = arredondar(numeros.stream().mapToDouble(Double::doubleValue).sum());
            media = arredondar(soma / numeros.size());
        }

        return new PerfilColuna(nome, tipo, total, preenchidas, vazias,
                distintos.size(), minimo, maximo, media, soma);
    }

    private static TipoColuna classificar(int preenchidas, int numericas, int monetarias, int datas) {
        if (preenchidas == 0) {
            return TipoColuna.VAZIA;
        }
        double metade = preenchidas / 2.0;
        if (monetarias > metade) {
            return TipoColuna.MOEDA;
        }
        if (numericas > metade) {
            return TipoColuna.NUMERO;
        }
        if (datas > metade) {
            return TipoColuna.DATA;
        }
        return TipoColuna.TEXTO;
    }

    /**
     * Consolida uma coluna de valores por uma coluna de categoria.
     * Ex.: categoria = "mercado/lazer/contas", valor = gastos → total por categoria.
     */
    public static ResumoFinanceiro resumoFinanceiro(Planilha planilha, int colunaCategoria, int colunaValor) {
        List<List<String>> linhas = planilha.linhas();
        if (linhas.size() <= 1 || colunaCategoria < 0 || colunaValor < 0) {
            return new ResumoFinanceiro("", "", List.of(), 0);
        }
        List<String> cabecalho = linhas.get(0);

        Map<String, double[]> acumulado = new LinkedHashMap<>(); // categoria -> [soma, contagem]
        double total = 0;

        for (int i = 1; i < linhas.size(); i++) {
            List<String> linha = linhas.get(i);
            String categoria = colunaCategoria < linha.size() ? linha.get(colunaCategoria).trim() : "";
            if (categoria.isBlank()) {
                categoria = "(sem categoria)";
            }
            Double valor = colunaValor < linha.size() ? numeroOuNulo(linha.get(colunaValor)) : null;
            if (valor == null) {
                continue;
            }
            double[] atual = acumulado.computeIfAbsent(categoria, k -> new double[2]);
            atual[0] += valor;
            atual[1] += 1;
            total += valor;
        }

        final double totalFinal = total;
        List<ResumoFinanceiro.Grupo> grupos = new ArrayList<>();
        acumulado.forEach((categoria, dados) -> grupos.add(new ResumoFinanceiro.Grupo(
                categoria,
                arredondar(dados[0]),
                (int) dados[1],
                totalFinal == 0 ? 0 : arredondar(dados[0] / totalFinal * 100)
        )));
        // do maior gasto para o menor — como todo relatório financeiro
        grupos.sort((a, b) -> Double.compare(b.soma(), a.soma()));

        return new ResumoFinanceiro(
                nomeColuna(cabecalho, colunaCategoria),
                nomeColuna(cabecalho, colunaValor),
                grupos,
                arredondar(total));
    }

    /* ==================== apoio ==================== */

    private static String nomeColuna(List<String> cabecalho, int indice) {
        return indice >= 0 && indice < cabecalho.size() ? cabecalho.get(indice) : "coluna " + indice;
    }

    /** Número aceitando o formato brasileiro e o cifrão (R$ 1.234,56 → 1234.56). */
    static Double numeroOuNulo(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        String limpo = texto.replace("R$", "").trim();
        try {
            return Double.valueOf(limpo.replace(".", "").replace(",", "."));
        } catch (NumberFormatException e) {
            try {
                return Double.valueOf(limpo);
            } catch (NumberFormatException ignorada) {
                return null;
            }
        }
    }

    private static boolean pareceData(String texto) {
        return texto.matches("\\d{1,4}[/\\-]\\d{1,2}[/\\-]\\d{1,4}");
    }

    private static double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}
