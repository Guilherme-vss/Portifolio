package com.planify.infrastructure.viacep;

import com.planify.application.portas.BuscadorDeEndereco;
import com.planify.domain.planilha.Cep;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

/**
 * INFRAESTRUTURA — Adaptador da porta {@link BuscadorDeEndereco} usando
 * a API pública do ViaCEP (https://viacep.com.br).
 *
 * Se o serviço estiver fora do ar ou o CEP não existir, devolve vazio —
 * quem decide o que fazer com isso é o caso de uso.
 */
@Component
public class ViaCepClient implements BuscadorDeEndereco {

    private final RestTemplate http = new RestTemplate();

    /** Monta a URL de consulta — separado para ser testável sem rede. */
    public String montarUrl(Cep cep) {
        return "https://viacep.com.br/ws/" + cep.somenteDigitos() + "/json/";
    }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<Endereco> buscar(Cep cep) {
        try {
            Map<String, Object> resposta = http.getForObject(montarUrl(cep), Map.class);
            if (resposta == null || Boolean.TRUE.equals(resposta.get("erro"))) {
                return Optional.empty();
            }
            return Optional.of(new Endereco(
                    String.valueOf(resposta.getOrDefault("localidade", "")),
                    String.valueOf(resposta.getOrDefault("uf", ""))));
        } catch (RestClientException e) {
            return Optional.empty();
        }
    }
}
