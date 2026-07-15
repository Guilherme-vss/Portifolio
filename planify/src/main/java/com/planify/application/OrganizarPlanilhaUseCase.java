package com.planify.application;

import com.planify.application.dto.MetricasDTO;
import com.planify.application.dto.OpcoesOrganizacaoDTO;
import com.planify.application.dto.OrganizacaoResponseDTO;
import com.planify.application.portas.BuscadorDeEndereco;
import com.planify.domain.historico.Processamento;
import com.planify.domain.planilha.Cep;
import com.planify.domain.planilha.Planilha;
import com.planify.infrastructure.persistencia.ProcessamentoRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * APLICAÇÃO — Caso de uso "Organizar Planilha".
 *
 * Orquestra o fluxo completo: aplica as operações do domínio na ordem
 * pedida, enriquece com CEP (via porta), grava o histórico e devolve
 * um DTO pronto para a borda HTTP. Toda regra de negócio fica no
 * domínio; aqui só há coordenação.
 */
@Service
public class OrganizarPlanilhaUseCase {

    private final BuscadorDeEndereco buscadorDeEndereco;
    private final ProcessamentoRepository historico;

    public OrganizarPlanilhaUseCase(BuscadorDeEndereco buscadorDeEndereco,
                                    ProcessamentoRepository historico) {
        this.buscadorDeEndereco = buscadorDeEndereco;
        this.historico = historico;
    }

    public OrganizacaoResponseDTO executar(String nomeArquivo,
                                           Planilha planilha,
                                           OpcoesOrganizacaoDTO opcoes) {
        int linhasAntes = planilha.totalDeLinhas();
        StringBuilder operacoes = new StringBuilder();

        if (opcoes.limparEspacos()) {
            planilha = planilha.comEspacosLimpos();
            operacoes.append("limpar-espacos ");
        }

        int vaziasRemovidas = 0;
        if (opcoes.removerVazias()) {
            int antes = planilha.totalDeLinhas();
            planilha = planilha.semLinhasVazias();
            vaziasRemovidas = antes - planilha.totalDeLinhas();
            operacoes.append("remover-vazias ");
        }

        int duplicadasRemovidas = 0;
        if (opcoes.removerDuplicadas()) {
            int antes = planilha.totalDeLinhas();
            planilha = planilha.semDuplicadas();
            duplicadasRemovidas = antes - planilha.totalDeLinhas();
            operacoes.append("remover-duplicadas ");
        }

        if (opcoes.removerColunasVazias()) {
            planilha = planilha.semColunasVazias();
            operacoes.append("remover-colunas-vazias ");
        }

        if (opcoes.textoEmTitulo()) {
            planilha = planilha.comTextoEmTitulo();
            operacoes.append("texto-titulo ");
        }

        if (opcoes.preencherVaziosCom() != null && !opcoes.preencherVaziosCom().isEmpty()) {
            planilha = planilha.comVaziosPreenchidos(opcoes.preencherVaziosCom());
            operacoes.append("preencher-vazios ");
        }

        if (opcoes.colunaOrdenacao() >= 0) {
            planilha = planilha.ordenadaPor(opcoes.colunaOrdenacao(), opcoes.ordemCrescente());
            operacoes.append("ordenar:").append(opcoes.colunaOrdenacao()).append(" ");
        }

        if (opcoes.colunaCep() >= 0) {
            planilha = enriquecerComCep(planilha, opcoes.colunaCep());
            operacoes.append("viacep:").append(opcoes.colunaCep()).append(" ");
        }

        Processamento registro = historico.save(new Processamento(
                nomeArquivo, operacoes.toString().trim(),
                linhasAntes, planilha.totalDeLinhas(),
                duplicadasRemovidas, vaziasRemovidas));

        return new OrganizacaoResponseDTO(
                planilha.linhas(),
                planilha.paraCsv(),
                new MetricasDTO(linhasAntes, planilha.totalDeLinhas(),
                        vaziasRemovidas, duplicadasRemovidas, registro.getId()));
    }

    /**
     * Normaliza a coluna de CEP e acrescenta colunas de cidade/UF preenchidas
     * pela porta de endereços. Se a consulta falhar, as colunas ficam vazias
     * — o processamento nunca para por causa de um serviço externo.
     */
    private Planilha enriquecerComCep(Planilha planilha, int colunaCep) {
        List<List<String>> linhas = planilha.linhas();
        if (linhas.isEmpty()) {
            return planilha;
        }
        List<List<String>> resultado = new ArrayList<>();

        List<String> cabecalho = new ArrayList<>(linhas.get(0));
        cabecalho.add("Cidade (ViaCEP)");
        cabecalho.add("UF (ViaCEP)");
        resultado.add(cabecalho);

        for (int i = 1; i < linhas.size(); i++) {
            List<String> linha = new ArrayList<>(linhas.get(i));
            Optional<Cep> cep = colunaCep < linha.size()
                    ? Cep.deTexto(linha.get(colunaCep))
                    : Optional.empty();

            String cidade = "";
            String uf = "";
            if (cep.isPresent()) {
                linha.set(colunaCep, cep.get().formatado());
                Optional<BuscadorDeEndereco.Endereco> endereco = buscadorDeEndereco.buscar(cep.get());
                if (endereco.isPresent()) {
                    cidade = endereco.get().cidade();
                    uf = endereco.get().uf();
                }
            }
            linha.add(cidade);
            linha.add(uf);
            resultado.add(linha);
        }
        return Planilha.de(resultado);
    }
}
