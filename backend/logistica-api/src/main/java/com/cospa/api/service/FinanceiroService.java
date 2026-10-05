// ==========================================
// 1. TÍTULO A RECEBER (CLIENTE)
// ==========================================
String idTituloReceber = "REC-" + viagem.getId();
TituloFinanceiro tituloReceber = tituloRepo.findByIdTitulo(idTituloReceber)
        .orElseGet(() -> TituloFinanceiro.builder()
                .idTitulo(idTituloReceber)
                .viagemId(viagem.getId())
                .tipo("A RECEBER")
                .build());

        tituloReceber.setEntidadeNome(viagem.getCliente() != null ? viagem.getCliente() : "NÃO INFORMADO");
        tituloReceber.setOperacao(viagem.getTipoOperacao() != null ? viagem.getTipoOperacao().name() : "");
        tituloReceber.setNumeroRota(viagem.getNumeroOperacional() != null ? viagem.getNumeroOperacional() : "");
        tituloReceber.setOrigem(viagem.getOrigem());
        tituloReceber.setDestino(viagem.getDestino());
        tituloReceber.setPerfilVeiculo(viagem.getPerfilVeiculo());
        tituloReceber.setPlaca(viagem.getPlaca());
        tituloReceber.setValorFrete(freteReceber);
        tituloReceber.setValorAdicional(adicReceber);
        tituloReceber.setTotalPrevisto(totalReceber);
        tituloReceber.setDataColeta(viagem.getDataColetaPrevista());
        tituloReceber.setDataEntrega(viagem.getDataEntregaPrevista());
        tituloReceber.setDataPagamento(viagem.getDataHoraPagamento());

        if (tituloReceber.getId() == null) {
        tituloReceber.setTotalRealizado(BigDecimal.ZERO);
            tituloReceber.setSaldoEmAberto(totalReceber);
            tituloReceber.setStatus("PENDENTE");
        }
tituloReceber = tituloRepo.save(tituloReceber);

sincronizarLancamentosReceber(viagem, tituloReceber, freteReceber, adicReceber);

// ==========================================
// 2. TÍTULO A PAGAR (MOTORISTA / FORNECEDOR)
// ==========================================
String entidadePagar = (viagem.getNomeMotorista() != null && !viagem.getNomeMotorista().isBlank())
        ? viagem.getNomeMotorista()
        : (viagem.getFornecedorAgencia() != null ? viagem.getFornecedorAgencia() : "A CONTRATAR");

String idTituloPagar = "PAG-" + viagem.getId();
TituloFinanceiro tituloPagar = tituloRepo.findByIdTitulo(idTituloPagar)
        .orElseGet(() -> TituloFinanceiro.builder()
                .idTitulo(idTituloPagar)
                .viagemId(viagem.getId())
                .tipo("A PAGAR")
                .build());

        tituloPagar.setEntidadeNome(entidadePagar);
        tituloPagar.setOperacao(viagem.getTipoOperacao() != null ? viagem.getTipoOperacao().name() : "");
        tituloPagar.setNumeroRota(viagem.getNumeroOperacional() != null ? viagem.getNumeroOperacional() : "");
        tituloPagar.setOrigem(viagem.getOrigem());
        tituloPagar.setDestino(viagem.getDestino());
        tituloPagar.setPerfilVeiculo(viagem.getPerfilVeiculo());
        tituloPagar.setPlaca(viagem.getPlaca());
        tituloPagar.setValorFrete(fretePagar);
        tituloPagar.setValorAdicional(adicPagar);
        tituloPagar.setTotalPrevisto(totalPagar);
        tituloPagar.setDataColeta(viagem.getDataColetaPrevista());
        tituloPagar.setDataEntrega(viagem.getDataEntregaPrevista());
        tituloPagar.setDataPagamento(viagem.getDataHoraPagamento());

        if (tituloPagar.getId() == null) {
        tituloPagar.setTotalRealizado(BigDecimal.ZERO);
            tituloPagar.setSaldoEmAberto(totalPagar);
            tituloPagar.setStatus("PENDENTE");
        }
tituloPagar = tituloRepo.save(tituloPagar);

sincronizarLancamentosPagar(viagem, tituloPagar, fretePagar, adicPagar);