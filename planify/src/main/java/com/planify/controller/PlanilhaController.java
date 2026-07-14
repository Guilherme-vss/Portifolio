package com.planify.controller;

import com.planify.model.Processamento;
import com.planify.repository.ProcessamentoRepository;
import com.planify.service.OrganizadorService;
import com.planify.service.ViaCepService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * API do Planify.
 *
 * POST /api/organizar  → envia o arquivo + o que você quer fazer, recebe
 *                        os dados organizados, o CSV pronto e as métricas.
 * GET  /api/historico  → últimos processamentos (guardados no MySQL).
 */
@RestController
@RequestMapping("/api")
public class PlanilhaController {

    private final OrganizadorService organizador;
    private final ViaCepService viaCep;
    private final ProcessamentoRepository historico;

    public PlanilhaController(OrganizadorService organizador,
                              ViaCepService viaCep,
                              ProcessamentoRepository historico) {
        this.organizador = organizador;
        this.viaCep = viaCep;
        this.historico = historico;
    }

    @GetMapping("/saude")
    public Map<String, Object> saude() {
        return Map.of("ok", true, "servico", "planify");
    }

    @PostMapping("/organizar")
    public ResponseEntity<Map<String, Object>> organizar(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(defaultValue = "true") boolean limparEspacos,
            @RequestParam(defaultValue = "true") boolean removerVazias,
            @RequestParam(defaultValue = "true") boolean removerDuplicadas,
            @RequestParam(defaultValue = "-1") int colunaOrdenacao,
            @RequestParam(defaultValue = "true") boolean ordemCrescente,
            @RequestParam(defaultValue = "-1") int colunaCep) throws IOException {

        if (arquivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Envie um arquivo CSV ou XLSX"));
        }

        // 1. Lê o arquivo no formato certo
        String nome = arquivo.getOriginalFilename() == null ? "planilha" : arquivo.getOriginalFilename();
        List<List<String>> linhas = nome.toLowerCase().endsWith(".xlsx")
                ? organizador.lerXlsx(arquivo.getInputStream())
                : organizador.lerCsv(arquivo.getInputStream());

        int linhasAntes = linhas.size();
        StringBuilder operacoes = new StringBuilder();

        // 2. Aplica as operações pedidas, medindo o efeito de cada uma
        if (limparEspacos) {
            linhas = organizador.limparEspacos(linhas);
            operacoes.append("limpar-espacos ");
        }

        int vaziasRemovidas = 0;
        if (removerVazias) {
            int antes = linhas.size();
            linhas = organizador.removerLinhasVazias(linhas);
            vaziasRemovidas = antes - linhas.size();
            operacoes.append("remover-vazias ");
        }

        int duplicadasRemovidas = 0;
        if (removerDuplicadas) {
            int antes = linhas.size();
            linhas = organizador.removerDuplicadas(linhas);
            duplicadasRemovidas = antes - linhas.size();
            operacoes.append("remover-duplicadas ");
        }

        if (colunaOrdenacao >= 0) {
            linhas = organizador.ordenarPorColuna(linhas, colunaOrdenacao, ordemCrescente);
            operacoes.append("ordenar:").append(colunaOrdenacao).append(" ");
        }

        if (colunaCep >= 0) {
            linhas = viaCep.enriquecerComCep(linhas, colunaCep);
            operacoes.append("viacep:").append(colunaCep).append(" ");
        }

        // 3. Guarda o processamento no histórico (MySQL)
        Processamento registro = historico.save(new Processamento(
                nome, operacoes.toString().trim(),
                linhasAntes, linhas.size(),
                duplicadasRemovidas, vaziasRemovidas));

        // 4. Devolve tudo: dados organizados, CSV pronto e métricas
        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("linhas", linhas);
        resposta.put("csv", organizador.escreverCsv(linhas));
        resposta.put("metricas", Map.of(
                "linhasAntes", linhasAntes,
                "linhasDepois", linhas.size(),
                "vaziasRemovidas", vaziasRemovidas,
                "duplicadasRemovidas", duplicadasRemovidas,
                "idProcessamento", registro.getId()));
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/historico")
    public List<Processamento> ultimosProcessamentos() {
        return historico.findTop20ByOrderByProcessadoEmDesc();
    }
}
