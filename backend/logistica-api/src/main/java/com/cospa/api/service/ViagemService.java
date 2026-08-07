package com.cospa.api.service;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.dto.ViagemResponseDTO;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class ViagemService {

    @Autowired
    private ViagemRepository repository;

    private final Path uploadDir = Paths.get("uploads");

    public ViagemService() {
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar o diretório de uploads", e);
        }
    }

    public List<ViagemResponseDTO> listarTodas() {
        return repository.findAll().stream()
                .map(ViagemResponseDTO::new)
                .toList();
    }

    public ViagemResponseDTO buscarPorId(Long id) {
        Viagem viagem = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada com o ID: " + id));
        return new ViagemResponseDTO(viagem);
    }

    @Transactional
    public ViagemResponseDTO salvar(ViagemRequestDTO dto) {
        if (dto.id() != null && repository.existsById(dto.id())) {
            throw new RuntimeException("Já existe uma viagem cadastrada com o ID: " + dto.id());
        }

        Viagem viagem = new Viagem();
        if (dto.id() != null) {
            viagem.setId(dto.id());
        }
        viagem.setCliente(dto.cliente());
        viagem.setLocalColeta(dto.localColeta());
        viagem.setLocalEntrega(dto.localEntrega());
        viagem.setPlaca(dto.placa());
        viagem.setNomeMotorista(dto.nomeMotorista());
        viagem.setCpfMotorista(dto.cpfMotorista());
        viagem.setDataColetaPrevista(dto.dataColetaPrevista());
        viagem.setDataColetaReal(dto.dataColetaReal());
        viagem.setDataEntregaPrevista(dto.dataEntregaPrevista());
        viagem.setDataEntregaReal(dto.dataEntregaReal());
        viagem.setObservacao(dto.observacao());
        viagem.setStatus(dto.status() != null ? dto.status() : StatusViagem.CRIADA);

        Viagem salva = repository.save(viagem);
        return new ViagemResponseDTO(salva);
    }

    @Transactional
    public ViagemResponseDTO atualizar(Long idAntigo, ViagemRequestDTO dto) {
        Viagem viagem = repository.findById(idAntigo)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada com o ID: " + idAntigo));

        // Atualização da chave primária (ID) se o usuário enviou um ID diferente
        if (dto.id() != null && !dto.id().equals(idAntigo)) {
            if (repository.existsById(dto.id())) {
                throw new RuntimeException("O ID " + dto.id() + " já está em uso por outra viagem!");
            }
            repository.atualizarId(idAntigo, dto.id());
            viagem = repository.findById(dto.id())
                    .orElseThrow(() -> new RuntimeException("Erro ao buscar a viagem com o novo ID"));
        }

        viagem.setCliente(dto.cliente());
        viagem.setLocalColeta(dto.localColeta());
        viagem.setLocalEntrega(dto.localEntrega());
        viagem.setPlaca(dto.placa());
        viagem.setNomeMotorista(dto.nomeMotorista());
        viagem.setCpfMotorista(dto.cpfMotorista());
        viagem.setDataColetaPrevista(dto.dataColetaPrevista());
        viagem.setDataColetaReal(dto.dataColetaReal());
        viagem.setDataEntregaPrevista(dto.dataEntregaPrevista());
        viagem.setDataEntregaReal(dto.dataEntregaReal());
        if (dto.status() != null) {
            viagem.setStatus(dto.status());
        }
        viagem.setObservacao(dto.observacao());

        Viagem salva = repository.save(viagem);
        return new ViagemResponseDTO(salva);
    }

    @Transactional
    public ViagemResponseDTO salvarComprovante(Long id, MultipartFile arquivo) {
        Viagem viagem = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada com o ID: " + id));

        if (arquivo.isEmpty()) {
            throw new RuntimeException("O arquivo enviado está vazio.");
        }

        try {
            String nomeArquivoOriginal = arquivo.getOriginalFilename();
            String extensao = "";
            if (nomeArquivoOriginal != null && nomeArquivoOriginal.contains(".")) {
                extensao = nomeArquivoOriginal.substring(nomeArquivoOriginal.lastIndexOf("."));
            }

            String novoNomeArquivo = UUID.randomUUID().toString() + extensao;
            Path caminhoDestino = this.uploadDir.resolve(novoNomeArquivo);

            Files.copy(arquivo.getInputStream(), caminhoDestino, StandardCopyOption.REPLACE_EXISTING);

            String urlRelativa = "/uploads/" + novoNomeArquivo;
            viagem.setUrlFotoComprovante(urlRelativa);

            Viagem salva = repository.save(viagem);
            return new ViagemResponseDTO(salva);

        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar o arquivo do comprovante", e);
        }
    }

    @Transactional
    public ViagemResponseDTO atualizarStatus(Long id, StatusViagem status) {
        Viagem viagem = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Viagem não encontrada com o ID: " + id));

        viagem.setStatus(status);
        Viagem salva = repository.save(viagem);
        return new ViagemResponseDTO(salva);
    }

    @Transactional
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Viagem não encontrada com o ID: " + id);
        }
        repository.deleteById(id);
    }
}