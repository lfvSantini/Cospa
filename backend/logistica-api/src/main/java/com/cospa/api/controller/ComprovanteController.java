package com.cospa.api.controller;

import com.cospa.api.model.Comprovante;
import com.cospa.api.repository.ComprovanteRepository;
import com.cospa.api.repository.ViagemRepository;
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
@RequestMapping("/api/viagens")
public class ComprovanteController {

    @Autowired
    private ViagemRepository viagemRepository;

    @Autowired
    private ComprovanteRepository comprovanteRepository;

    private final Path uploadDir = Paths.get("uploads");

    public ComprovanteController() {
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @GetMapping("/{viagemId}/comprovantes")
    public ResponseEntity<List<Comprovante>> listarComprovantes(@PathVariable Long viagemId) {
        List<Comprovante> comprovantes = comprovanteRepository.findByViagemId(viagemId);
        return ResponseEntity.ok(comprovantes);
    }

    @PostMapping("/{viagemId}/comprovantes")
    public ResponseEntity<?> uploadComprovante(
            @PathVariable Long viagemId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("nome") String nome) {

        return viagemRepository.findById(viagemId).map(viagem -> {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo vazio.");
            }

            try {
                String extensao = "";
                String nomeOriginal = file.getOriginalFilename();
                if (nomeOriginal != null && nomeOriginal.contains(".")) {
                    extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
                }

                String nomeArquivo = "viagem_" + viagemId + "_" + UUID.randomUUID().toString().substring(0, 8) + extensao;
                Path destino = uploadDir.resolve(nomeArquivo);
                Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                String urlRelativa = "/uploads/" + nomeArquivo;

                Comprovante comprovante = new Comprovante(nome, urlRelativa, viagem);
                comprovanteRepository.save(comprovante);

                return ResponseEntity.ok(comprovante);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Erro ao salvar arquivo.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{viagemId}/comprovantes/{comprovanteId}")
    public ResponseEntity<Void> deletarComprovante(@PathVariable Long viagemId, @PathVariable Long comprovanteId) {
        if (comprovanteRepository.existsById(comprovanteId)) {
            comprovanteRepository.deleteById(comprovanteId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}