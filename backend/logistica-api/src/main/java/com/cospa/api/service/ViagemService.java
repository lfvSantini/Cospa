package com.cospa.api.service;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
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

    @Transactional(readOnly = true)
    public List<Viagem> listarTodas() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Viagem> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Viagem salvar(ViagemRequestDTO dto) {
        Viagem viagem = new Viagem();
        if (dto.getId() != null) {
            viagem.setId(dto.getId());
        }
        copiarDtoParaEntidade(dto, viagem);
        return repository.save(viagem);
    }

    @Transactional
    public Viagem salvarOuAtualizar(Long id, ViagemRequestDTO dto) {
        Viagem viagem = (id != null)
                ? repository.findById(id).orElseGet(() -> {
            Viagem nova = new Viagem();
            nova.setId(id);
            return nova;
        })
                : new Viagem();

        copiarDtoParaEntidade(dto, viagem);
        return repository.save(viagem);
    }

    @Transactional
    public Optional<Viagem> atualizar(Long id, ViagemRequestDTO dto) {
        return repository.findById(id).map(viagem -> {
            copiarDtoParaEntidade(dto, viagem);
            return repository.save(viagem);
        });
    }

    @Transactional
    public Optional<Viagem> atualizarStatus(Long id, StatusViagem status) {
        return repository.findById(id).map(viagem -> {
            viagem.setStatus(status);
            return repository.save(viagem);
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
    public Optional<Viagem> finalizar(Long id) {
        return repository.findById(id).map(viagem -> {
            viagem.setStatus(StatusViagem.FINALIZADO);
            return repository.save(viagem);
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

    public void copiarDtoParaEntidade(ViagemRequestDTO dto, Viagem v) {
        v.setCliente(dto.getCliente());
        v.setLocalColeta(dto.getLocalColeta());
        v.setLocalEntrega(dto.getLocalEntrega());
        v.setOrigem(dto.getOrigem());
        v.setDestino(dto.getDestino());
        v.setOrigemNome(dto.getOrigemNome());
        v.setDestinoNome(dto.getDestinoNome());
        v.setNomeMotorista(dto.getNomeMotorista());
        v.setPlaca(dto.getPlaca());
        v.setCpfMotorista(dto.getCpfMotorista());
        v.setFornecedorAgencia(dto.getFornecedorAgencia());

        v.setDataColetaPrevista(dto.getDataColetaPrevista());
        v.setDataColetaReal(dto.getDataColetaReal());
        v.setDataEntregaPrevista(dto.getDataEntregaPrevista());
        v.setDataEntregaReal(dto.getDataEntregaReal());

        v.setValorAReceber(dto.getValorAReceber() != null ? dto.getValorAReceber() : BigDecimal.ZERO);
        v.setValorAPagar(dto.getValorAPagar() != null ? dto.getValorAPagar() : BigDecimal.ZERO);
        v.setValorAdicionalReceber(dto.getValorAdicionalReceber() != null ? dto.getValorAdicionalReceber() : BigDecimal.ZERO);
        v.setValorAdicionalPagar(dto.getValorAdicionalPagar() != null ? dto.getValorAdicionalPagar() : BigDecimal.ZERO);
        v.setValorAdicionalAgencia(dto.getValorAdicionalAgencia() != null ? dto.getValorAdicionalAgencia() : BigDecimal.ZERO);

        v.setPagamentoLiberado(dto.getPagamentoLiberado() != null ? dto.getPagamentoLiberado() : false);
        v.setPagamentoRealizadoStatus(
                dto.getPagamentoRealizadoStatus() != null && !dto.getPagamentoRealizadoStatus().isBlank()
                        ? dto.getPagamentoRealizadoStatus()
                        : "NAO_REALIZADO"
        );
        v.setDataHoraPagamento(dto.getDataHoraPagamento());
        v.setObservacao(dto.getObservacao());

        if (dto.getStatus() != null) {
            v.setStatus(dto.getStatus());
        } else if (v.getStatus() == null) {
            v.setStatus(StatusViagem.PROGRAMADO);
        }
    }
}