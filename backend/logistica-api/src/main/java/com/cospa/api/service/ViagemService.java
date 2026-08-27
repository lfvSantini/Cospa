package com.cospa.api.service;

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

    // 1. Listar todas as viagens
    @Transactional(readOnly = true)
    public List<Viagem> listarTodas() {
        return repository.findAll();
    }

    // 2. Buscar viagem por ID
    @Transactional(readOnly = true)
    public Optional<Viagem> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // 3. Cadastrar nova viagem
    @Transactional
    public Viagem salvar(Viagem viagem) {
        if (viagem.getStatus() == null) {
            viagem.setStatus(StatusViagem.PROGRAMADO);
        }

        // Garante valores padrão caso venham nulos do frontend
        if (viagem.getValorAReceber() == null) {
            viagem.setValorAReceber(BigDecimal.ZERO);
        }
        if (viagem.getValorAPagar() == null) {
            viagem.setValorAPagar(BigDecimal.ZERO);
        }
        if (viagem.getValorAdicionalReceber() == null) {
            viagem.setValorAdicionalReceber(BigDecimal.ZERO);
        }
        if (viagem.getValorAdicionalPagar() == null) {
            viagem.setValorAdicionalPagar(BigDecimal.ZERO);
        }
        if (viagem.getValorAdicionalAgencia() == null) {
            viagem.setValorAdicionalAgencia(BigDecimal.ZERO);
        }
        if (viagem.getPagamentoLiberado() == null) {
            viagem.setPagamentoLiberado(false);
        }
        if (viagem.getPagamentoRealizadoStatus() == null || viagem.getPagamentoRealizadoStatus().isBlank()) {
            viagem.setPagamentoRealizadoStatus("NAO_REALIZADO");
        }

        return repository.save(viagem);
    }

    // 4. Atualizar viagem existente
    @Transactional
    public Optional<Viagem> atualizar(Long id, Viagem dadosAtualizados) {
        return repository.findById(id).map(viagem -> {
            viagem.setCliente(dadosAtualizados.getCliente());
            viagem.setLocalColeta(dadosAtualizados.getLocalColeta());
            viagem.setLocalEntrega(dadosAtualizados.getLocalEntrega());
            viagem.setOrigem(dadosAtualizados.getOrigem());
            viagem.setDestino(dadosAtualizados.getDestino());
            viagem.setOrigemNome(dadosAtualizados.getOrigemNome());
            viagem.setDestinoNome(dadosAtualizados.getDestinoNome());
            viagem.setNomeMotorista(dadosAtualizados.getNomeMotorista());
            viagem.setPlaca(dadosAtualizados.getPlaca());
            viagem.setCpfMotorista(dadosAtualizados.getCpfMotorista());
            viagem.setFornecedorAgencia(dadosAtualizados.getFornecedorAgencia());

            // Datas e observações
            viagem.setDataColetaPrevista(dadosAtualizados.getDataColetaPrevista());
            viagem.setDataColetaReal(dadosAtualizados.getDataColetaReal());
            viagem.setDataEntregaPrevista(dadosAtualizados.getDataEntregaPrevista());
            viagem.setDataEntregaReal(dadosAtualizados.getDataEntregaReal());
            viagem.setObservacao(dadosAtualizados.getObservacao());

            // Valores e adicionais
            viagem.setValorAReceber(dadosAtualizados.getValorAReceber() != null ? dadosAtualizados.getValorAReceber() : BigDecimal.ZERO);
            viagem.setValorAPagar(dadosAtualizados.getValorAPagar() != null ? dadosAtualizados.getValorAPagar() : BigDecimal.ZERO);
            viagem.setValorAdicionalReceber(dadosAtualizados.getValorAdicionalReceber() != null ? dadosAtualizados.getValorAdicionalReceber() : BigDecimal.ZERO);
            viagem.setValorAdicionalPagar(dadosAtualizados.getValorAdicionalPagar() != null ? dadosAtualizados.getValorAdicionalPagar() : BigDecimal.ZERO);
            viagem.setValorAdicionalAgencia(dadosAtualizados.getValorAdicionalAgencia() != null ? dadosAtualizados.getValorAdicionalAgencia() : BigDecimal.ZERO);

            // Status e dados de Pagamento
            viagem.setPagamentoLiberado(dadosAtualizados.getPagamentoLiberado() != null ? dadosAtualizados.getPagamentoLiberado() : false);
            viagem.setPagamentoRealizadoStatus(
                    dadosAtualizados.getPagamentoRealizadoStatus() != null && !dadosAtualizados.getPagamentoRealizadoStatus().isBlank()
                            ? dadosAtualizados.getPagamentoRealizadoStatus()
                            : "NAO_REALIZADO"
            );
            viagem.setDataHoraPagamento(dadosAtualizados.getDataHoraPagamento());

            // Status da viagem
            if (dadosAtualizados.getStatus() != null) {
                viagem.setStatus(dadosAtualizados.getStatus());
            }

            return repository.save(viagem);
        });
    }

    // 5. Atualizar apenas o status da viagem
    @Transactional
    public Optional<Viagem> atualizarStatus(Long id, StatusViagem status) {
        return repository.findById(id).map(viagem -> {
            viagem.setStatus(status);
            return repository.save(viagem);
        });
    }

    // 6. Atualizar apenas as observações da viagem
    @Transactional
    public Optional<Viagem> atualizarObs(Long id, String obs) {
        return repository.findById(id).map(viagem -> {
            viagem.setObservacao(obs);
            return repository.save(viagem);
        });
    }

    // 7. Finalizar viagem (troca status para FINALIZADO)
    @Transactional
    public Optional<Viagem> finalizar(Long id) {
        return repository.findById(id).map(viagem -> {
            viagem.setStatus(StatusViagem.FINALIZADO);
            return repository.save(viagem);
        });
    }

    // 8. Deletar viagem
    @Transactional
    public boolean deletar(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}