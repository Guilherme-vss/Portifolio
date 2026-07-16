package com.planify.domain.analise;

/**
 * DOMÍNIO — o "raio-X" de uma coluna (data profiling).
 *
 * É o primeiro passo de qualquer trabalho sério com dados: antes de
 * organizar, você precisa saber o que tem. Para cada coluna, o Planify
 * calcula tipo, preenchimento, valores únicos e — quando numérica —
 * mínimo, máximo, média e soma.
 */
public record PerfilColuna(
        String nome,
        TipoColuna tipo,
        int total,
        int preenchidas,
        int vazias,
        int distintos,
        Double minimo,
        Double maximo,
        Double media,
        Double soma
) {
    /** Percentual de células preenchidas (qualidade de preenchimento). */
    public int percentualPreenchido() {
        return total == 0 ? 0 : Math.round((float) preenchidas / total * 100);
    }
}
