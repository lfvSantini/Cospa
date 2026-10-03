package com.cospa.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ArquivoService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String salvarArquivo(MultipartFile file, String subdiretorio) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Path diretorioDestino = Paths.get(uploadDir, subdiretorio).toAbsolutePath().normalize();
            Files.createDirectories(diretorioDestino);

            String nomeOriginal = file.getOriginalFilename();
            String extensao = "";
            if (nomeOriginal != null && nomeOriginal.contains(".")) {
                extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
            }

            String nomeArquivo = UUID.randomUUID().toString() + extensao;
            Path caminhoArquivo = diretorioDestino.resolve(nomeArquivo);

            Files.copy(file.getInputStream(), caminhoArquivo, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + (subdiretorio != null && !subdiretorio.isBlank() ? subdiretorio + "/" : "") + nomeArquivo;
        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar arquivo: " + e.getMessage(), e);
        }
    }

    public String salvarComprovante(MultipartFile file) {
        return salvarArquivo(file, "comprovantes");
    }

    public boolean deletarArquivo(String caminhoRelativo) {
        if (caminhoRelativo == null || caminhoRelativo.isBlank()) {
            return false;
        }

        try {
            String caminhoLimpo = caminhoRelativo.replaceFirst("^/uploads/", "");
            Path arquivo = Paths.get(uploadDir).resolve(caminhoLimpo).toAbsolutePath().normalize();
            return Files.deleteIfExists(arquivo);
        } catch (IOException e) {
            return false;
        }
    }
}