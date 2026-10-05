package com.cospa.api.repository;

import com.cospa.api.model.TituloFinanceiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TituloFinanceiroRepository extends JpaRepository<TituloFinanceiro, Long> {
    List<TituloFinanceiro> findByTipoOrderByIdDesc(String tipo);
    Optional<TituloFinanceiro> findByViagemIdAndTipo(Long viagemId, String tipo);
    Optional<TituloFinanceiro> findByIdTitulo(String idTitulo); // Adicionado para busca segura
}