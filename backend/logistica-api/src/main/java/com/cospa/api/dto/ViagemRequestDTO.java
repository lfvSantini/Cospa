package com.cospa.api.dto;

import jakarta.validation.constraints.NotBlank;

public record ViagemRequestDTO(
        @NotBlank(message = "O local de coleta é obrigatório")
        String localColeta,

        @NotBlank(message = "O local de entrega é obrigatório")
        String localEntrega,

        @NotBlank(message = "O nome do motorista é obrigatório")
        String nomeMotorista,

        @NotBlank(message = "A transportadora é obrigatória")
        String transportadora,

        String observacao
) {}