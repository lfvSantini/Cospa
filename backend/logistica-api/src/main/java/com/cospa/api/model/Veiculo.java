package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "veiculos")
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String placa;

    @Column(name = "tipo_veiculo", nullable = false, length = 50)
    private String tipoVeiculo;

    @Column(name = "tipo_carroceria", length = 50)
    private String tipoCarroceria;

    @Column(length = 50)
    private String adicional;

    @Column(name = "numero_eixos", length = 20)
    private String numeroEixos;

    @Column(name = "cubagem_bau", length = 50)
    private String cubagemBau;

    @Column(name = "capacidade_peso", length = 50)
    private String capacidadePeso;

    @Column(name = "numero_paletes", length = 50)
    private String numeroPaletes;

    @Column(name = "ano_fabricacao", length = 10)
    private String anoFabricacao;

    @Column(name = "data_vencimento", length = 50)
    private String dataVencimento;

    @Column(length = 255)
    private String fornecedor;

    @Column(name = "numero_antt", length = 50)
    private String numeroAntt;

    @Column(name = "tipo_rastreador", length = 100)
    private String tipoRastreador;

    @Column(length = 20)
    private String situacao = "ATIVO";

    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<VeiculoDocumento> documentos = new ArrayList<>();

    @ManyToMany(mappedBy = "veiculos", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Motorista> motoristas = new ArrayList<>();

    public Veiculo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getTipoVeiculo() { return tipoVeiculo; }
    public void setTipoVeiculo(String tipoVeiculo) { this.tipoVeiculo = tipoVeiculo; }

    public String getTipoCarroceria() { return tipoCarroceria; }
    public void setTipoCarroceria(String tipoCarroceria) { this.tipoCarroceria = tipoCarroceria; }

    public String getAdicional() { return adicional; }
    public void setAdicional(String adicional) { this.adicional = adicional; }

    public String getNumeroEixos() { return numeroEixos; }
    public void setNumeroEixos(String numeroEixos) { this.numeroEixos = numeroEixos; }

    public String getCubagemBau() { return cubagemBau; }
    public void setCubagemBau(String cubagemBau) { this.cubagemBau = cubagemBau; }

    public String getCapacidadePeso() { return capacidadePeso; }
    public void setCapacidadePeso(String capacidadePeso) { this.capacidadePeso = capacidadePeso; }

    public String getNumeroPaletes() { return numeroPaletes; }
    public void setNumeroPaletes(String numeroPaletes) { this.numeroPaletes = numeroPaletes; }

    public String getAnoFabricacao() { return anoFabricacao; }
    public void setAnoFabricacao(String anoFabricacao) { this.anoFabricacao = anoFabricacao; }

    public String getDataVencimento() { return dataVencimento; }
    public void setDataVencimento(String dataVencimento) { this.dataVencimento = dataVencimento; }

    public String getFornecedor() { return fornecedor; }
    public void setFornecedor(String fornecedor) { this.fornecedor = fornecedor; }

    public String getNumeroAntt() { return numeroAntt; }
    public void setNumeroAntt(String numeroAntt) { this.numeroAntt = numeroAntt; }

    public String getTipoRastreador() { return tipoRastreador; }
    public void setTipoRastreador(String tipoRastreador) { this.tipoRastreador = tipoRastreador; }

    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }

    public List<VeiculoDocumento> getDocumentos() { return documentos; }
    public void setDocumentos(List<VeiculoDocumento> documentos) { this.documentos = documentos; }

    public List<Motorista> getMotoristas() { return motoristas; }
    public void setMotoristas(List<Motorista> motoristas) { this.motoristas = motoristas; }
}