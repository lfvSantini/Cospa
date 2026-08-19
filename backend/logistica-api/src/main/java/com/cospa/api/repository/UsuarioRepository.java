package com.cospa.api.repository;

import com.cospa.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Retorna Optional para suportar .orElseThrow() no AuthController e AutenticacaoService
    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByLogin(String login);

    // Método direto exigido pelo Spring Security (UserDetailsService)
    UserDetails findUserDetailsByLogin(String login);
    UserDetails findUserDetailsByUsername(String username);
}