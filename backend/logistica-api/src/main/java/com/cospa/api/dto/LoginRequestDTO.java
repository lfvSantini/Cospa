package com.cospa.api.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank String username,
        @NotBlank String senha
) {}