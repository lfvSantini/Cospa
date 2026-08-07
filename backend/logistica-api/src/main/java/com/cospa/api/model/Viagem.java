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
    @Column(nullable = false, length = 100)
    private Long id;

    @Column(nullable = false, length = 100)
    private String cliente;

    @Column(nullable = false, length = 7)
    private String placa;

    @Column(nullable = false, length = 100)
    private String nomeMotorista;

    @Column(name = "cpf_motorista")
    private String cpfMotorista;

    @Column(nullable = false)
    private String localColeta;

    @Column(nullable = false)
    private String localEntrega;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusViagem status;

    //Horários e Datas
    @Column(name = "data_coleta_prevista")
    private LocalDateTime dataColetaPrevista;

    @Column(name = "data_coleta_real")
    private LocalDateTime dataColetaReal;

    @Column(name = "data_entrega_prevista")
    private LocalDateTime dataEntregaPrevista;

    @Column(name = "data_entrega_real")
    private LocalDateTime dataEntregaReal;

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