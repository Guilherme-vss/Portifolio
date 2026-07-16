package com.planify.domain.analise;

import java.util.List;

/**
 * DOMÍNIO — o resultado de uma consolidação financeira.
 *
 * Agrupa por uma coluna de categoria e soma uma coluna de valores —
 * a operação mais pedida por quem organiza finanças em planilha:
 * "quanto gastei por categoria neste mês?".
 */
public record ResumoFinanceiro(
        String colunaCategoria,
        String colunaValor,
        List<Grupo> grupos,
        double total
) {
    /** Um grupo do resumo: categoria + soma + fatia do total. */
    public record Grupo(String categoria, double soma, int itens, double percentual) {
    }
}
