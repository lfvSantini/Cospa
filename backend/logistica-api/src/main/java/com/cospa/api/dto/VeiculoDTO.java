package com.cospa.api.dto;

public class VeiculoDTO {

    private Long id;
    private String placa;
    private String tipoVeiculo;
    private String tipoCarroceria;
    private String adicional;
    private String numeroEixos;
    private String cubagemBau;
    private String capacidadePeso;
    private String numeroPaletes;
    private String anoFabricacao;
    private String dataVencimento;
    private String fornecedor;
    private String numeroAntt;
    private String tipoRastreador;
    private String situacao;

    public VeiculoDTO() {}

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
}