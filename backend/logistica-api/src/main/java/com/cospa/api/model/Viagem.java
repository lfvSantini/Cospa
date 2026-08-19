package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "viagens")
public class Viagem {

    @Id
    private Long id;

    @Column(nullable = false)
    private String cliente;

    @Column(columnDefinition = "TEXT")
    private String localColeta;

    @Column(columnDefinition = "TEXT")
    private String localEntrega;

    @Column(columnDefinition = "TEXT")
    private String origem;

    @Column(columnDefinition = "TEXT")
    private String destino;

    @Column(name = "origem_nome", columnDefinition = "TEXT")
    private String origemNome;

    @Column(name = "destino_nome", columnDefinition = "TEXT")
    private String destinoNome;

    @Column(name = "nome_motorista")
    private String nomeMotorista;

    @Column(name = "placa")
    private String placa;

    @Column(name = "data_coleta_prevista")
    private String dataColetaPrevista;

    @Column(name = "data_coleta_real")
    private String dataColetaReal;

    @Column(name = "data_entrega_prevista")
    private String dataEntregaPrevista;

    @Column(name = "data_entrega_real")
    private String dataEntregaReal;

    @Column(name = "valor_a_receber")
    private BigDecimal valorAReceber = BigDecimal.ZERO;

    @Column(name = "valor_a_pagar")
    private BigDecimal valorAPagar = BigDecimal.ZERO;

    @Column(name = "valor_adicional_receber")
    private BigDecimal valorAdicionalReceber = BigDecimal.ZERO;

    @Column(name = "valor_adicional_pagar")
    private BigDecimal valorAdicionalPagar = BigDecimal.ZERO;

    @Column(name = "valor_adicional_agencia")
    private BigDecimal valorAdicionalAgencia = BigDecimal.ZERO;

    @Column(name = "fornecedor_agencia")
    private String fornecedorAgencia;

    @Column(name = "pagamento_liberado")
    private Boolean pagamentoLiberado = false;

    @Column(name = "pagamento_realizado_status")
    private String pagamentoRealizadoStatus = "NAO_REALIZADO";

    @Column(name = "data_hora_pagamento")
    private String dataHoraPagamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusViagem status = StatusViagem.PROGRAMADO;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @OneToMany(mappedBy = "viagem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Comprovante> comprovantes = new ArrayList<>();

    public Viagem() {}

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getCliente() {
        return cliente;
    }
    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public String getLocalColeta() {
        return localColeta;
    }
    public void setLocalColeta(String localColeta) {
        this.localColeta = localColeta;
    }

    public String getLocalEntrega() {
        return localEntrega;
    }
    public void setLocalEntrega(String localEntrega) {
        this.localEntrega = localEntrega;
    }

    public String getOrigem() {
        return origem;
    }
    public void setOrigem(String origem) {
        this.origem = origem;
    }

    public String getDestino() {
        return destino;
    }
    public void setDestino(String destino) {
        this.destino = destino;
    }

    public String getOrigemNome() {
        return origemNome;
    }
    public void setOrigemNome(String origemNome) {
        this.origemNome = origemNome;
    }

    public String getDestinoNome() {
        return destinoNome;
    }
    public void setDestinoNome(String destinoNome) {
        this.destinoNome = destinoNome;
    }

    public String getNomeMotorista() {
        return nomeMotorista;
    }
    public void setNomeMotorista(String nomeMotorista) {
        this.nomeMotorista = nomeMotorista;
    }

    public String getPlaca() {
        return placa;
    }
    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getDataColetaPrevista() {
        return dataColetaPrevista;
    }
    public void setDataColetaPrevista(String dataColetaPrevista) {
        this.dataColetaPrevista = dataColetaPrevista;
    }

    public String getDataColetaReal() {
        return dataColetaReal;
    }
    public void setDataColetaReal(String dataColetaReal) {
        this.dataColetaReal = dataColetaReal;
    }

    public String getDataEntregaPrevista() {
        return dataEntregaPrevista;
    }
    public void setDataEntregaPrevista(String dataEntregaPrevista) {
        this.dataEntregaPrevista = dataEntregaPrevista;
    }

    public String getDataEntregaReal() {
        return dataEntregaReal;
    }
    public void setDataEntregaReal(String dataEntregaReal) {
        this.dataEntregaReal = dataEntregaReal;
    }

    public BigDecimal getValorAReceber() {
        return valorAReceber;
    }
    public void setValorAReceber(BigDecimal valorAReceber) {
        this.valorAReceber = valorAReceber;
    }

    public BigDecimal getValorAPagar() {
        return valorAPagar;
    }
    public void setValorAPagar(BigDecimal valorAPagar) {
        this.valorAPagar = valorAPagar;
    }

    public BigDecimal getValorAdicionalReceber() {
        return valorAdicionalReceber;
    }
    public void setValorAdicionalReceber(BigDecimal valorAdicionalReceber) {
        this.valorAdicionalReceber = valorAdicionalReceber;
    }

    public BigDecimal getValorAdicionalPagar() {
        return valorAdicionalPagar;
    }
    public void setValorAdicionalPagar(BigDecimal valorAdicionalPagar) {
        this.valorAdicionalPagar = valorAdicionalPagar;
    }

    public BigDecimal getValorAdicionalAgencia() {
        return valorAdicionalAgencia;
    }
    public void setValorAdicionalAgencia(BigDecimal valorAdicionalAgencia) {
        this.valorAdicionalAgencia = valorAdicionalAgencia;
    }

    public String getFornecedorAgencia() {
        return fornecedorAgencia;
    }
    public void setFornecedorAgencia(String fornecedorAgencia) {
        this.fornecedorAgencia = fornecedorAgencia;
    }

    public Boolean getPagamentoLiberado() {
        return pagamentoLiberado;
    }
    public void setPagamentoLiberado(Boolean pagamentoLiberado) {
        this.pagamentoLiberado = pagamentoLiberado;
    }

    public String getPagamentoRealizadoStatus() {
        return pagamentoRealizadoStatus;
    }
    public void setPagamentoRealizadoStatus(String pagamentoRealizadoStatus) {
        this.pagamentoRealizadoStatus = pagamentoRealizadoStatus;
    }

    public String getDataHoraPagamento() {
        return dataHoraPagamento;
    }
    public void setDataHoraPagamento(String dataHoraPagamento) {
        this.dataHoraPagamento = dataHoraPagamento;
    }

    public StatusViagem getStatus() {
        return status;
    }
    public void setStatus(StatusViagem status) {
        this.status = status;
    }

    public String getObservacao() {
        return observacao;
    }
    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public List<Comprovante> getComprovantes() {
        return comprovantes;
    }
    public void setComprovantes(List<Comprovante> comprovantes) {
        this.comprovantes = comprovantes;
    }
}