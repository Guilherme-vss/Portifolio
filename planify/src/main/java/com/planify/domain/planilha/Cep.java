package com.planify.domain.planilha;

import java.util.Optional;

/**
 * DOMÍNIO — Objeto de Valor (Value Object) que representa um CEP válido.
 *
 * Um Cep só existe se for válido: a fábrica {@link #deTexto} devolve
 * Optional.empty() para entradas quebradas. Assim, quem recebe um Cep
 * nunca precisa revalidar — é a essência de um VO no DDD.
 */
public final class Cep {

    private final String digitos; // sempre 8 dígitos, sem máscara

    private Cep(String digitos) {
        this.digitos = digitos;
    }

    /** Fábrica: aceita "01310100", "01310-100", " 01.310-100 "... */
    public static Optional<Cep> deTexto(String texto) {
        if (texto == null) {
            return Optional.empty();
        }
        String somenteDigitos = texto.replaceAll("\\D", "");
        if (somenteDigitos.length() != 8) {
            return Optional.empty();
        }
        return Optional.of(new Cep(somenteDigitos));
    }

    /** Formato padrão brasileiro: 00000-000. */
    public String formatado() {
        return digitos.substring(0, 5) + "-" + digitos.substring(5);
    }

    /** Só os dígitos — o formato que as APIs de consulta esperam. */
    public String somenteDigitos() {
        return digitos;
    }

    @Override
    public boolean equals(Object outro) {
        return outro instanceof Cep cep && cep.digitos.equals(digitos);
    }

    @Override
    public int hashCode() {
        return digitos.hashCode();
    }

    @Override
    public String toString() {
        return formatado();
    }
}
