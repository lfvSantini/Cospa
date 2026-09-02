package com.cospa.api.controller;

import com.cospa.api.service.BackupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/admin/backup")
@CrossOrigin(origins = "*")
public class BackupController {

    private static final Logger log = LoggerFactory.getLogger(BackupController.class);

    @Autowired
    private BackupService backupService;

    @GetMapping("/uploads-zip")
    public ResponseEntity<StreamingResponseBody> baixarBackupCompleto() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmm"));
        String nomeArquivo = "cospa_backup_completo_" + timestamp + ".zip";

        StreamingResponseBody responseBody = outputStream -> {
            try {
                backupService.gerarBackupStreaming(outputStream);
            } catch (Exception e) {
                log.error("Erro ao transmitir arquivo de backup: ", e);
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomeArquivo + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(responseBody);
    }

    @PostMapping("/restaurar-zip")
    public ResponseEntity<String> restaurarBackupCompleto(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Nenhum arquivo enviado.");
        }

        try {
            String resultado = backupService.restaurarBackupZip(file.getInputStream());
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro durante a restauração do backup: ", e);
            return ResponseEntity.internalServerError().body("Erro ao restaurar backup: " + e.getMessage());
        }
    }
}