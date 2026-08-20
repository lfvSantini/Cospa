package com.cospa.api.controller;

import jakarta.servlet.http.HttpServletRequest;
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

    private final Path diretorioBase = Paths.get("uploads").toAbsolutePath().normalize();

    @GetMapping("/**")
    public ResponseEntity<Resource> servirArquivo(HttpServletRequest request) {
        try {
            // Extrai todo o caminho relativo após "/uploads/"
            String uriCompleta = request.getRequestURI();
            String caminhoRelativo = uriCompleta.substring(uriCompleta.indexOf("/uploads/") + 9);

            // Resolve o arquivo de forma segura dentro da pasta base uploads
            Path caminhoArquivo = this.diretorioBase.resolve(caminhoRelativo).normalize();

            // Proteção contra path traversal
            if (!caminhoArquivo.startsWith(this.diretorioBase)) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(caminhoArquivo.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Identifica o Content-Type real (image/png, image/jpeg, application/pdf, etc.)
            String contentType = Files.probeContentType(caminhoArquivo);
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