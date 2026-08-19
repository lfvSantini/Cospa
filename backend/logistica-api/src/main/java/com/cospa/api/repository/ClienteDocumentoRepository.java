package com.cospa.api.repository;

import com.cospa.api.model.ClienteDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteDocumentoRepository extends JpaRepository<ClienteDocumento, Long> {
    List<ClienteDocumento> findByClienteId(Long clienteId);
}