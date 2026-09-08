package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "viagens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Viagem {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private Long id;

    @Column(nullable = false, length = 255)
    private String cliente;

    @Column(name = "local_coleta", length = 255)
    private String localColeta;

    @Column(name = "local_entrega", length = 255)
    private String localEntrega;

    @Column(columnDefinition = "TEXT")
    private String origem;

    @Column(columnDefinition = "TEXT")
    private String destino;

    @Column(name = "origem_nome", columnDefinition = "TEXT")
    private String origemNome;

    @Column(name = "destino_nome", columnDefinition = "TEXT")
    private String destinoNome;

    @Column(name = "perfil_veiculo", length = 50)
    private String perfilVeiculo;

    @Column(name = "carroceria_veiculo", length = 50)
    private String carroceriaVeiculo;

    @Column(name = "nome_motorista", length = 255)
    private String nomeMotorista;

    @Column(name = "placa", length = 50)
    private String placa;

    @Column(name = "placa_secundaria", length = 50)
    private String placaSecundaria;

    @Column(name = "cpf_motorista", length = 14)
    private String cpfMotorista;

    @Column(name = "fornecedor_agencia", length = 255)
    private String fornecedorAgencia;

    @Column(name = "agenciador", length = 255)
    private String agenciador;

    @Column(name = "especialista_cospa", length = 255)
    private String especialistaCospa;

    @Column(name = "data_coleta_prevista", columnDefinition = "TEXT")
    private String dataColetaPrevista;

    @Column(name = "data_coleta_real", columnDefinition = "TEXT")
    private String dataColetaReal;

    @Column(name = "data_entrega_prevista", columnDefinition = "TEXT")
    private String dataEntregaPrevista;

    @Column(name = "data_entrega_real", columnDefinition = "TEXT")
    private String dataEntregaReal;

    @Builder.Default
    @Column(name = "valor_a_receber", precision = 10, scale = 2)
    private BigDecimal valorAReceber = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_a_pagar", precision = 10, scale = 2)
    private BigDecimal valorAPagar = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_adicional_receber", precision = 10, scale = 2)
    private BigDecimal valorAdicionalReceber = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_adicional_pagar", precision = 10, scale = 2)
    private BigDecimal valorAdicionalPagar = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_adicional_agencia", precision = 10, scale = 2)
    private BigDecimal valorAdicionalAgencia = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_agenciador", precision = 10, scale = 2)
    private BigDecimal valorAgenciador = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_especialista_cospa", precision = 10, scale = 2)
    private BigDecimal valorEspecialistaCospa = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "pagamento_liberado")
    private Boolean pagamentoLiberado = false;

    @Builder.Default
    @Column(name = "pagamento_realizado_status", length = 30)
    private String pagamentoRealizadoStatus = "NAO_REALIZADO";

    @Column(name = "data_hora_pagamento", columnDefinition = "TEXT")
    private String dataHoraPagamento;

    @Column(name = "data_adiantamento", length = 50)
    private String dataAdiantamento;

    @Builder.Default
    @Column(name = "pago_adiantamento")
    private Boolean pagoAdiantamento = false;

    @Column(name = "data_saldo", length = 50)
    private String dataSaldo;

    @Builder.Default
    @Column(name = "pago_saldo")
    private Boolean pagoSaldo = false;

    @Column(name = "data_adicional", length = 50)
    private String dataAdicional;

    @Builder.Default
    @Column(name = "pago_adicional")
    private Boolean pagoAdicional = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private StatusViagem status = StatusViagem.PROGRAMADO;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @OneToMany(mappedBy = "viagem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<Comprovante> comprovantes = new ArrayList<>();
}