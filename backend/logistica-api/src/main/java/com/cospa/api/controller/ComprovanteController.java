package com.cospa.api.controller;

import com.cospa.api.model.Comprovante;
import com.cospa.api.repository.ComprovanteRepository;
import com.cospa.api.repository.ViagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
@CrossOrigin(origins = "*")
public class ComprovanteController {

    @Autowired
    private ViagemRepository viagemRepository;

    @Autowired
    private ComprovanteRepository comprovanteRepository;

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    private Path getUploadPath() {
        Path path = Paths.get(uploadDirConfig).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            try {
                Files.createDirectories(path);
            } catch (IOException ignored) {
                path = Paths.get("uploads").toAbsolutePath().normalize();
                try { Files.createDirectories(path); } catch (IOException ignored2) {}
            }
        }
        return path;
    }

    @GetMapping("/{viagemId}/comprovantes")
    public ResponseEntity<List<Comprovante>> listarComprovantes(@PathVariable Long viagemId) {
        return ResponseEntity.ok(comprovanteRepository.findByViagemId(viagemId));
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
                Path destino = getUploadPath().resolve(nomeArquivo);
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
        return comprovanteRepository.findById(comprovanteId).map(c -> {
            try {
                String nomeArquivo = c.getUrlArquivo().substring(c.getUrlArquivo().lastIndexOf('/') + 1);
                Files.deleteIfExists(getUploadPath().resolve(nomeArquivo));
            } catch (Exception ignored) {}
            comprovanteRepository.delete(c);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}