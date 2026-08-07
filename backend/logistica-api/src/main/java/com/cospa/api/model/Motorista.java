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

    @Column(nullable = false, unique = true)
    private String placa;

    public Motorista() {}

    public Motorista(String nome, String placa) {
        this.nome = nome;
        this.placa = placa;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
}