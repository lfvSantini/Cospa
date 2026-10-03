package com.cospa.api.repository;

import com.cospa.api.model.LancamentoFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LancamentoFinanceiroRepository extends JpaRepository<LancamentoFinanceiro, Long> {
    List<LancamentoFinanceiro> findAllByOrderByIdDesc();
    List<LancamentoFinanceiro> findByTituloIdOrderByIdAsc(Long tituloId);
}