package com.cospa.api.dto;

import com.cospa.api.model.Comprovante;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;

import java.math.BigDecimal;
import java.util.List;

public record ViagemResponseDTO(
        Long id,
        String cliente,
        String localColeta,
        String localEntrega,
        String origem,
        String destino,
        String origemNome,
        String destinoNome,
        String nomeMotorista,
        String placa,
        String cpfMotorista,
        String dataColetaPrevista,
        String dataColetaReal,
        String dataEntregaPrevista,
        String dataEntregaReal,
        BigDecimal valorAReceber,
        BigDecimal valorAPagar,
        BigDecimal valorAdicionalReceber,
        BigDecimal valorAdicionalPagar,
        BigDecimal valorAdicionalAgencia,
        String fornecedorAgencia,
        Boolean pagamentoLiberado,
        String pagamentoRealizadoStatus,
        String dataHoraPagamento,
        StatusViagem status,
        String observacao,
        List<Comprovante> comprovantes
) {
    public ViagemResponseDTO(Viagem viagem) {
        this(
                viagem.getId(),
                viagem.getCliente(),
                viagem.getLocalColeta(),
                viagem.getLocalEntrega(),
                viagem.getOrigem(),
                viagem.getDestino(),
                viagem.getOrigemNome(),
                viagem.getDestinoNome(),
                viagem.getNomeMotorista(),
                viagem.getPlaca(),
                viagem.getCpfMotorista(),
                viagem.getDataColetaPrevista(),
                viagem.getDataColetaReal(),
                viagem.getDataEntregaPrevista(),
                viagem.getDataEntregaReal(),
                viagem.getValorAReceber(),
                viagem.getValorAPagar(),
                viagem.getValorAdicionalReceber(),
                viagem.getValorAdicionalPagar(),
                viagem.getValorAdicionalAgencia(),
                viagem.getFornecedorAgencia(),
                viagem.getPagamentoLiberado(),
                viagem.getPagamentoRealizadoStatus(),
                viagem.getDataHoraPagamento(),
                viagem.getStatus(),
                viagem.getObservacao(),
                viagem.getComprovantes()
        );
    }
}