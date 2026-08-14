package com.cospa.api.dto;

import com.cospa.api.model.StatusViagem;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ViagemRequestDTO {

    private Long id; // <--- Adicione este campo

    @NotBlank(message = "O cliente é obrigatório")
    private String cliente;

    private String origem;
    private String destino;
    private String localColeta;
    private String localEntrega;

    @NotBlank(message = "O nome do motorista é obrigatório")
    private String nomeMotorista;

    @NotBlank(message = "A placa é obrigatória")
    private String placa;

    private LocalDateTime dataColetaPrevista;
    private LocalDateTime dataColetaReal;
    private LocalDateTime dataEntregaPrevista;
    private LocalDateTime dataEntregaReal;

    private BigDecimal valorAReceber;
    private BigDecimal valorAPagar;

    private StatusViagem status;
    private String observacao;
}