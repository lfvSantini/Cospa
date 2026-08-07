package com.cospa.api.repository;

import com.cospa.api.model.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MotoristaRepository extends JpaRepository<Motorista, Long> {
}