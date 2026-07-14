package com.planify.infrastructure.persistencia;

import com.planify.domain.historico.Processamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * INFRAESTRUTURA — Repositório do histórico (Spring Data gera o SQL).
 * A entidade é do domínio; o mecanismo de persistência fica aqui.
 */
public interface ProcessamentoRepository extends JpaRepository<Processamento, Long> {

    List<Processamento> findTop20ByOrderByProcessadoEmDesc();
}
