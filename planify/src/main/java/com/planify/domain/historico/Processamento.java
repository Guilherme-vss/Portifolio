package com.planify.domain.historico;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

/**
 * DOMÍNIO — Entidade que registra cada planilha processada.
 *
 * Observação de arquitetura: num DDD purista a entidade não teria
 * anotações JPA (ficariam num "modelo de persistência" separado).
 * Aqui optamos pelo pragmatismo — o mapeamento direto evita uma camada
 * de conversão extra num domínio simples. O tradeoff está documentado.
 */
@Entity
public class Processamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomeArquivo;
    private String operacoes;        // ex.: "limpar-espacos remover-vazias ordenar:2"
    private int linhasAntes;
    private int linhasDepois;
    private int duplicadasRemovidas;
    private int vaziasRemovidas;
    private LocalDateTime processadoEm = LocalDateTime.now();

    protected Processamento() {
        // exigido pelo JPA
    }

    public Processamento(String nomeArquivo, String operacoes,
                         int linhasAntes, int linhasDepois,
                         int duplicadasRemovidas, int vaziasRemovidas) {
        this.nomeArquivo = nomeArquivo;
        this.operacoes = operacoes;
        this.linhasAntes = linhasAntes;
        this.linhasDepois = linhasDepois;
        this.duplicadasRemovidas = duplicadasRemovidas;
        this.vaziasRemovidas = vaziasRemovidas;
    }

    public Long getId() { return id; }
    public String getNomeArquivo() { return nomeArquivo; }
    public String getOperacoes() { return operacoes; }
    public int getLinhasAntes() { return linhasAntes; }
    public int getLinhasDepois() { return linhasDepois; }
    public int getDuplicadasRemovidas() { return duplicadasRemovidas; }
    public int getVaziasRemovidas() { return vaziasRemovidas; }
    public LocalDateTime getProcessadoEm() { return processadoEm; }
}
