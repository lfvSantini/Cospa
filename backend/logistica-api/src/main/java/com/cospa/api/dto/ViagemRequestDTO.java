package com.cospa.api.dto;

import com.cospa.api.model.StatusViagem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ViagemRequestDTO(
        @NotNull Long id,
        @NotBlank String cliente,
        @NotBlank String localColeta,
        @NotBlank String localEntrega,
        @NotBlank String placa,
        @NotBlank String nomeMotorista,
        String cpfMotorista,
        LocalDateTime dataColetaPrevista,
        LocalDateTime dataColetaReal,
        LocalDateTime dataEntregaPrevista,
        LocalDateTime dataEntregaReal,
        StatusViagem status,
        String observacao
) {}