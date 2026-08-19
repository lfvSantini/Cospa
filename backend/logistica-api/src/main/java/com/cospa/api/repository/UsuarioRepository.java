package com.cospa.api.repository;

import com.cospa.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Utilizado por AuthController e AutenticacaoService
    UserDetails findByUsername(String username);

    // Utilizado por SecurityFilter e TokenService
    UserDetails findByLogin(String login);
}