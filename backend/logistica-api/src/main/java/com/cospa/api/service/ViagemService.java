private String nullIfBlank(String valor) {
    if (valor == null || valor.isBlank()) {
        return null;
    }
    return valor.trim();
}

public void copiarDtoParaEntidade(ViagemRequestDTO dto, Viagem v) {
    v.setCliente(dto.getCliente());
    v.setLocalColeta(nullIfBlank(dto.getLocalColeta()));
    v.setLocalEntrega(nullIfBlank(dto.getLocalEntrega()));
    v.setTipoOperacao(dto.getTipoOperacao());
    v.setOrigem(nullIfBlank(dto.getOrigem()));
    v.setDestino(nullIfBlank(dto.getDestino()));
    v.setOrigemNome(nullIfBlank(dto.getOrigemNome()));
    v.setDestinoNome(nullIfBlank(dto.getDestinoNome()));

    v.setPerfilVeiculo(nullIfBlank(dto.getPerfilVeiculo()));
    v.setCarroceriaVeiculo(nullIfBlank(dto.getCarroceriaVeiculo()));

    v.setNomeMotorista(nullIfBlank(dto.getNomeMotorista()));
    v.setPlaca(nullIfBlank(dto.getPlaca()));
    v.setPlacaSecundaria(nullIfBlank(dto.getPlacaSecundaria()));
    v.setCpfMotorista(nullIfBlank(dto.getCpfMotorista()));

    v.setFornecedorAgencia(nullIfBlank(dto.getFornecedorAgencia()));
    v.setAgenciador(nullIfBlank(dto.getAgenciador()));
    v.setEspecialistaCospa(nullIfBlank(dto.getEspecialistaCospa()));

    // Tratamento robusto para aceitar datas/tempos vazios como NULL
    v.setDataColetaPrevista(nullIfBlank(dto.getDataColetaPrevista()));
    v.setDataColetaReal(nullIfBlank(dto.getDataColetaReal()));
    v.setDataEntregaPrevista(nullIfBlank(dto.getDataEntregaPrevista()));
    v.setDataEntregaReal(nullIfBlank(dto.getDataEntregaReal()));

    v.setValorAReceber(dto.getValorAReceber() != null ? dto.getValorAReceber() : BigDecimal.ZERO);
    v.setValorAPagar(dto.getValorAPagar() != null ? dto.getValorAPagar() : BigDecimal.ZERO);
    v.setValorAdicionalReceber(dto.getValorAdicionalReceber() != null ? dto.getValorAdicionalReceber() : BigDecimal.ZERO);
    v.setTipoAdicionalReceber(dto.getTipoAdicionalReceber());
    v.setValorAdicionalPagar(dto.getValorAdicionalPagar() != null ? dto.getValorAdicionalPagar() : BigDecimal.ZERO);
    v.setTipoAdicionalPagar(dto.getTipoAdicionalPagar());
    v.setValorAdicionalAgencia(dto.getValorAdicionalAgencia() != null ? dto.getValorAdicionalAgencia() : BigDecimal.ZERO);
    v.setValorAgenciador(dto.getValorAgenciador() != null ? dto.getValorAgenciador() : BigDecimal.ZERO);
    v.setValorEspecialistaCospa(dto.getValorEspecialistaCospa() != null ? dto.getValorEspecialistaCospa() : BigDecimal.ZERO);

    v.setPagamentoLiberado(dto.getPagamentoLiberado() != null ? dto.getPagamentoLiberado() : false);
    v.setPagamentoRealizadoStatus(
            dto.getPagamentoRealizadoStatus() != null && !dto.getPagamentoRealizadoStatus().isBlank()
                    ? dto.getPagamentoRealizadoStatus()
                    : "NAO_REALIZADO"
    );
    v.setDataHoraPagamento(nullIfBlank(dto.getDataHoraPagamento()));

    v.setDataAdiantamento(nullIfBlank(dto.getDataAdiantamento()));
    v.setPagoAdiantamento(dto.getPagoAdiantamento() != null ? dto.getPagoAdiantamento() : false);

    v.setDataSaldo(nullIfBlank(dto.getDataSaldo()));
    v.setPagoSaldo(dto.getPagoSaldo() != null ? dto.getPagoSaldo() : false);

    v.setDataAdicional(nullIfBlank(dto.getDataAdicional()));
    v.setPagoAdicional(dto.getPagoAdicional() != null ? dto.getPagoAdicional() : false);

    v.setObservacao(nullIfBlank(dto.getObservacao()));

    // Sincronização da lista relacional 1:N de datas
    if (dto.getDatas() != null) {
        v.getDatas().clear();
        int idx = 0;
        for (var item : dto.getDatas()) {
            ViagemData vd = new ViagemData(
                    item.tipo() != null ? item.tipo().toUpperCase() : "COLETA",
                    nullIfBlank(item.dataPrevista()),
                    nullIfBlank(item.dataReal()),
                    idx++,
                    v
            );
            v.getDatas().add(vd);
        }
    }

    if (dto.getStatus() != null) {
        v.setStatus(dto.getStatus());
    } else if (v.getStatus() == null) {
        v.setStatus(StatusViagem.PROGRAMADO);
    }
}