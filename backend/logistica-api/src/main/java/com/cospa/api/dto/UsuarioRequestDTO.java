package com.cospa.api.dto;

import com.cospa.api.model.PerfilUsuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequestDTO(
        @NotBlank String nome,
        @NotBlank String username,
        @NotBlank String senha,
        @NotNull PerfilUsuario perfil
) {}