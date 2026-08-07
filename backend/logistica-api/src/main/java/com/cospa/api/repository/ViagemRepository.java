package com.cospa.api.repository;

import com.cospa.api.model.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ViagemRepository extends JpaRepository<Viagem, Long> {

    @Modifying
    @Transactional
    @Query(value = "UPDATE viagens SET id = :novoId WHERE id = :antigoId", nativeQuery = true)
    void atualizarId(@Param("antigoId") Long antigoId, @Param("novoId") Long novoId);
}