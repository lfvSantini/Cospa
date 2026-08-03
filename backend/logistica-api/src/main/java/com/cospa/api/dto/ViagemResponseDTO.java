package com.cospa.api.dto;

import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;

import java.time.LocalDateTime;

public record ViagemResponseDTO(
        Long id,
        String localColeta,
        String localEntrega,
        String nomeMotorista,
        String transportadora,
        StatusViagem status,
        String observacao,
        String urlFotoComprovante,
        LocalDateTime inicioCarregamento,
        LocalDateTime fimCarregamento,
        LocalDateTime inicioDescarregamento,
        LocalDateTime fimDescarregamento
) {
    public ViagemResponseDTO(Viagem viagem) {
        this(
                viagem.getId(),
                viagem.getLocalColeta(),
                viagem.getLocalEntrega(),
                viagem.getNomeMotorista(),
                viagem.getTransportadora(),
                viagem.getStatus(),
                viagem.getObservacao(),
                viagem.getUrlFotoComprovante(),
                viagem.getInicioCarregamento(),
                viagem.getFimCarregamento(),
                viagem.getInicioDescarregamento(),
                viagem.getFimDescarregamento()
        );
    }
}