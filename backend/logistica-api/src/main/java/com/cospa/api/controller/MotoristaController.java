package com.cospa.api.controller;

import com.cospa.api.model.Motorista;
import com.cospa.api.model.MotoristaDocumento;
import com.cospa.api.repository.MotoristaDocumentoRepository;
import com.cospa.api.repository.MotoristaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/motoristas")
@CrossOrigin(origins = "*")
public class MotoristaController {

    @Autowired
    private MotoristaRepository repository;

    @Autowired
    private MotoristaDocumentoRepository motoristaDocumentoRepository;

    private final Path uploadDir = Paths.get("uploads");

    public MotoristaController() {
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
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

    @PostMapping("/{id}/documentos")
    public ResponseEntity<?> uploadDocumento(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipo") String tipo) {

        return repository.findById(id).map(motorista -> {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo vazio.");
            }

            try {
                String extensao = "";
                String nomeOriginal = file.getOriginalFilename();
                if (nomeOriginal != null && nomeOriginal.contains(".")) {
                    extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
                }

                String nomeArquivo = "motorista_" + id + "_" + tipo.toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 8) + extensao;
                Path destino = uploadDir.resolve(nomeArquivo);
                Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                String urlRelativa = "/uploads/" + nomeArquivo;

                if ("CNH".equalsIgnoreCase(tipo)) {
                    motorista.setUrlCnh(urlRelativa);
                } else if ("CRLV".equalsIgnoreCase(tipo)) {
                    motorista.setUrlCrlv(urlRelativa);
                } else if ("COMP_ENDERECO".equalsIgnoreCase(tipo)) {
                    motorista.setUrlCompEndereco(urlRelativa);
                }

                // Salva também na lista genérica de documentos do motorista
                MotoristaDocumento doc = new MotoristaDocumento(tipo, urlRelativa, nomeOriginal, motorista);
                motoristaDocumentoRepository.save(doc);

                repository.save(motorista);
                return ResponseEntity.ok(motorista);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Erro ao salvar arquivo.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/documentos-extras")
    public ResponseEntity<List<MotoristaDocumento>> listarDocumentosExtras(@PathVariable Long id) {
        return ResponseEntity.ok(motoristaDocumentoRepository.findByMotoristaId(id));
    }

    @PostMapping("/{id}/documentos-extras")
    public ResponseEntity<?> uploadDocumentoExtra(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("nome") String nome) {

        return repository.findById(id).map(motorista -> {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo vazio.");
            }

            try {
                String extensao = "";
                String nomeOriginal = file.getOriginalFilename();
                if (nomeOriginal != null && nomeOriginal.contains(".")) {
                    extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
                }

                String nomeArquivo = "doc_extra_motorista_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + extensao;
                Path destino = uploadDir.resolve(nomeArquivo);
                Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                String urlRelativa = "/uploads/" + nomeArquivo;

                MotoristaDocumento docExtra = new MotoristaDocumento(nome, urlRelativa, nomeOriginal != null ? nomeOriginal : nome, motorista);
                motoristaDocumentoRepository.save(docExtra);

                return ResponseEntity.ok(docExtra);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Erro ao salvar arquivo.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/documentos-extras/{docId}")
    public ResponseEntity<Void> deletarDocumentoExtra(@PathVariable Long docId) {
        if (motoristaDocumentoRepository.existsById(docId)) {
            motoristaDocumentoRepository.deleteById(docId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}