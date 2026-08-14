package com.cospa.api.repository;

import com.cospa.api.model.Comprovante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComprovanteRepository extends JpaRepository<Comprovante, Long> {

    // Método para buscar todos os comprovantes de uma viagem específica
    List<Comprovante> findByViagemId(Long viagemId);
}