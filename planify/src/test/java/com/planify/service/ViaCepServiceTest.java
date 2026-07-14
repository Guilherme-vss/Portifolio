package com.planify.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Testes da parte pura da integração com o ViaCEP
 * (normalização de CEP e montagem de URL — sem chamadas de rede).
 */
class ViaCepServiceTest {

    private final ViaCepService servico = new ViaCepService();

    @Test
    @DisplayName("Formata CEP com 8 dígitos para o padrão 00000-000")
    void normalizaCepValido() {
        assertEquals("01310-100", servico.normalizarCep("01310100"));
        assertEquals("01310-100", servico.normalizarCep("01310-100"));
        assertEquals("01310-100", servico.normalizarCep(" 01.310-100 "));
    }

    @Test
    @DisplayName("CEP com quantidade errada de dígitos devolve null")
    void rejeitaCepInvalido() {
        assertNull(servico.normalizarCep("1234"));
        assertNull(servico.normalizarCep("123456789"));
        assertNull(servico.normalizarCep("abcdefgh"));
        assertNull(servico.normalizarCep(null));
    }

    @Test
    @DisplayName("Monta a URL do ViaCEP sem o hífen")
    void montaUrlDeConsulta() {
        assertEquals("https://viacep.com.br/ws/01310100/json/",
                servico.montarUrl("01310-100"));
    }
}
