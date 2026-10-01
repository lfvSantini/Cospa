package com.cospa.api.repository;

import com.cospa.api.model.LocalCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalClienteRepository extends JpaRepository<LocalCliente, Long> {
    List<LocalCliente> findByClienteIdAndAtivoTrue(Long clienteId);
    List<LocalCliente> findByClienteNomeFantasiaIgnoreCaseAndAtivoTrue(String nomeFantasia);
    List<LocalCliente> findAllByOrderByNomeLocalAsc();
}