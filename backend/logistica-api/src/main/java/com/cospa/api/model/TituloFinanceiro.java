package com.cospa.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "titulos_financeiros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TituloFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_titulo", nullable = false, unique = true)
    private String idTitulo;

    @Column(name = "viagem_id")
    private Long viagemId;

    @Column(nullable = false)
    private String tipo; // "A RECEBER" ou "A PAGAR"

    @Column(name = "entidade_nome", nullable = false)
    private String entidadeNome;

    private String operacao;

    @Column(name = "numero_rota")
    private String numeroRota;

    @Column(name = "numero_cte")
    private String numeroCte;

    @Column(name = "numero_mdfe")
    private String numeroMdfe;

    private String origem;
    private String destino;

    @Column(name = "perfil_veiculo")
    private String perfilVeiculo;

    private String placa;

    @Column(name = "valor_frete")
    private BigDecimal valorFrete = BigDecimal.ZERO;

    @Column(name = "valor_adicional")
    private BigDecimal valorAdicional = BigDecimal.ZERO;

    @Column(name = "total_previsto")
    private BigDecimal totalPrevisto = BigDecimal.ZERO;

    @Column(name = "total_realizado")
    private BigDecimal totalRealizado = BigDecimal.ZERO;

    @Column(name = "saldo_em_aberto")
    private BigDecimal saldoEmAberto = BigDecimal.ZERO;

    private String status = "PENDENTE";

    @Column(name = "data_coleta")
    private String dataColeta;

    @Column(name = "data_entrega")
    private String dataEntrega;

    @Column(name = "data_pagamento")
    private String dataPagamento;

    @Column(name = "proximo_vencimento")
    private String proximoVencimento;

    private String observacao;

    @OneToMany(mappedBy = "titulo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LancamentoFinanceiro> lancamentos = new ArrayList<>();
}