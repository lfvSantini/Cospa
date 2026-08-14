package com.cospa.api.model;

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

    private String nomeMotorista;
    private String placa;

    // Datas aceitam texto livre/digitado (ex: "13/08/2026 14:00" ou "A confirmar")
    private String dataColetaPrevista;
    private String dataColetaReal;
    private String dataEntregaPrevista;
    private String dataEntregaReal;

    @Column(name = "valor_a_receber")
    private BigDecimal valorAReceber;

    @Column(name = "valor_a_pagar")
    private BigDecimal valorAPagar;

    @Column(name = "valor_adicional_receber")
    private BigDecimal valorAdicionalReceber = BigDecimal.ZERO;

    @Column(name = "valor_adicional_pagar")
    private BigDecimal valorAdicionalPagar = BigDecimal.ZERO;

    @Column(name = "pagamento_liberado")
    private Boolean pagamentoLiberado = false;

    @Column(name = "pagamento_realizado_status")
    private String pagamentoRealizadoStatus = "NAO_REALIZADO";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusViagem status = StatusViagem.PROGRAMADO;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    // Mapeamento do relacionamento com Comprovantes
    @OneToMany(mappedBy = "viagem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comprovante> comprovantes = new ArrayList<>();

    public Viagem() {}

    public Viagem(Long id, String cliente, StatusViagem status) {
        this.id = id;
        this.cliente = cliente;
        this.status = status;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getLocalColeta() { return localColeta; }
    public void setLocalColeta(String localColeta) { this.localColeta = localColeta; }

    public String getLocalEntrega() { return localEntrega; }
    public void setLocalEntrega(String localEntrega) { this.localEntrega = localEntrega; }

    public String getOrigem() { return origem; }
    public void setOrigem(String origem) { this.origem = origem; }

    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }

    public String getOrigemNome() { return origemNome; }
    public void setOrigemNome(String origemNome) { this.origemNome = origemNome; }

    public String getDestinoNome() { return destinoNome; }
    public void setDestinoNome(String destinoNome) { this.destinoNome = destinoNome; }

    public String getNomeMotorista() { return nomeMotorista; }
    public void setNomeMotorista(String nomeMotorista) { this.nomeMotorista = nomeMotorista; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getDataColetaPrevista() { return dataColetaPrevista; }
    public void setDataColetaPrevista(String dataColetaPrevista) { this.dataColetaPrevista = dataColetaPrevista; }

    public String getDataColetaReal() { return dataColetaReal; }
    public void setDataColetaReal(String dataColetaReal) { this.dataColetaReal = dataColetaReal; }

    public String getDataEntregaPrevista() { return dataEntregaPrevista; }
    public void setDataEntregaPrevista(String dataEntregaPrevista) { this.dataEntregaPrevista = dataEntregaPrevista; }

    public String getDataEntregaReal() { return dataEntregaReal; }
    public void setDataEntregaReal(String dataEntregaReal) { this.dataEntregaReal = dataEntregaReal; }

    public BigDecimal getValorAReceber() { return valorAReceber; }
    public void setValorAReceber(BigDecimal valorAReceber) { this.valorAReceber = valorAReceber; }

    public BigDecimal getValorAPagar() { return valorAPagar; }
    public void setValorAPagar(BigDecimal valorAPagar) { this.valorAPagar = valorAPagar; }

    public BigDecimal getValorAdicionalReceber() { return valorAdicionalReceber; }
    public void setValorAdicionalReceber(BigDecimal valorAdicionalReceber) { this.valorAdicionalReceber = valorAdicionalReceber; }

    public BigDecimal getValorAdicionalPagar() { return valorAdicionalPagar; }
    public void setValorAdicionalPagar(BigDecimal valorAdicionalPagar) { this.valorAdicionalPagar = valorAdicionalPagar; }

    public Boolean getPagamentoLiberado() { return pagamentoLiberado; }
    public void setPagamentoLiberado(Boolean pagamentoLiberado) { this.pagamentoLiberado = pagamentoLiberado; }

    // CORRIGIDO AQUI:
    public String getPagamentoRealizadoStatus() { return pagamentoRealizadoStatus; }
    public void setPagamentoRealizadoStatus(String pagamentoRealizadoStatus) { this.pagamentoRealizadoStatus = pagamentoRealizadoStatus; }

    public StatusViagem getStatus() { return status; }
    public void setStatus(StatusViagem status) { this.status = status; }

    public void setStatus(String statusStr) {
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                this.status = StatusViagem.valueOf(statusStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                this.status = StatusViagem.PROGRAMADO;
            }
        }
    }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }

    public List<Comprovante> getComprovantes() { return comprovantes; }
    public void setComprovantes(List<Comprovante> comprovantes) { this.comprovantes = comprovantes; }
}