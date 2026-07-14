package com.planify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Planify — organizador inteligente de planilhas.
 *
 * Você envia um arquivo bagunçado (CSV ou XLSX), diz o que quer fazer
 * (limpar, ordenar, remover duplicados, normalizar CEPs...) e recebe o
 * arquivo organizado de volta, junto com métricas do que foi feito.
 */
@SpringBootApplication
public class PlanifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlanifyApplication.class, args);
    }
}
