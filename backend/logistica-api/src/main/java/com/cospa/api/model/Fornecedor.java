package com.cospa.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fornecedores")
public class Fornecedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(name = "cnpj_cpf", length = 20)
    private String cnpjCpf;

    @Column(name = "nome_contato", length = 100)
    private String nomeContato;

    @Column(length = 30)
    private String telefone;

    @Column(length = 100)
    private String email;

    @Column(name = "chave_pix", length = 100)
    private String chavePix;

    @Column(name = "situacao", length = 20)
    private String situacao = "ATIVO";

    @Column(name = "obs", columnDefinition = "TEXT")
    private String obs;

    @Column(name = "ativo")
    private Boolean ativo = true;

    public Fornecedor() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCnpjCpf() { return cnpjCpf; }
    public void setCnpjCpf(String cnpjCpf) { this.cnpjCpf = cnpjCpf; }

    public String getNomeContato() { return nomeContato; }
    public void setNomeContato(String nomeContato) { this.nomeContato = nomeContato; }

    // Compatibilidade para getContato/setContato sem criar coluna duplicada
    public String getContato() { return this.nomeContato; }
    public void setContato(String contato) { this.nomeContato = contato; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getChavePix() { return chavePix; }
    public void setChavePix(String chavePix) { this.chavePix = chavePix; }

    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }

    public String getObs() { return obs; }
    public void setObs(String obs) { this.obs = obs; }

    // Compatibilidade para getObservacoes/setObservacoes apontando para o campo obs
    public String getObservacoes() { return this.obs; }
    public void setObservacoes(String observacoes) { this.obs = observacoes; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}