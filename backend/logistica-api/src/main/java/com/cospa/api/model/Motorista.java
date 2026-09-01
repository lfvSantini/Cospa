package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "motoristas")
public class Motorista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nome;

    @Column(length = 20)
    private String cpf;

    @Column(length = 20)
    private String placa;

    @Column(name = "fornecedor_vinculado", length = 150)
    private String fornecedor;

    @Column(name = "situacao", length = 20)
    private String situacao = "ATIVO";

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "url_cnh", length = 500)
    private String urlCnh;

    @Column(name = "url_crlv", length = 500)
    private String urlCrlv;

    @Column(name = "url_comp_endereco", length = 500)
    private String urlCompEndereco;

    @Column(name = "informacoes_adicionais", columnDefinition = "TEXT")
    private String informacoesAdicionais;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @OneToMany(mappedBy = "motorista", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<MotoristaDocumento> documentos = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "motorista_veiculo",
            joinColumns = @JoinColumn(name = "motorista_id"),
            inverseJoinColumns = @JoinColumn(name = "veiculo_id")
    )
    private List<Veiculo> veiculos = new ArrayList<>();

    public Motorista() {}

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

    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getUrlCnh() { return urlCnh; }
    public void setUrlCnh(String urlCnh) { this.urlCnh = urlCnh; }

    public String getUrlCrlv() { return urlCrlv; }
    public void setUrlCrlv(String urlCrlv) { this.urlCrlv = urlCrlv; }

    public String getUrlCompEndereco() { return urlCompEndereco; }
    public void setUrlCompEndereco(String urlCompEndereco) { this.urlCompEndereco = urlCompEndereco; }

    public String getInformacoesAdicionais() { return informacoesAdicionais; }
    public void setInformacoesAdicionais(String informacoesAdicionais) { this.informacoesAdicionais = informacoesAdicionais; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public List<MotoristaDocumento> getDocumentos() { return documentos; }
    public void setDocumentos(List<MotoristaDocumento> documentos) { this.documentos = documentos; }

    public List<Veiculo> getVeiculos() { return veiculos; }
    public void setVeiculos(List<Veiculo> veiculos) { this.veiculos = veiculos; }
}