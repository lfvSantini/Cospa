package com.cospa.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "viagens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String transportadora;

    @Column(nullable = false, length = 100)
    private String nomeMotorista;

    @Column(nullable = false)
    private String localColeta;

    @Column(nullable = false)
    private String localEntrega;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusViagem status;

    // Data e hora do começo/fim do carregamento
    private LocalDateTime inicioCarregamento;
    private LocalDateTime fimCarregamento;

    // Data e hora do começo/fim do descarregamento
    private LocalDateTime inicioDescarregamento;
    private LocalDateTime fimDescarregamento;

    // Guarda URL da foto do comprovante
    private String urlFotoComprovante;

    @Column(columnDefinition = "TEXT")
    private String observacao;
}