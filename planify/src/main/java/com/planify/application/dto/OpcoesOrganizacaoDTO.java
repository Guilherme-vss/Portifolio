package com.planify.application.dto;

/**
 * APLICAÇÃO — DTO de entrada: o que o usuário quer fazer com a planilha.
 *
 * DTOs isolam a borda (HTTP) do domínio: o controller conversa em DTO,
 * o domínio conversa em objetos ricos. Um não contamina o outro.
 */
public record OpcoesOrganizacaoDTO(
        boolean limparEspacos,
        boolean removerVazias,
        boolean removerDuplicadas,
        boolean removerColunasVazias,
        boolean textoEmTitulo,     // ana lima → Ana Lima
        String preencherVaziosCom, // "" = desligado
        int colunaOrdenacao,       // -1 = não ordenar
        boolean ordemCrescente,
        int colunaCep              // -1 = não normalizar CEPs
) {
    /** Opções padrão: só as limpezas básicas ligadas. */
    public static OpcoesOrganizacaoDTO padrao() {
        return new OpcoesOrganizacaoDTO(true, true, true, false, false, "", -1, true, -1);
    }
}
