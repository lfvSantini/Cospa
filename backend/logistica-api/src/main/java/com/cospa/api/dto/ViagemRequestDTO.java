package com.cospa.api.dto;

import com.cospa.api.model.StatusViagem;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViagemRequestDTO {

    private Long id;

    @NotBlank(message = "O nome do cliente é obrigatório")
    private String cliente;

    private String origem;
    private String destino;
    private String origemNome;
    private String destinoNome;
    private String localColeta;
    private String localEntrega;

    private String perfilVeiculo;
    private String carroceriaVeiculo;

    private String nomeMotorista;
    private String placa;
    private String placaSecundaria;
    private String cpfMotorista;
    private String fornecedorAgencia;
    private String agenciador;
    private String especialistaCospa;

    private String dataColetaPrevista;
    private String dataColetaReal;
    private String dataEntregaPrevista;
    private String dataEntregaReal;

    private BigDecimal valorAReceber;
    private BigDecimal valorAPagar;
    private BigDecimal valorAdicionalReceber;
    private BigDecimal valorAdicionalPagar;
    private BigDecimal valorAdicionalAgencia;
    private BigDecimal valorAgenciador;
    private BigDecimal valorEspecialistaCospa;

    private Boolean pagamentoLiberado;
    private String pagamentoRealizadoStatus;
    private String dataHoraPagamento;

    private String dataAdiantamento;
    private Boolean pagoAdiantamento;
    private String dataSaldo;
    private Boolean pagoSaldo;
    private String dataAdicional;
    private Boolean pagoAdicional;

    private StatusViagem status;
    private String observacao;
}