package com.cospa.api.controller;

import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/admin/otimizacao")
@CrossOrigin(origins = "*")
public class OtimizacaoUploadsController {

    private static final Logger log = LoggerFactory.getLogger(OtimizacaoUploadsController.class);

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    @PostMapping("/comprimir-antigos")
    public ResponseEntity<?> comprimirImagensAntigas() {
        AtomicLong tamanhoAntesTotal = new AtomicLong(0);
        AtomicLong tamanhoDepoisTotal = new AtomicLong(0);
        AtomicInteger totalProcessados = new AtomicInteger(0);
        AtomicInteger totalArquivos = new AtomicInteger(0);

        Path[] caminhosBase = new Path[] {
                Paths.get(uploadDirConfig).toAbsolutePath().normalize(),
                Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize()
        };

        for (Path base : caminhosBase) {
            if (!Files.exists(base)) continue;

            try {
                Files.walk(base)
                        .filter(Files::isRegularFile)
                        .forEach(path -> {
                            totalArquivos.incrementAndGet();
                            File arquivo = path.toFile();
                            String nome = arquivo.getName().toLowerCase();
                            long tamanhoOriginal = arquivo.length();

                            if (nome.startsWith("temp_opt_")) {
                                try { Files.deleteIfExists(path); } catch (IOException ignored) {}
                                return;
                            }

                            tamanhoAntesTotal.addAndGet(tamanhoOriginal);

                            if (nome.endsWith(".jpg") || nome.endsWith(".jpeg") || nome.endsWith(".png") || nome.endsWith(".webp")) {
                                if (tamanhoOriginal <= 200 * 1024) {
                                    tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                    return;
                                }

                                File arquivoTemporario = new File(arquivo.getParent(), "temp_opt_" + arquivo.getName());

                                try {
                                    Thumbnails.of(arquivo)
                                            .size(1920, 1080)
                                            .outputQuality(0.70f)
                                            .toFile(arquivoTemporario);

                                    if (arquivoTemporario.exists() && arquivoTemporario.length() < tamanhoOriginal) {
                                        Files.move(arquivoTemporario.toPath(), arquivo.toPath(), StandardCopyOption.REPLACE_EXISTING);
                                        tamanhoDepoisTotal.addAndGet(arquivo.length());
                                        totalProcessados.incrementAndGet();
                                    } else {
                                        try { Files.deleteIfExists(arquivoTemporario.toPath()); } catch (IOException ignored) {}
                                        tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                    }
                                } catch (Exception e) {
                                    log.error("Erro ao comprimir arquivo {}: {}", arquivo.getName(), e.getMessage());
                                    try { Files.deleteIfExists(arquivoTemporario.toPath()); } catch (IOException ignored) {}
                                    tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                }
                            } else {
                                tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                            }
                        });
            } catch (IOException e) {
                log.error("Erro ao varrer arquivos no caminho {}: {}", base, e.getMessage());
            }
        }

        long economiaBytes = Math.max(0, tamanhoAntesTotal.get() - tamanhoDepoisTotal.get());

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_arquivos_varridos", totalArquivos.get());
        resultado.put("arquivos_comprimidos", totalProcessados.get());
        resultado.put("tamanho_antes_mb", tamanhoAntesTotal.get() / (1024 * 1024));
        resultado.put("tamanho_depois_mb", tamanhoDepoisTotal.get() / (1024 * 1024));
        resultado.put("espaco_economizado_mb", economiaBytes / (1024 * 1024));

        return ResponseEntity.ok(resultado);
    }
}