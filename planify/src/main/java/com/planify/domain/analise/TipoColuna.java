package com.planify.domain.analise;

/**
 * DOMÍNIO — o tipo de dado predominante de uma coluna.
 * É o vocabulário que um analista usa para decidir como tratar cada coluna.
 */
public enum TipoColuna {
    NUMERO,
    MOEDA,
    DATA,
    TEXTO,
    VAZIA
}
