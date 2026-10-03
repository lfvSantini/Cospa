package com.cospa.api.service;

import com.cospa.api.model.LancamentoFinanceiro;
import com.cospa.api.model.TituloFinanceiro;
import com.cospa.api.model.Viagem;
import com.cospa.api.repository.LancamentoFinanceiroRepository;
import com.cospa.api.repository.TituloFinanceiroRepository;
import com.cospa.api.repository.ViagemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceiroService {

    private final TituloFinanceiroRepository tituloRepo;
    private final LancamentoFinanceiroRepository lancamentoRepo;
    private final ViagemRepository viagemRepo;
    private final ArquivoService arquivoService;

    @Transactional(readOnly = true)
    public List<TituloFinanceiro> listarPorTipo(String tipo) {
        return tituloRepo.findByTipoOrderByIdDesc(tipo);
    }

    @Transactional(readOnly = true)
    public List<LancamentoFinanceiro> listarTodosLancamentos() {
        return lancamentoRepo.findAllByOrderByIdDesc();
    }

    @Transactional
    public int sincronizarTodasViagensAntigas() {
        List<Viagem> viagens = viagemRepo.findAll();
        for (Viagem viagem : viagens) {
            gerarTitulosDaViagem(viagem);
        }
        return viagens.size();
    }

    @Transactional
    public void gerarTitulosDaViagem(Viagem viagem) {
        if (viagem == null || viagem.getId() == null) return;

        BigDecimal freteReceber = viagem.getValorAReceber() != null ? viagem.getValorAReceber() : BigDecimal.ZERO;
        BigDecimal adicReceber = viagem.getValorAdicionalReceber() != null ? viagem.getValorAdicionalReceber() : BigDecimal.ZERO;
        BigDecimal totalReceber = freteReceber.add(adicReceber);

        BigDecimal fretePagar = viagem.getValorAPagar() != null ? viagem.getValorAPagar() : BigDecimal.ZERO;
        BigDecimal adicPagar = viagem.getValorAdicionalPagar() != null ? viagem.getValorAdicionalPagar() : BigDecimal.ZERO;
        BigDecimal totalPagar = fretePagar.add(adicPagar);

        // ==========================================
        // 1. TÍTULO A RECEBER (CLIENTE)
        // ==========================================
        TituloFinanceiro tituloReceber = tituloRepo.findByViagemIdAndTipo(viagem.getId(), "A RECEBER")
                .orElseGet(() -> TituloFinanceiro.builder()
                        .idTitulo("REC-" + viagem.getId())
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

        TituloFinanceiro tituloPagar = tituloRepo.findByViagemIdAndTipo(viagem.getId(), "A PAGAR")
                .orElseGet(() -> TituloFinanceiro.builder()
                        .idTitulo("PAG-" + viagem.getId())
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
    }

    private void sincronizarLancamentosReceber(Viagem viagem, TituloFinanceiro titulo, BigDecimal frete, BigDecimal adicional) {
        List<LancamentoFinanceiro> existentes = lancamentoRepo.findByTituloIdOrderByIdAsc(titulo.getId());
        if (existentes.isEmpty() && frete.compareTo(BigDecimal.ZERO) > 0) {
            LancamentoFinanceiro lanc = LancamentoFinanceiro.builder()
                    .titulo(titulo)
                    .viagemId(viagem.getId())
                    .tipo("A RECEBER")
                    .etapa("SALDO")
                    .entidadeNome(titulo.getEntidadeNome())
                    .valorPrevisto(frete)
                    .valorRealizado(BigDecimal.ZERO)
                    .saldoEmAberto(frete)
                    .dataVencimento(viagem.getDataEntregaPrevista())
                    .status("PENDENTE")
                    .build();
            lancamentoRepo.save(lanc);
        }

        if (adicional.compareTo(BigDecimal.ZERO) > 0 && existentes.stream().noneMatch(l -> "ADICIONAL".equals(l.getEtapa()))) {
            LancamentoFinanceiro lancAdic = LancamentoFinanceiro.builder()
                    .titulo(titulo)
                    .viagemId(viagem.getId())
                    .tipo("A RECEBER")
                    .etapa("ADICIONAL")
                    .tipoAdicional(viagem.getTipoAdicionalReceber() != null ? viagem.getTipoAdicionalReceber().name() : "")
                    .entidadeNome(titulo.getEntidadeNome())
                    .valorPrevisto(adicional)
                    .valorRealizado(BigDecimal.ZERO)
                    .saldoEmAberto(adicional)
                    .status("PENDENTE")
                    .build();
            lancamentoRepo.save(lancAdic);
        }
    }

    private void sincronizarLancamentosPagar(Viagem viagem, TituloFinanceiro titulo, BigDecimal frete, BigDecimal adicional) {
        List<LancamentoFinanceiro> existentes = lancamentoRepo.findByTituloIdOrderByIdAsc(titulo.getId());
        if (existentes.isEmpty() && frete.compareTo(BigDecimal.ZERO) > 0) {
            boolean pagoAdiant = Boolean.TRUE.equals(viagem.getPagoAdiantamento());
            LancamentoFinanceiro lanc = LancamentoFinanceiro.builder()
                    .titulo(titulo)
                    .viagemId(viagem.getId())
                    .tipo("A PAGAR")
                    .etapa("ADIANTAMENTO")
                    .entidadeNome(titulo.getEntidadeNome())
                    .valorPrevisto(frete)
                    .valorRealizado(pagoAdiant ? frete : BigDecimal.ZERO)
                    .saldoEmAberto(pagoAdiant ? BigDecimal.ZERO : frete)
                    .dataVencimento(viagem.getDataAdiantamento())
                    .dataEfetiva(pagoAdiant ? viagem.getDataAdiantamento() : null)
                    .status(pagoAdiant ? "QUITADO" : "PENDENTE")
                    .build();
            lancamentoRepo.save(lanc);
        }

        if (adicional.compareTo(BigDecimal.ZERO) > 0 && existentes.stream().noneMatch(l -> "ADICIONAL".equals(l.getEtapa()))) {
            boolean pagoAdic = Boolean.TRUE.equals(viagem.getPagoAdicional());
            LancamentoFinanceiro lancAdic = LancamentoFinanceiro.builder()
                    .titulo(titulo)
                    .viagemId(viagem.getId())
                    .tipo("A PAGAR")
                    .etapa("ADICIONAL")
                    .tipoAdicional(viagem.getTipoAdicionalPagar() != null ? viagem.getTipoAdicionalPagar().name() : "")
                    .entidadeNome(titulo.getEntidadeNome())
                    .valorPrevisto(adicional)
                    .valorRealizado(pagoAdic ? adicional : BigDecimal.ZERO)
                    .saldoEmAberto(pagoAdic ? BigDecimal.ZERO : adicional)
                    .dataVencimento(viagem.getDataAdicional())
                    .dataEfetiva(pagoAdic ? viagem.getDataAdicional() : null)
                    .status(pagoAdic ? "QUITADO" : "PENDENTE")
                    .build();
            lancamentoRepo.save(lancAdic);
        }
    }

    @Transactional
    public LancamentoFinanceiro realizarBaixa(Long lancamentoId, BigDecimal valorRealizado, String dataEfetiva, MultipartFile arquivo, String obs) {
        LancamentoFinanceiro lancamento = lancamentoRepo.findById(lancamentoId)
                .orElseThrow(() -> new RuntimeException("Lançamento não encontrado: " + lancamentoId));

        BigDecimal valorEfetivo = valorRealizado != null ? valorRealizado : lancamento.getValorPrevisto();
        lancamento.setValorRealizado(valorEfetivo);
        lancamento.setDataEfetiva(dataEfetiva);
        lancamento.setSaldoEmAberto(lancamento.getValorPrevisto().subtract(valorEfetivo).max(BigDecimal.ZERO));
        lancamento.setStatus(lancamento.getSaldoEmAberto().compareTo(BigDecimal.ZERO) == 0 ? "QUITADO" : "PARCIAL");

        if (obs != null && !obs.isBlank()) {
            lancamento.setObservacao(obs);
        }

        if (arquivo != null && !arquivo.isEmpty()) {
            // Utiliza o método existente salvarArquivo(file, subpasta) do ArquivoService
            String url = arquivoService.salvarArquivo(arquivo, "comprovantes");
            lancamento.setComprovanteUrl(url);
        }

        LancamentoFinanceiro salvo = lancamentoRepo.save(lancamento);

        TituloFinanceiro titulo = lancamento.getTitulo();
        if (titulo != null) {
            List<LancamentoFinanceiro> parcelas = lancamentoRepo.findByTituloIdOrderByIdAsc(titulo.getId());
            BigDecimal somaRealizada = parcelas.stream()
                    .map(LancamentoFinanceiro::getValorRealizado)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            titulo.setTotalRealizado(somaRealizada);
            titulo.setSaldoEmAberto(titulo.getTotalPrevisto().subtract(somaRealizada).max(BigDecimal.ZERO));

            if (titulo.getSaldoEmAberto().compareTo(BigDecimal.ZERO) == 0) {
                titulo.setStatus("QUITADO");
            } else if (somaRealizada.compareTo(BigDecimal.ZERO) > 0) {
                titulo.setStatus("PARCIAL");
            } else {
                titulo.setStatus("PENDENTE");
            }
            tituloRepo.save(titulo);
        }

        return salvo;
    }
}