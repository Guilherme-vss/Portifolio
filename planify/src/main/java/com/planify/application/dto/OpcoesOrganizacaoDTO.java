package com.planify.application.dto;

/**
 * APLICAÇÃO — DTO de entrada: o que o usuário quer fazer com a planilha.
 *
 * DTOs isolam a borda (HTTP) do domínio: o controller conversa em DTO,
 * o domínio conversa em objetos ricos. Um não contamina o outro.
 *
 * Colunas usam índice a partir de 0; -1 desliga a operação.
 */
public record OpcoesOrganizacaoDTO(
        // limpeza
        boolean limparEspacos,
        boolean removerVazias,
        boolean removerDuplicadas,
        boolean removerColunasVazias,
        boolean removerAcentos,
        boolean textoEmTitulo,
        String preencherVaziosCom,
        // normalização por coluna
        int colunaMoeda,
        int colunaData,
        int colunaMaiuscula,
        int colunaMinuscula,
        int colunaCep,
        // ordenação
        int colunaOrdenacao,
        boolean ordemCrescente,
        // análise financeira (agrupa colunaCategoria e soma colunaValor)
        int colunaCategoria,
        int colunaValor
) {
    /** Opções padrão: só as limpezas básicas ligadas, nada de análise. */
    public static OpcoesOrganizacaoDTO padrao() {
        return new OpcoesOrganizacaoDTO(
                true, true, true, false, false, false, "",
                -1, -1, -1, -1, -1,
                -1, true,
                -1, -1);
    }
}
