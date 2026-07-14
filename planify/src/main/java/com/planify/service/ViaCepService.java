package com.planify.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Integração com a API pública do ViaCEP (https://viacep.com.br).
 *
 * É o "enriquecimento" do Planify: se a planilha tem uma coluna de CEP,
 * o sistema padroniza o formato (00000-000) e ainda adiciona colunas de
 * cidade e UF preenchidas automaticamente.
 */
@Service
public class ViaCepService {

    private final RestTemplate http = new RestTemplate();

    /** Deixa o CEP no formato padrão 00000-000; devolve null se for inválido. */
    public String normalizarCep(String cepCru) {
        if (cepCru == null) {
            return null;
        }
        String somenteDigitos = cepCru.replaceAll("\\D", "");
        if (somenteDigitos.length() != 8) {
            return null;
        }
        return somenteDigitos.substring(0, 5) + "-" + somenteDigitos.substring(5);
    }

    /** Monta a URL de consulta do ViaCEP para um CEP já normalizado. */
    public String montarUrl(String cepNormalizado) {
        return "https://viacep.com.br/ws/" + cepNormalizado.replace("-", "") + "/json/";
    }

    /**
     * Consulta o ViaCEP. Devolve {cidade, uf} ou null se o CEP não existir
     * ou a API estiver indisponível — o processamento da planilha continua.
     */
    @SuppressWarnings("unchecked")
    public Map<String, String> buscarEndereco(String cepNormalizado) {
        try {
            Map<String, Object> resposta = http.getForObject(montarUrl(cepNormalizado), Map.class);
            if (resposta == null || Boolean.TRUE.equals(resposta.get("erro"))) {
                return null;
            }
            return Map.of(
                    "cidade", String.valueOf(resposta.getOrDefault("localidade", "")),
                    "uf", String.valueOf(resposta.getOrDefault("uf", ""))
            );
        } catch (RestClientException e) {
            return null;
        }
    }

    /**
     * Enriquece a planilha: normaliza a coluna de CEP e acrescenta duas colunas
     * novas ("Cidade (ViaCEP)" e "UF (ViaCEP)") no fim de cada linha.
     */
    public List<List<String>> enriquecerComCep(List<List<String>> linhas, int colunaCep) {
        if (linhas.isEmpty()) {
            return linhas;
        }
        List<List<String>> resultado = new ArrayList<>();

        List<String> cabecalho = new ArrayList<>(linhas.get(0));
        cabecalho.add("Cidade (ViaCEP)");
        cabecalho.add("UF (ViaCEP)");
        resultado.add(cabecalho);

        for (int i = 1; i < linhas.size(); i++) {
            List<String> linha = new ArrayList<>(linhas.get(i));
            String cep = colunaCep < linha.size() ? normalizarCep(linha.get(colunaCep)) : null;

            String cidade = "";
            String uf = "";
            if (cep != null) {
                linha.set(colunaCep, cep); // grava o CEP já padronizado
                Map<String, String> endereco = buscarEndereco(cep);
                if (endereco != null) {
                    cidade = endereco.get("cidade");
                    uf = endereco.get("uf");
                }
            }
            linha.add(cidade);
            linha.add(uf);
            resultado.add(linha);
        }
        return resultado;
    }
}
