package com.planify.application.portas;

import com.planify.domain.planilha.Cep;

import java.util.Optional;

/**
 * APLICAÇÃO — Porta (interface) para consulta de endereço por CEP.
 *
 * O caso de uso depende desta abstração; quem resolve de verdade é a
 * infraestrutura (ViaCepClient). É a Inversão de Dependência do DDD/
 * arquitetura hexagonal: o núcleo não conhece a API externa.
 */
public interface BuscadorDeEndereco {

    Optional<Endereco> buscar(Cep cep);

    record Endereco(String cidade, String uf) {
    }
}
