package com.planify.interfaces.rest;

import com.planify.application.OrganizarPlanilhaUseCase;
import com.planify.application.dto.OpcoesOrganizacaoDTO;
import com.planify.application.dto.OrganizacaoResponseDTO;
import com.planify.application.dto.ProcessamentoDTO;
import com.planify.domain.planilha.Planilha;
import com.planify.infrastructure.arquivo.LeitorDeArquivos;
import com.planify.infrastructure.persistencia.ProcessamentoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * INTERFACE (borda HTTP) — traduz requisições em DTOs e chama o caso de uso.
 * Nenhuma regra de negócio mora aqui: controller magro, domínio gordo.
 */
@RestController
@RequestMapping("/api")
public class PlanilhaController {

    private final OrganizarPlanilhaUseCase organizarPlanilha;
    private final LeitorDeArquivos leitor;
    private final ProcessamentoRepository historico;

    public PlanilhaController(OrganizarPlanilhaUseCase organizarPlanilha,
                              LeitorDeArquivos leitor,
                              ProcessamentoRepository historico) {
        this.organizarPlanilha = organizarPlanilha;
        this.leitor = leitor;
        this.historico = historico;
    }

    @GetMapping("/saude")
    public Map<String, Object> saude() {
        return Map.of("ok", true, "servico", "planify");
    }

    @PostMapping("/organizar")
    public ResponseEntity<?> organizar(
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

        String nome = arquivo.getOriginalFilename() == null ? "planilha" : arquivo.getOriginalFilename();
        Planilha planilha = leitor.ler(nome, arquivo.getInputStream());

        OpcoesOrganizacaoDTO opcoes = new OpcoesOrganizacaoDTO(
                limparEspacos, removerVazias, removerDuplicadas,
                colunaOrdenacao, ordemCrescente, colunaCep);

        OrganizacaoResponseDTO resposta = organizarPlanilha.executar(nome, planilha, opcoes);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/historico")
    public List<ProcessamentoDTO> ultimosProcessamentos() {
        return historico.findTop20ByOrderByProcessadoEmDesc()
                .stream()
                .map(ProcessamentoDTO::de)
                .toList();
    }
}
