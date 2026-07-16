package com.planify.application;

import com.planify.application.dto.OpcoesOrganizacaoDTO;
import com.planify.application.portas.BuscadorDeEndereco;
import com.planify.domain.historico.Processamento;
import com.planify.domain.planilha.Planilha;
import com.planify.infrastructure.persistencia.ProcessamentoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Testes do caso de uso — a porta de endereços e o repositório são
 * substituídos por dublês: aqui interessa só a ORQUESTRAÇÃO.
 */
class OrganizarPlanilhaUseCaseTest {

    private final BuscadorDeEndereco buscadorFalso = cep ->
            Optional.of(new BuscadorDeEndereco.Endereco("São Paulo", "SP"));

    private ProcessamentoRepository repositorioFalso() {
        var repositorio = Mockito.mock(ProcessamentoRepository.class);
        when(repositorio.save(any())).thenAnswer(chamada -> chamada.getArgument(0));
        return repositorio;
    }

    /** Só a normalização de CEP na coluna informada, o resto desligado. */
    private OpcoesOrganizacaoDTO apenasCep(int colunaCep) {
        return new OpcoesOrganizacaoDTO(false, false, false, false, false, false, "",
                -1, -1, -1, -1, colunaCep, -1, true, -1, -1);
    }

    /** Só o resumo financeiro (categoria + valor). */
    private OpcoesOrganizacaoDTO apenasResumo(int colunaCategoria, int colunaValor) {
        return new OpcoesOrganizacaoDTO(false, false, false, false, false, false, "",
                -1, -1, -1, -1, -1, -1, true, colunaCategoria, colunaValor);
    }

    @Test
    @DisplayName("Aplica limpeza + duplicadas e mede as métricas corretas")
    void aplicaOperacoesEMedeMetricas() {
        var useCase = new OrganizarPlanilhaUseCase(buscadorFalso, repositorioFalso());
        var planilha = Planilha.de(List.of(
                List.of("nome"),
                List.of("Ana"),
                List.of("Ana"),
                List.of("")
        ));

        var resposta = useCase.executar("teste.csv", planilha, OpcoesOrganizacaoDTO.padrao());

        assertEquals(4, resposta.metricas().linhasAntes());
        assertEquals(2, resposta.metricas().linhasDepois());
        assertEquals(1, resposta.metricas().vaziasRemovidas());
        assertEquals(1, resposta.metricas().duplicadasRemovidas());
    }

    @Test
    @DisplayName("Enriquece a coluna de CEP com cidade e UF vindas da porta")
    void enriqueceComCep() {
        var useCase = new OrganizarPlanilhaUseCase(buscadorFalso, repositorioFalso());
        var planilha = Planilha.de(List.of(
                List.of("cliente", "cep"),
                List.of("Ana", "01310100")
        ));

        var resposta = useCase.executar("teste.csv", planilha, apenasCep(1));

        assertEquals(List.of("cliente", "cep", "Cidade (ViaCEP)", "UF (ViaCEP)"),
                resposta.linhas().get(0));
        assertEquals(List.of("Ana", "01310-100", "São Paulo", "SP"),
                resposta.linhas().get(1));
    }

    @Test
    @DisplayName("CEP inválido não quebra: cidade e UF ficam vazias")
    void cepInvalidoNaoQuebra() {
        var useCase = new OrganizarPlanilhaUseCase(buscadorFalso, repositorioFalso());
        var planilha = Planilha.de(List.of(
                List.of("cliente", "cep"),
                List.of("Bia", "999")
        ));

        var resposta = useCase.executar("teste.csv", planilha, apenasCep(1));

        assertEquals(List.of("Bia", "999", "", ""), resposta.linhas().get(1));
    }

    @Test
    @DisplayName("Sempre entrega o perfil (profiling) de todas as colunas")
    void geraPerfilDasColunas() {
        var useCase = new OrganizarPlanilhaUseCase(buscadorFalso, repositorioFalso());
        var planilha = Planilha.de(List.of(
                List.of("nome", "valor"),
                List.of("Ana", "100"),
                List.of("Bruno", "200")
        ));

        var resposta = useCase.executar("teste.csv", planilha, OpcoesOrganizacaoDTO.padrao());

        assertEquals(2, resposta.perfil().size());
        assertEquals("valor", resposta.perfil().get(1).nome());
        assertEquals(300.0, resposta.perfil().get(1).soma());
    }

    @Test
    @DisplayName("Resumo financeiro agrupa por categoria e soma os valores")
    void geraResumoFinanceiro() {
        var useCase = new OrganizarPlanilhaUseCase(buscadorFalso, repositorioFalso());
        var planilha = Planilha.de(List.of(
                List.of("categoria", "valor"),
                List.of("mercado", "100"),
                List.of("lazer", "50"),
                List.of("mercado", "R$ 30,00")
        ));

        var resposta = useCase.executar("teste.csv", planilha, apenasResumo(0, 1));

        assertEquals(180.0, resposta.resumoFinanceiro().total());
        // maior gasto primeiro: mercado (130) antes de lazer (50)
        assertEquals("mercado", resposta.resumoFinanceiro().grupos().get(0).categoria());
        assertEquals(130.0, resposta.resumoFinanceiro().grupos().get(0).soma());
    }
}
