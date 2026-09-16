package com.cospa.api.controller;

import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/otimizacao")
public class OtimizacaoUploadsController {

    private static final Logger log = LoggerFactory.getLogger(OtimizacaoUploadsController.class);

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    @PostMapping("/comprimir-antigos")
    public ResponseEntity<?> comprimirImagensAntigas() {
        Path pastaUploads = Paths.get(uploadDirConfig).toAbsolutePath().normalize();
        if (!Files.exists(pastaUploads)) {
            pastaUploads = Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize();
        }

        File pasta = pastaUploads.toFile();
        File[] arquivos = pasta.listFiles();

        if (arquivos == null || arquivos.length == 0) {
            return ResponseEntity.ok("Nenhum arquivo encontrado na pasta de uploads.");
        }

        long tamanhoTotalAntes = 0;
        long tamanhoTotalDepois = 0;
        int totalProcessados = 0;

        for (File arquivo : arquivos) {
            if (!arquivo.isFile()) continue;

            String nome = arquivo.getName().toLowerCase();
            // Processa apenas imagens JPG, JPEG e PNG (ignora PDFs)
            if (nome.endsWith(".jpg") || nome.endsWith(".jpeg") || nome.endsWith(".png")) {
                long tamanhoOriginal = arquivo.length();
                tamanhoTotalAntes += tamanhoOriginal;

                // Arquivos menores que 250 KB já estão otimizados
                if (tamanhoOriginal <= 250 * 1024) {
                    tamanhoTotalDepois += tamanhoOriginal;
                    continue;
                }

                File arquivoTemporario = new File(arquivo.getParent(), "temp_" + arquivo.getName());

                try {
                    Thumbnails.of(arquivo)
                            .size(1920, 1080)
                            .outputQuality(0.75f)
                            .toFile(arquivoTemporario);

                    // Substitui o original pelo comprimido se a redução for real
                    if (arquivoTemporario.length() < tamanhoOriginal) {
                        Files.move(arquivoTemporario.toPath(), arquivo.toPath(), StandardCopyOption.REPLACE_EXISTING);
                        tamanhoTotalDepois += arquivo.length();
                        totalProcessados++;
                    } else {
                        Files.deleteIfExists(arquivoTemporario.toPath());
                        tamanhoTotalDepois += tamanhoOriginal;
                    }
                } catch (Exception e) {
                    log.error("Erro ao comprimir o arquivo {}: {}", arquivo.getName(), e.getMessage());
                    Files.deleteIfExists(arquivoTemporario.toPath());
                    tamanhoTotalDepois += tamanhoOriginal;
                }
            } else {
                tamanhoTotalAntes += arquivo.length();
                tamanhoTotalDepois += arquivo.length();
            }
        }

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("arquivos_comprimidos", totalProcessados);
        resultado.put("tamanho_antes_mb", tamanhoTotalAntes / (1024 * 1024));
        resultado.put("tamanho_depois_mb", tamanhoTotalDepois / (1024 * 1024));
        resultado.put("espaco_economizado_mb", (tamanhoTotalAntes - tamanhoTotalDepois) / (1024 * 1024));

        return ResponseEntity.ok(resultado);
    }
}