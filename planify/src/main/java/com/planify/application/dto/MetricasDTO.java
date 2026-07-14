package com.planify.application.dto;

/** APLICAÇÃO — DTO com as métricas do processamento (o "antes e depois"). */
public record MetricasDTO(
        int linhasAntes,
        int linhasDepois,
        int vaziasRemovidas,
        int duplicadasRemovidas,
        Long idProcessamento
) {
}
