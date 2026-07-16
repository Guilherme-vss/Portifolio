package com.planify.application.dto;

import com.planify.domain.analise.PerfilColuna;
import com.planify.domain.analise.ResumoFinanceiro;

import java.util.List;

/**
 * APLICAÇÃO — DTO de saída: os dados organizados + CSV pronto + métricas,
 * mais a análise que um especialista em dados espera: o perfil de cada
 * coluna e (quando pedido) o resumo financeiro por categoria.
 */
public record OrganizacaoResponseDTO(
        List<List<String>> linhas,
        String csv,
        MetricasDTO metricas,
        List<PerfilColuna> perfil,
        ResumoFinanceiro resumoFinanceiro
) {
}
