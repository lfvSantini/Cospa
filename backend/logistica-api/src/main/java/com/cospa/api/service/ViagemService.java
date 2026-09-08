package com.cospa.api.service;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        if (dto.getId() == null || dto.getId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O Número da Viagem (ID) é obrigatório.");
        }
        if (repository.existsById(dto.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma viagem cadastrada com o número #" + dto.getId());
        }

        Viagem viagem = new Viagem();
        viagem.setId(dto.getId());
        copiarDtoParaEntidade(dto, viagem);
        return repository.save(viagem);
    }

    @Transactional
    public Optional<Viagem> atualizar(Long idAntigo, ViagemRequestDTO dto) {
        if (!repository.existsById(idAntigo)) {
            return Optional.empty();
        }

        Long idDestino = idAntigo;

        // Se o usuário modificou o número da viagem (ID) na edição
        if (dto.getId() != null && !dto.getId().equals(idAntigo)) {
            if (repository.existsById(dto.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe outra viagem cadastrada com o número #" + dto.getId());
            }
            repository.atualizarIdComprovantes(idAntigo, dto.getId());
            repository.atualizarId(idAntigo, dto.getId());
            idDestino = dto.getId();
        }

        return repository.findById(idDestino).map(viagem -> {
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

        v.setPerfilVeiculo(dto.getPerfilVeiculo());
        v.setCarroceriaVeiculo(dto.getCarroceriaVeiculo());

        v.setNomeMotorista(dto.getNomeMotorista());
        v.setPlaca(dto.getPlaca());
        v.setPlacaSecundaria(dto.getPlacaSecundaria());
        v.setCpfMotorista(dto.getCpfMotorista());

        v.setFornecedorAgencia(dto.getFornecedorAgencia());
        v.setAgenciador(dto.getAgenciador());
        v.setEspecialistaCospa(dto.getEspecialistaCospa());

        v.setDataColetaPrevista(dto.getDataColetaPrevista());
        v.setDataColetaReal(dto.getDataColetaReal());
        v.setDataEntregaPrevista(dto.getDataEntregaPrevista());
        v.setDataEntregaReal(dto.getDataEntregaReal());

        v.setValorAReceber(dto.getValorAReceber() != null ? dto.getValorAReceber() : BigDecimal.ZERO);
        v.setValorAPagar(dto.getValorAPagar() != null ? dto.getValorAPagar() : BigDecimal.ZERO);
        v.setValorAdicionalReceber(dto.getValorAdicionalReceber() != null ? dto.getValorAdicionalReceber() : BigDecimal.ZERO);
        v.setValorAdicionalPagar(dto.getValorAdicionalPagar() != null ? dto.getValorAdicionalPagar() : BigDecimal.ZERO);
        v.setValorAdicionalAgencia(dto.getValorAdicionalAgencia() != null ? dto.getValorAdicionalAgencia() : BigDecimal.ZERO);
        v.setValorAgenciador(dto.getValorAgenciador() != null ? dto.getValorAgenciador() : BigDecimal.ZERO);
        v.setValorEspecialistaCospa(dto.getValorEspecialistaCospa() != null ? dto.getValorEspecialistaCospa() : BigDecimal.ZERO);

        v.setPagamentoLiberado(dto.getPagamentoLiberado() != null ? dto.getPagamentoLiberado() : false);
        v.setPagamentoRealizadoStatus(
                dto.getPagamentoRealizadoStatus() != null && !dto.getPagamentoRealizadoStatus().isBlank()
                        ? dto.getPagamentoRealizadoStatus()
                        : "NAO_REALIZADO"
        );
        v.setDataHoraPagamento(dto.getDataHoraPagamento());

        v.setDataAdiantamento(dto.getDataAdiantamento());
        v.setPagoAdiantamento(dto.getPagoAdiantamento() != null ? dto.getPagoAdiantamento() : false);

        v.setDataSaldo(dto.getDataSaldo());
        v.setPagoSaldo(dto.getPagoSaldo() != null ? dto.getPagoSaldo() : false);

        v.setDataAdicional(dto.getDataAdicional());
        v.setPagoAdicional(dto.getPagoAdicional() != null ? dto.getPagoAdicional() : false);

        v.setObservacao(dto.getObservacao());

        if (dto.getStatus() != null) {
            v.setStatus(dto.getStatus());
        } else if (v.getStatus() == null) {
            v.setStatus(StatusViagem.PROGRAMADO);
        }
    }
}