package com.cospa.api.dto;

import jakarta.validation.constraints.NotBlank;

public record CadastroUsuarioDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O login é obrigatório")
        String login,

        @NotBlank(message = "A senha é obrigatória")
        String senha,

        String perfil
) {}