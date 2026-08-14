package com.cospa.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "motoristas")
public class Motorista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String cpf;

    @Column(nullable = false)
    private String placa;

    private String fornecedor;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "url_cnh")
    private String urlCnh;

    @Column(name = "url_crlv")
    private String urlCrlv;

    @Column(name = "url_comp_endereco")
    private String urlCompEndereco; // <--- Atributo adicionado para resolver o erro

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    public Motorista() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }

    public String getFornecedor() { return fornecedor; }
    public void setFornecedor(String fornecedor) { this.fornecedor = fornecedor; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getUrlCnh() { return urlCnh; }
    public void setUrlCnh(String urlCnh) { this.urlCnh = urlCnh; }

    public String getUrlCrlv() { return urlCrlv; }
    public void setUrlCrlv(String urlCrlv) { this.urlCrlv = urlCrlv; }

    public String getUrlCompEndereco() { return urlCompEndereco; }
    public void setUrlCompEndereco(String urlCompEndereco) { this.urlCompEndereco = urlCompEndereco; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}