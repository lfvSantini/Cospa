package com.cospa.api.dto;

import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViagemResponseDTO {

    private Long id;
    private String cliente;
    private String origem;
    private String destino;
    private String origemNome;
    private String destinoNome;
    private String localColeta;
    private String localEntrega;
    private String nomeMotorista;
    private String placa;
    private String fornecedorAgencia;

    private String dataColetaPrevista;
    private String dataColetaReal;
    private String dataEntregaPrevista;
    private String dataEntregaReal;

    private BigDecimal valorAReceber;
    private BigDecimal valorAPagar;
    private BigDecimal valorAdicionalReceber;
    private BigDecimal valorAdicionalPagar;
    private BigDecimal valorAdicionalAgencia;

    private Boolean pagamentoLiberado;
    private String pagamentoRealizadoStatus;
    private String dataHoraPagamento;

    private StatusViagem status;
    private String observacao;

    private List<ComprovanteDTO> comprovantes = new ArrayList<>();

    public ViagemResponseDTO(Viagem entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.cliente = entity.getCliente();
            this.origem = entity.getOrigem();
            this.destino = entity.getDestino();
            this.origemNome = entity.getOrigemNome();
            this.destinoNome = entity.getDestinoNome();
            this.localColeta = entity.getLocalColeta();
            this.localEntrega = entity.getLocalEntrega();
            this.nomeMotorista = entity.getNomeMotorista();
            this.placa = entity.getPlaca();
            this.fornecedorAgencia = entity.getFornecedorAgencia();

            this.dataColetaPrevista = formatarData(entity.getDataColetaPrevista());
            this.dataColetaReal = formatarData(entity.getDataColetaReal());
            this.dataEntregaPrevista = formatarData(entity.getDataEntregaPrevista());
            this.dataEntregaReal = formatarData(entity.getDataEntregaReal());

            this.valorAReceber = entity.getValorAReceber();
            this.valorAPagar = entity.getValorAPagar();
            this.valorAdicionalReceber = entity.getValorAdicionalReceber();
            this.valorAdicionalPagar = entity.getValorAdicionalPagar();
            this.valorAdicionalAgencia = entity.getValorAdicionalAgencia();

            this.pagamentoLiberado = entity.getPagamentoLiberado();
            this.pagamentoRealizadoStatus = entity.getPagamentoRealizadoStatus();
            this.dataHoraPagamento = entity.getDataHoraPagamento();

            this.status = entity.getStatus();
            this.observacao = entity.getObservacao();

            if (entity.getComprovantes() != null) {
                this.comprovantes = entity.getComprovantes().stream()
                        .map(ComprovanteDTO::new)
                        .collect(Collectors.toList());
            }
        }
    }

    private String formatarData(LocalDateTime data) {
        if (data == null) {
            return null;
        }
        return data.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}