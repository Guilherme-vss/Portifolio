package com.planify.application.dto;

import java.util.List;

/** APLICAÇÃO — DTO de saída: os dados organizados + CSV pronto + métricas. */
public record OrganizacaoResponseDTO(
        List<List<String>> linhas,
        String csv,
        MetricasDTO metricas
) {
}
