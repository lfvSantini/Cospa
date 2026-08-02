package com.cospa.api.repository;

import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViagemRepository extends JpaRepository<Viagem, Long> {

    // Busca viagens por status
    List<Viagem> findByStatus(StatusViagem status);

    // Busca viagens pelo nome do motorista
    List<Viagem> findByNomeMotoristaContainingIgnoreCase(String nomeMotorista);
}