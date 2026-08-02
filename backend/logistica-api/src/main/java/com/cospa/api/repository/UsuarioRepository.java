package com.cospa.api.repository;

import com.cospa.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Buscar usuário pelo e-mail
    Optional<Usuario> findByEmail(String email);

    // Verificar se e-mail já foi cadastrado
    boolean existsByEmail(String email);
}