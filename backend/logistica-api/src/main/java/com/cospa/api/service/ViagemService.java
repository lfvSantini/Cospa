package com.cospa.api.service;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.model.ViagemData;
import com.cospa.api.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ViagemService {

    @Autowired
    private ViagemRepository repository;

    @Autowired
    private FinanceiroService financeiroService;

    @Transactional(readOnly = true)
    public List<Viagem> listarTodas() {
        return repository.findAllByOrderByIdDesc();
    }

    @Transactional(readOnly = true)
    public Optional<Viagem> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Viagem salvar(ViagemRequestDTO dto) {
        Viagem viagem = new Viagem();
        viagem.setId(null);

        copiarDtoParaEntidade(dto, viagem);

        String numOp = (dto.getNumeroOperacional() != null) ? dto.getNumeroOperacional().trim() : "";
        viagem.setNumeroOperacional(numOp.isEmpty() ? null : numOp);

        Viagem salva = repository.save(viagem);

        if (salva.getNumeroOperacional() == null || salva.getNumeroOperacional().isBlank()) {
            salva.setNumeroOperacional(salva.getId().toString());
            salva = repository.save(salva);
        }

        financeiroService.gerarTitulosDaViagem(salva);

        return salva;
    }

    @Transactional
    public Optional<Viagem> atualizar(Long id, ViagemRequestDTO dto) {
        return repository.findById(id).map(viagem -> {
            copiarDtoParaEntidade(dto, viagem);

            if (dto.getNumeroOperacional() != null && !dto.getNumeroOperacional().isBlank()) {
                viagem.setNumeroOperacional(dto.getNumeroOperacional().trim());
            }

            Viagem atualizada = repository.save(viagem);

            financeiroService.gerarTitulosDaViagem(atualizada);

            return atualizada;
        });
    }

    @Transactional
    public Optional<Viagem> atualizarStatus(Long id, StatusViagem status) {
        return repository.findById(id).map(viagem -> {
            viagem.setStatus(status);
            Viagem salva = repository.save(viagem);
            financeiroService.gerarTitulosDaViagem(salva);
            return salva;
        });
    }

    @Transactional
    public Optional<Viagem> atualizarObs(Long id, String obs) {
        return repository.findById(id).map(viagem -> {
            viagem.setObservacao(obs);
            return repository.save(viagem);
        });
    }

    @Transactional
    public Optional<Viagem> cancelar(Long id, String motivo) {
        return repository.findById(id).map(viagem -> {
            viagem.setStatus(StatusViagem.CANCELADA);

            String obsAtual = (viagem.getObservacao() != null && !viagem.getObservacao().isBlank())
                    ? viagem.getObservacao().trim() + " | "
                    : "";
            String motivoFormatado = (motivo != null && !motivo.isBlank()) ? motivo.trim() : "Sem motivo informado";

            viagem.setObservacao(obsAtual + "[CANCELADA]: " + motivoFormatado);
            Viagem salva = repository.save(viagem);
            financeiroService.gerarTitulosDaViagem(salva);
            return salva;
        });
    }

    @Transactional
    public Optional<Viagem> finalizar(Long id) {
        return repository.findById(id).map(viagem -> {
            viagem.setStatus(StatusViagem.FINALIZADO);
            Viagem salva = repository.save(viagem);
            financeiroService.gerarTitulosDaViagem(salva);
            return salva;
        });
    }

    @Transactional
    public boolean deletar(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

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
}