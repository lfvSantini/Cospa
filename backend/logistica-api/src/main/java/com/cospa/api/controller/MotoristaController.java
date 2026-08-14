package com.cospa.api.controller;

import com.cospa.api.model.Motorista;
import com.cospa.api.model.MotoristaDocumento;
import com.cospa.api.repository.MotoristaRepository;
import com.cospa.api.repository.MotoristaDocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    // 1. Listar todos os motoristas
    @GetMapping
    public List<Motorista> listarTodos() {
        return repository.findAll();
    }

    // 2. Buscar motorista por ID
    @GetMapping("/{id}")
    public ResponseEntity<Motorista> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Cadastrar motorista
    @PostMapping
    public Motorista cadastrar(@RequestBody Motorista motorista) {
        return repository.save(motorista);
    }

    // 4. Atualizar motorista
    @PutMapping("/{id}")
    public ResponseEntity<Motorista> atualizar(@PathVariable Long id, @RequestBody Motorista motoristaAtualizado) {
        return repository.findById(id).map(motorista -> {
            motorista.setNome(motoristaAtualizado.getNome());
            motorista.setCpf(motoristaAtualizado.getCpf());
            motorista.setPlaca(motoristaAtualizado.getPlaca());
            motorista.setFornecedor(motoristaAtualizado.getFornecedor());
            motorista.setAtivo(motoristaAtualizado.getAtivo());
            motorista.setObservacoes(motoristaAtualizado.getObservacoes());
            Motorista salvo = repository.save(motorista);
            return ResponseEntity.ok(salvo);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 5. Deletar motorista
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // 6. Upload de documentos principais (CNH / CRLV / COMP_ENDERECO)
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

                repository.save(motorista);
                return ResponseEntity.ok(motorista);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Erro ao salvar arquivo.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // 7. Listar documentos extras do motorista ("Outros")
    @GetMapping("/{id}/documentos-extras")
    public ResponseEntity<List<MotoristaDocumento>> listarDocumentosExtras(@PathVariable Long id) {
        List<MotoristaDocumento> docs = motoristaDocumentoRepository.findByMotoristaId(id);
        return ResponseEntity.ok(docs);
    }

    // 8. Upload de documento extra do motorista ("Outros")
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

                MotoristaDocumento docExtra = new MotoristaDocumento(nome, urlRelativa, motorista);
                motoristaDocumentoRepository.save(docExtra);

                return ResponseEntity.ok(docExtra);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Erro ao salvar arquivo.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // 9. Deletar documento extra do motorista
    @DeleteMapping("/documentos-extras/{docId}")
    public ResponseEntity<Void> deletarDocumentoExtra(@PathVariable Long docId) {
        if (motoristaDocumentoRepository.existsById(docId)) {
            motoristaDocumentoRepository.deleteById(docId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}