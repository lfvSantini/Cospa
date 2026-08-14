package com.cospa.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "motorista_documentos")
public class MotoristaDocumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "url_arquivo", nullable = false)
    private String urlArquivo;

    @ManyToOne
    @JoinColumn(name = "motorista_id", nullable = false)
    private Motorista motorista;

    public MotoristaDocumento() {}

    public MotoristaDocumento(String nome, String urlArquivo, Motorista motorista) {
        this.nome = nome;
        this.urlArquivo = urlArquivo;
        this.motorista = motorista;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getUrlArquivo() { return urlArquivo; }
    public void setUrlArquivo(String urlArquivo) { this.urlArquivo = urlArquivo; }

    public Motorista getMotorista() { return motorista; }
    public void setMotorista(Motorista motorista) { this.motorista = motorista; }
}