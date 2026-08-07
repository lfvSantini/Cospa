package com.cospa.api.dto;

import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import java.time.LocalDateTime;

public record ViagemResponseDTO(
        Long id,
        String cliente,
        String localColeta,
        String localEntrega,
        String placa,
        String nomeMotorista,
        String cpfMotorista,
        LocalDateTime dataColetaPrevista,
        LocalDateTime dataColetaReal,
        LocalDateTime dataEntregaPrevista,
        LocalDateTime dataEntregaReal,
        StatusViagem status,
        String observacao,
        String urlFotoComprovante
) {
    // Construtor auxiliar para converter a Entidade JPA diretamente no DTO
    public ViagemResponseDTO(Viagem viagem) {
        this(
                viagem.getId(),
                viagem.getCliente(),
                viagem.getLocalColeta(),
                viagem.getLocalEntrega(),
                viagem.getPlaca(),
                viagem.getNomeMotorista(),
                viagem.getCpfMotorista(),
                viagem.getDataColetaPrevista(),
                viagem.getDataColetaReal(),
                viagem.getDataEntregaPrevista(),
                viagem.getDataEntregaReal(),
                viagem.getStatus(),
                viagem.getObservacao(),
                viagem.getUrlFotoComprovante()
        );
    }
}