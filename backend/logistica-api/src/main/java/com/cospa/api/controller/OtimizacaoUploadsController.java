package com.cospa.api.controller;

import net.coobird.thumbnailator.Thumbnails;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
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
    public ResponseEntity<?> comprimirImagensEPdfsAntigos() {
        AtomicLong tamanhoAntesTotal = new AtomicLong(0);
        AtomicLong tamanhoDepoisTotal = new AtomicLong(0);
        AtomicInteger totalImagensComprimidas = new AtomicInteger(0);
        AtomicInteger totalPdfsComprimidos = new AtomicInteger(0);
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

                            // 1. Tratamento para Imagens (JPG, PNG, WEBP)
                            if (nome.endsWith(".jpg") || nome.endsWith(".jpeg") || nome.endsWith(".png") || nome.endsWith(".webp")) {
                                if (tamanhoOriginal <= 150 * 1024) {
                                    tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                    return;
                                }

                                File tempImg = new File(arquivo.getParent(), "temp_opt_" + arquivo.getName());
                                try {
                                    Thumbnails.of(arquivo)
                                            .size(1920, 1080)
                                            .outputQuality(0.70f)
                                            .toFile(tempImg);

                                    if (tempImg.exists() && tempImg.length() < tamanhoOriginal) {
                                        Files.move(tempImg.toPath(), arquivo.toPath(), StandardCopyOption.REPLACE_EXISTING);
                                        tamanhoDepoisTotal.addAndGet(arquivo.length());
                                        totalImagensComprimidas.incrementAndGet();
                                    } else {
                                        try { Files.deleteIfExists(tempImg.toPath()); } catch (IOException ignored) {}
                                        tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                    }
                                } catch (Exception e) {
                                    try { Files.deleteIfExists(tempImg.toPath()); } catch (IOException ignored) {}
                                    tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                }

                                // 2. Tratamento para Documentos PDF Escaneados Pesados
                            } else if (nome.endsWith(".pdf")) {
                                if (tamanhoOriginal <= 300 * 1024) { // Menores que 300KB já estão leves
                                    tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                    return;
                                }

                                File tempPdf = new File(arquivo.getParent(), "temp_opt_" + arquivo.getName());
                                boolean otimizouPdf = false;

                                try (PDDocument document = Loader.loadPDF(arquivo)) {
                                    for (PDPage page : document.getPages()) {
                                        PDResources resources = page.getResources();
                                        if (resources == null) continue;

                                        for (COSName xName : resources.getXObjectNames()) {
                                            PDXObject xObject = resources.getXObject(xName);
                                            if (xObject instanceof PDImageXObject imageXObject) {
                                                BufferedImage imgOriginal = imageXObject.getImage();
                                                if (imgOriginal == null) continue;

                                                ByteArrayOutputStream os = new ByteArrayOutputStream();
                                                Thumbnails.of(imgOriginal)
                                                        .size(1600, 1200)
                                                        .outputFormat("jpg")
                                                        .outputQuality(0.65f)
                                                        .toOutputStream(os);

                                                BufferedImage imgComprimida = ImageIO.read(new ByteArrayInputStream(os.toByteArray()));
                                                PDImageXObject novaImagemXObject = JPEGFactory.createFromImage(document, imgComprimida, 0.65f);
                                                resources.put(xName, novaImagemXObject);
                                                otimizouPdf = true;
                                            }
                                        }
                                    }

                                    if (otimizouPdf) {
                                        document.save(tempPdf);
                                    }
                                } catch (Exception e) {
                                    log.error("Nao foi possivel comprimir o PDF {}: {}", arquivo.getName(), e.getMessage());
                                }

                                if (tempPdf.exists() && tempPdf.length() > 0 && tempPdf.length() < tamanhoOriginal) {
                                    try {
                                        Files.move(tempPdf.toPath(), arquivo.toPath(), StandardCopyOption.REPLACE_EXISTING);
                                        tamanhoDepoisTotal.addAndGet(arquivo.length());
                                        totalPdfsComprimidos.incrementAndGet();
                                    } catch (IOException e) {
                                        tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                    }
                                } else {
                                    try { Files.deleteIfExists(tempPdf.toPath()); } catch (IOException ignored) {}
                                    tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                                }

                            } else {
                                tamanhoDepoisTotal.addAndGet(tamanhoOriginal);
                            }
                        });
            } catch (IOException e) {
                log.error("Erro ao varrer arquivos: {}", e.getMessage());
            }
        }

        long economiaBytes = Math.max(0, tamanhoAntesTotal.get() - tamanhoDepoisTotal.get());

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total_arquivos_varridos", totalArquivos.get());
        resultado.put("imagens_comprimidas", totalImagensComprimidas.get());
        resultado.put("pdfs_comprimidos", totalPdfsComprimidos.get());
        resultado.put("tamanho_antes_mb", tamanhoAntesTotal.get() / (1024 * 1024));
        resultado.put("tamanho_depois_mb", tamanhoDepoisTotal.get() / (1024 * 1024));
        resultado.put("espaco_economizado_mb", economiaBytes / (1024 * 1024));

        return ResponseEntity.ok(resultado);
    }
}