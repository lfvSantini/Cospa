package com.cospa.api.dto;

import com.cospa.api.model.StatusViagem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViagemRequestDTO {

    @NotNull(message = "O Número da Viagem (ID) é obrigatório")
    private Long id;

    @NotBlank(message = "O cliente é obrigatório")
    private String cliente;

    private String origem;
    private String destino;
    private String origemNome;
    private String destinoNome;
    private String localColeta;
    private String localEntrega;

    private String nomeMotorista;
    private String placa;
    private String cpfMotorista;
    private String fornecedorAgencia;

    private String dataColetaPrevista;
    private String dataColetaReal;
    private String dataEntregaPrevista;
    private String dataEntregaReal;

    private BigDecimal valorAReceber;
    private BigDecimal valorAPagar;
    private BigDecimal valorAdicionalReceber;
    private BigDecimal valorAdicionalPagar;
    private BigDecimal valorAdicionalAgencia;

    private Boolean pagamentoLiberado;
    private String pagamentoRealizadoStatus;
    private String dataHoraPagamento;

    private StatusViagem status;
    private String observacao;
}