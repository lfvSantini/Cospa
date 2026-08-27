package com.cospa.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
public class UploadController {

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    @GetMapping("/**")
    public ResponseEntity<Resource> servirArquivo(HttpServletRequest request) {
        try {
            String uriCompleta = request.getRequestURI();

            // Extrai apenas o nome final do arquivo removendo qualquer repeticao de /uploads
            String nomeArquivo = uriCompleta.substring(uriCompleta.lastIndexOf('/') + 1);

            Path pastaPrincipal = Paths.get(uploadDirConfig).toAbsolutePath().normalize();
            Path arquivo = pastaPrincipal.resolve(nomeArquivo).normalize();

            // Fallback para ./uploads local
            if (!Files.exists(arquivo)) {
                Path fallback = Paths.get("uploads").toAbsolutePath().normalize().resolve(nomeArquivo).normalize();
                if (Files.exists(fallback)) {
                    arquivo = fallback;
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