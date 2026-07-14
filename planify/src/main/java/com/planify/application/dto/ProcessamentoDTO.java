package com.planify.application.dto;

import com.planify.domain.historico.Processamento;

import java.time.LocalDateTime;

/** APLICAÇÃO — DTO do histórico (a entidade JPA nunca sai para a borda HTTP). */
public record ProcessamentoDTO(
        Long id,
        String nomeArquivo,
        String operacoes,
        int linhasAntes,
        int linhasDepois,
        int duplicadasRemovidas,
        int vaziasRemovidas,
        LocalDateTime processadoEm
) {
    public static ProcessamentoDTO de(Processamento entidade) {
        return new ProcessamentoDTO(
                entidade.getId(),
                entidade.getNomeArquivo(),
                entidade.getOperacoes(),
                entidade.getLinhasAntes(),
                entidade.getLinhasDepois(),
                entidade.getDuplicadasRemovidas(),
                entidade.getVaziasRemovidas(),
                entidade.getProcessadoEm()
        );
    }
}
