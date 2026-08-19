package com.cospa.api.repository;

import com.cospa.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Método necessário para o Spring Security e o SecurityFilter
    UserDetails findByLogin(String login);
}