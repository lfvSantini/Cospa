package com.cospa.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    @GetMapping("/**")
    public ResponseEntity<Resource> servirArquivo(HttpServletRequest request) {
        try {
            String uriCompleta = request.getRequestURI();

            // Extrai apenas o nome do arquivo (ex: viagem_14_7a98f357.gif)
            String nomeArquivo = uriCompleta.substring(uriCompleta.lastIndexOf('/') + 1);

            // 1. Tenta achar na pasta configurada (/app/uploads)
            Path caminhoVolume = Paths.get(uploadDirConfig).toAbsolutePath().normalize().resolve(nomeArquivo);
            File arquivo = caminhoVolume.toFile();

            // 2. Se nao achar, tenta no diretorio relativo local (./uploads)
            if (!arquivo.exists()) {
                Path caminhoLocal = Paths.get("uploads").toAbsolutePath().normalize().resolve(nomeArquivo);
                arquivo = caminhoLocal.toFile();
            }

            // 3. Se ainda nao achar, tenta buscar com o caminho completo relativo
            if (!arquivo.exists()) {
                String caminhoLimpo = uriCompleta.replaceAll("^(/+uploads)+/+", "");
                arquivo = Paths.get(uploadDirConfig).resolve(caminhoLimpo).toFile();
            }

            if (!arquivo.exists() || !arquivo.canRead()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(arquivo);

            String contentType = Files.probeContentType(arquivo.toPath());
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}