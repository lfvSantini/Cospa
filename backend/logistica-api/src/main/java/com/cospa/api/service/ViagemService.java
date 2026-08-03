package com.cospa.api.service;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.dto.ViagemResponseDTO;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.repository.ViagemRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ViagemService {

    private final ViagemRepository repository;
    private final String uploadDir = "uploads/comprovantes";

    public ViagemService(ViagemRepository repository) {
        this.repository = repository;
    }

    public List<ViagemResponseDTO> listarTodas() {
        return repository.findAll()
                .stream()
                .map(ViagemResponseDTO::new)
                .toList();
    }

    public ViagemResponseDTO buscarPorId(Long id) {
        Viagem viagem = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada com o ID: " + id));
        return new ViagemResponseDTO(viagem);
    }

    public ViagemResponseDTO salvar(ViagemRequestDTO dto) {
        Viagem viagem = new Viagem();
        viagem.setLocalColeta(dto.localColeta());
        viagem.setLocalEntrega(dto.localEntrega());
        viagem.setNomeMotorista(dto.nomeMotorista());
        viagem.setTransportadora(dto.transportadora());
        viagem.setObservacao(dto.observacao());
        viagem.setStatus(StatusViagem.CRIADA);

        Viagem salva = repository.save(viagem);
        return new ViagemResponseDTO(salva);
    }

    public ViagemResponseDTO salvarComprovante(Long id, MultipartFile arquivo) {
        Viagem viagem = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada com o ID: " + id));

        try {
            Path pastaUpload = Paths.get(uploadDir);
            if (!Files.exists(pastaUpload)) {
                Files.createDirectories(pastaUpload);
            }

            String nomeArquivo = UUID.randomUUID() + "_" + arquivo.getOriginalFilename();
            Path caminhoCompleto = pastaUpload.resolve(nomeArquivo);

            Files.copy(arquivo.getInputStream(), caminhoCompleto, StandardCopyOption.REPLACE_EXISTING);

            viagem.setUrlFotoComprovante("/uploads/comprovantes/" + nomeArquivo);
            Viagem atualizada = repository.save(viagem);

            return new ViagemResponseDTO(atualizada);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar o arquivo do comprovante", e);
        }
    }

    public ViagemResponseDTO atualizarStatus(Long id, StatusViagem novoStatus) {
        Viagem viagem = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada com o ID: " + id));

        viagem.setStatus(novoStatus);

        LocalDateTime agora = LocalDateTime.now();
        switch (novoStatus) {
            case EM_CARREGAMENTO -> viagem.setInicioCarregamento(agora);
            case CARREGADO -> viagem.setFimCarregamento(agora);
            case EM_DESCARREGAMENTO -> viagem.setInicioDescarregamento(agora);
            case FINALIZADA -> viagem.setFimDescarregamento(agora);
            default -> {}
        }

        Viagem atualizada = repository.save(viagem);
        return new ViagemResponseDTO(atualizada);
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Viagem não encontrada com o ID: " + id);
        }
        repository.deleteById(id);
    }
}