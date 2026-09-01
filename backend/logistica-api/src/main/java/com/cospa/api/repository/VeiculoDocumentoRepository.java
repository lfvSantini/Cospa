package com.cospa.api.repository;

import com.cospa.api.model.VeiculoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VeiculoDocumentoRepository extends JpaRepository<VeiculoDocumento, Long> {
    List<VeiculoDocumento> findByVeiculoId(Long veiculoId);
}