package com.cospa.api.dto;

import com.cospa.api.model.Comprovante;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.TipoAdicional;
import com.cospa.api.model.TipoOperacao;
import com.cospa.api.model.Viagem;

import java.math.BigDecimal;
import java.util.List;

public record ViagemResponseDTO(
        Long id,
        String numeroOperacional,
        String cliente,
        String localColeta,
        String localEntrega,
        TipoOperacao tipoOperacao,
        String origem,
        String destino,
        String origemNome,
        String destinoNome,
        String perfilVeiculo,
        String carroceriaVeiculo,
        String nomeMotorista,
        String placa,
        String placaSecundaria,
        String cpfMotorista,
        String dataColetaPrevista,
        String dataColetaReal,
        String dataEntregaPrevista,
        String dataEntregaReal,
        BigDecimal valorAReceber,
        BigDecimal valorAPagar,
        BigDecimal valorAdicionalReceber,
        TipoAdicional tipoAdicionalReceber,
        BigDecimal valorAdicionalPagar,
        TipoAdicional tipoAdicionalPagar,
        BigDecimal valorAdicionalAgencia,
        BigDecimal valorAgenciador,
        BigDecimal valorEspecialistaCospa,
        String fornecedorAgencia,
        String agenciador,
        String especialistaCospa,
        Boolean pagamentoLiberado,
        String pagamentoRealizadoStatus,
        String dataHoraPagamento,
        String dataAdiantamento,
        Boolean pagoAdiantamento,
        String dataSaldo,
        Boolean pagoSaldo,
        String dataAdicional,
        Boolean pagoAdicional,
        StatusViagem status,
        String observacao,
        List<Comprovante> comprovantes,
        List<ViagemDataItemDTO> datas
) {
    public ViagemResponseDTO(Viagem viagem) {
        this(
                viagem.getId(),
                viagem.getNumeroOperacional(),
                viagem.getCliente(),
                viagem.getLocalColeta(),
                viagem.getLocalEntrega(),
                viagem.getTipoOperacao(),
                viagem.getOrigem(),
                viagem.getDestino(),
                viagem.getOrigemNome(),
                viagem.getDestinoNome(),
                viagem.getPerfilVeiculo(),
                viagem.getCarroceriaVeiculo(),
                viagem.getNomeMotorista(),
                viagem.getPlaca(),
                viagem.getPlacaSecundaria(),
                viagem.getCpfMotorista(),
                viagem.getDataColetaPrevista(),
                viagem.getDataColetaReal(),
                viagem.getDataEntregaPrevista(),
                viagem.getDataEntregaReal(),
                viagem.getValorAReceber(),
                viagem.getValorAPagar(),
                viagem.getValorAdicionalReceber(),
                viagem.getTipoAdicionalReceber(),
                viagem.getValorAdicionalPagar(),
                viagem.getTipoAdicionalPagar(),
                viagem.getValorAdicionalAgencia(),
                viagem.getValorAgenciador(),
                viagem.getValorEspecialistaCospa(),
                viagem.getFornecedorAgencia(),
                viagem.getAgenciador(),
                viagem.getEspecialistaCospa(),
                viagem.getPagamentoLiberado(),
                viagem.getPagamentoRealizadoStatus(),
                viagem.getDataHoraPagamento(),
                viagem.getDataAdiantamento(),
                viagem.getPagoAdiantamento(),
                viagem.getDataSaldo(),
                viagem.getPagoSaldo(),
                viagem.getDataAdicional(),
                viagem.getPagoAdicional(),
                viagem.getStatus(),
                viagem.getObservacao(),
                viagem.getComprovantes(),
                viagem.getDatas() != null
                        ? viagem.getDatas().stream().map(ViagemDataItemDTO::new).toList()
                        : List.of()
        );
    }
}