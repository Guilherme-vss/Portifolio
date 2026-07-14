package com.planify.repository;

import com.planify.model.Processamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Acesso ao histórico de processamentos (Spring Data faz o SQL por nós). */
public interface ProcessamentoRepository extends JpaRepository<Processamento, Long> {

    List<Processamento> findTop20ByOrderByProcessadoEmDesc();
}
