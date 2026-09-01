package com.cospa.api.controller;

import com.cospa.api.model.Motorista;
import com.cospa.api.model.MotoristaDocumento;
import com.cospa.api.repository.MotoristaDocumentoRepository;
import com.cospa.api.repository.MotoristaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/motoristas")
@CrossOrigin(origins = "*")
public class MotoristaController {

    private static final Logger log = LoggerFactory.getLogger(MotoristaController.class);

    @Autowired
    private MotoristaRepository repository;

    @Autowired
    private MotoristaDocumentoRepository motoristaDocumentoRepository;

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    private Path getUploadPath() {
        Path path = Paths.get(uploadDirConfig).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            try {
                Files.createDirectories(path);
            } catch (Exception e) {
                path = Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize();
                try {
                    Files.createDirectories(path);
                } catch (Exception ignored) {}
            }
        }
        return path;
    }

    @GetMapping
    public List<Motorista> listarTodos() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Motorista> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Motorista> cadastrar(@RequestBody Motorista motorista) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(motorista));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Motorista> atualizar(@PathVariable Long id, @RequestBody Motorista motoristaAtualizado) {
        return repository.findById(id).map(motorista -> {
            motorista.setNome(motoristaAtualizado.getNome());
            motorista.setCpf(motoristaAtualizado.getCpf());
            motorista.setPlaca(motoristaAtualizado.getPlaca());
            motorista.setFornecedor(motoristaAtualizado.getFornecedor());
            motorista.setSituacao(motoristaAtualizado.getSituacao() != null ? motoristaAtualizado.getSituacao() : "ATIVO");
            motorista.setAtivo(motoristaAtualizado.getAtivo() != null ? motoristaAtualizado.getAtivo() : true);
            motorista.setInformacoesAdicionais(motoristaAtualizado.getInformacoesAdicionais());
            motorista.setObservacoes(motoristaAtualizado.getObservacoes());
            return ResponseEntity.ok(repository.save(motorista));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/{id}/documentos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> uploadDocumento(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tipo", required = false) String tipo,
            @RequestParam(value = "nome", required = false) String nome,
            @RequestParam(value = "descricao", required = false) String descricao) {

        log.info("Recebendo upload de documento para o motorista ID: {}", id);

        return repository.findById(id).map(motorista -> {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo vazio.");
            }

            try {
                String tipoDocFinal = (tipo != null && !tipo.isBlank()) ? tipo :
                        (nome != null && !nome.isBlank()) ? nome :
                                (descricao != null && !descricao.isBlank()) ? descricao : "Documento";

                String extensao = "";
                String nomeOriginal = file.getOriginalFilename();
                if (nomeOriginal != null && nomeOriginal.contains(".")) {
                    extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
                }

                String nomeArquivo = "motorista_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + extensao;
                Path uploadFolder = getUploadPath();
                Path destino = uploadFolder.resolve(nomeArquivo).normalize();

                Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                String urlRelativa = "/uploads/" + nomeArquivo;

                if ("CNH".equalsIgnoreCase(tipoDocFinal)) {
                    motorista.setUrlCnh(urlRelativa);
                } else if ("CRLV".equalsIgnoreCase(tipoDocFinal)) {
                    motorista.setUrlCrlv(urlRelativa);
                } else if ("COMP_ENDERECO".equalsIgnoreCase(tipoDocFinal)) {
                    motorista.setUrlCompEndereco(urlRelativa);
                }

                MotoristaDocumento doc = new MotoristaDocumento();
                doc.setDescricao(tipoDocFinal);
                doc.setUrl(urlRelativa);
                doc.setNomeArquivo(nomeOriginal != null ? nomeOriginal : nomeArquivo);
                doc.setDataEnvio(LocalDateTime.now());
                doc.setMotorista(motorista);

                if (motorista.getDocumentos() == null) {
                    motorista.setDocumentos(new ArrayList<>());
                }
                motorista.getDocumentos().add(doc);

                MotoristaDocumento salvo = motoristaDocumentoRepository.save(doc);
                repository.save(motorista);

                log.info("Documento {} salvo com sucesso para o motorista {}", salvo.getId(), id);
                return ResponseEntity.ok(salvo);
            } catch (Exception e) {
                log.error("Erro critico no upload de documento do motorista {}: ", id, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erro ao processar documento: " + e.getMessage());
            }
        }).orElseGet(() -> {
            log.warn("Motorista ID {} nao encontrado para upload de documento", id);
            return ResponseEntity.notFound().build();
        });
    }

    @GetMapping("/{id}/documentos-extras")
    public ResponseEntity<List<MotoristaDocumento>> listarDocumentosExtras(@PathVariable Long id) {
        return ResponseEntity.ok(motoristaDocumentoRepository.findByMotoristaId(id));
    }

    @PostMapping(value = "/{id}/documentos-extras", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> uploadDocumentoExtra(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "nome", required = false) String nome,
            @RequestParam(value = "tipo", required = false) String tipo) {

        return uploadDocumento(id, file, tipo, nome, null);
    }

    @DeleteMapping("/documentos-extras/{docId}")
    @Transactional
    public ResponseEntity<Void> deletarDocumentoExtra(@PathVariable Long docId) {
        return motoristaDocumentoRepository.findById(docId).map(doc -> {
            try {
                if (doc.getUrl() != null) {
                    String nomeArquivo = doc.getUrl().substring(doc.getUrl().lastIndexOf('/') + 1);
                    Path arquivoFisico = getUploadPath().resolve(nomeArquivo);
                    Files.deleteIfExists(arquivoFisico);
                }
            } catch (Exception ignored) {}

            motoristaDocumentoRepository.delete(doc);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}