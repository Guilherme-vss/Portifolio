package com.planify.domain.planilha;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Testes do Objeto de Valor Cep. */
class CepTest {

    @Test
    @DisplayName("Aceita CEP com ou sem máscara e formata para 00000-000")
    void aceitaFormatosVariados() {
        assertEquals("01310-100", Cep.deTexto("01310100").orElseThrow().formatado());
        assertEquals("01310-100", Cep.deTexto("01310-100").orElseThrow().formatado());
        assertEquals("01310-100", Cep.deTexto(" 01.310-100 ").orElseThrow().formatado());
    }

    @Test
    @DisplayName("CEP inválido não vira objeto — devolve Optional vazio")
    void rejeitaCepInvalido() {
        assertTrue(Cep.deTexto("1234").isEmpty());
        assertTrue(Cep.deTexto("123456789").isEmpty());
        assertTrue(Cep.deTexto("abcdefgh").isEmpty());
        assertTrue(Cep.deTexto(null).isEmpty());
    }

    @Test
    @DisplayName("Expõe só os dígitos para as APIs de consulta")
    void expoeSomenteDigitos() {
        assertEquals("01310100", Cep.deTexto("01310-100").orElseThrow().somenteDigitos());
    }

    @Test
    @DisplayName("Dois CEPs com os mesmos dígitos são iguais (semântica de VO)")
    void igualdadePorValor() {
        assertEquals(Cep.deTexto("01310100").orElseThrow(), Cep.deTexto("01310-100").orElseThrow());
    }
}
