package com.cospa.api.dto;

import com.cospa.api.model.PerfilUsuario;
import com.cospa.api.model.Usuario;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String username,
        PerfilUsuario perfil
) {
    public UsuarioResponseDTO(Usuario u) {
        this(u.getId(), u.getNome(), u.getUsername(), u.getPerfil());
    }
}