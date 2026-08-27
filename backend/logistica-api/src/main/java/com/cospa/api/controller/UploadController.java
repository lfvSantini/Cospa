// backend/src/main/java/com/cospa/api/controller/UploadController.java
package com.cospa.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            String nomeArquivo = uriCompleta.substring(uriCompleta.lastIndexOf('/') + 1);

            // 1. Tenta no caminho configurado do volume (/app/uploads)
            Path pastaVolume = Paths.get(uploadDirConfig).toAbsolutePath().normalize();
            Path arquivo = pastaVolume.resolve(nomeArquivo).normalize();

            // 2. Fallback para ./uploads local
            if (!Files.exists(arquivo) || !Files.isReadable(arquivo)) {
                Path pastaLocal = Paths.get("uploads").toAbsolutePath().normalize();
                Path arquivoLocal = pastaLocal.resolve(nomeArquivo).normalize();
                if (Files.exists(arquivoLocal) && Files.isReadable(arquivoLocal)) {
                    arquivo = arquivoLocal;
                }
            }

            if (!Files.exists(arquivo) || !Files.isReadable(arquivo)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(arquivo.toUri());
            String contentType = Files.probeContentType(arquivo);
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