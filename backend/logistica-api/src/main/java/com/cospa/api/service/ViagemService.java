package com.cospa.api.service;

import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ViagemService {

    @Autowired
    private ViagemRepository viagemRepository;

    // Listar todas as viagens
    public List<Viagem> listarTodas() {
        return viagemRepository.findAll();
    }

    // Buscar viagem por ID
    public Optional<Viagem> buscarPorId(Long id) {
        return viagemRepository.findById(id);
    }

    // Criar uma viagem
    public Viagem criarViagem(Viagem viagem) {
        viagem.setStatus(StatusViagem.CRIADA);
        return viagemRepository.save(viagem);
    }

    // Avançar status e gravar horários automaticamente
    public Viagem atualizarStatus(Long id, StatusViagem novoStatus, String observacao, String urlFoto) {
        Viagem viagem = viagemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada com o ID: " + id));

        LocalDateTime agora = LocalDateTime.now();

        // Lógica de transição de status e marcação de tempo
        switch (novoStatus) {
            case EM_CARREGAMENTO:
                viagem.setInicioCarregamento(agora);
                break;
            case CARREGADO:
                viagem.setFimCarregamento(agora);
                break;
            case EM_DESCARREGAMENTO:
                viagem.setInicioDescarregamento(agora);
                break;
            case FINALIZADA:
                viagem.setFimDescarregamento(agora);
                if (urlFoto != null && !urlFoto.isBlank()) {
                    viagem.setUrlFotoComprovante(urlFoto);
                }
                break;
            default:
                break;
        }

        viagem.setStatus(novoStatus);

        if (observacao != null && !observacao.isBlank()) {
            viagem.setObservacao(observacao);
        }

        return viagemRepository.save(viagem);
    }

    // Método auxiliar para calcular o tempo de carregamento em minutos
    public Long calcularTempoCarregamentoMinutos(Viagem viagem) {
        if (viagem.getInicioCarregamento() != null && viagem.getFimCarregamento() != null) {
            return Duration.between(viagem.getInicioCarregamento(), viagem.getFimCarregamento()).toMinutes();
        }
        return 0L;
    }

    // Método auxiliar para calcular o tempo de descarregamento em minutos
    public Long calcularTempoDescarregamentoMinutos(Viagem viagem) {
        if (viagem.getInicioDescarregamento() != null && viagem.getFimDescarregamento() != null) {
            return Duration.between(viagem.getInicioDescarregamento(), viagem.getFimDescarregamento()).toMinutes();
        }
        return 0L;
    }
}