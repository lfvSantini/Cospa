package com.cospa.api.repository;

import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ViagemRepository extends JpaRepository<Viagem, Long> {

    List<Viagem> findByStatus(StatusViagem status);

    List<Viagem> findByStatusIn(List<StatusViagem> statuses);

    List<Viagem> findAllByOrderByIdDesc();

    @Modifying
    @Transactional
    @Query(value = "UPDATE viagens SET id = :novoId WHERE id = :antigoId", nativeQuery = true)
    void atualizarId(@Param("antigoId") Long antigoId, @Param("novoId") Long novoId);
}