// backend/src/main/java/com/cospa/api/model/Viagem.java
package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Column(name = "nome_motorista", length = 255)
    private String nomeMotorista;

    @Column(name = "placa", length = 20)
    private String placa;

    @Column(name = "cpf_motorista", length = 14)
    private String cpfMotorista;

    @Column(name = "data_coleta_prevista")
    private LocalDateTime dataColetaPrevista;

    @Column(name = "data_coleta_real")
    private LocalDateTime dataColetaReal;

    @Column(name = "data_entrega_prevista")
    private LocalDateTime dataEntregaPrevista;

    @Column(name = "data_entrega_real")
    private LocalDateTime dataEntregaReal;

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

    @Column(name = "fornecedor_agencia", length = 255)
    private String fornecedorAgencia;

    @Builder.Default
    @Column(name = "pagamento_liberado")
    private Boolean pagamentoLiberado = false;

    @Builder.Default
    @Column(name = "pagamento_realizado_status", length = 30)
    private String pagamentoRealizadoStatus = "NAO_REALIZADO";

    @Column(name = "data_hora_pagamento", columnDefinition = "TEXT")
    private String dataHoraPagamento;

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