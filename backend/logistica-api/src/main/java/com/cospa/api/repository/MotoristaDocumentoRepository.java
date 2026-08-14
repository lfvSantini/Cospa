package com.cospa.api.repository;

import com.cospa.api.model.MotoristaDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MotoristaDocumentoRepository extends JpaRepository<MotoristaDocumento, Long> {
    List<MotoristaDocumento> findByMotoristaId(Long motoristaId);
}