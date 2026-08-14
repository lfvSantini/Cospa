package com.cospa.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ArquivoService {

    // Define a pasta onde os arquivos serão salvos (padrão 'uploads' na raiz da aplicação)
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Salva o arquivo enviado no disco e retorna a URL relativa
     */
    public String salvarArquivo(MultipartFile file, String subpasta) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("O arquivo enviado está vazio.");
        }

        try {
            // Cria o diretório se não existir (ex: uploads/comprovantes)
            Path diretorioPath = Paths.get(uploadDir, subpasta);
            if (!Files.exists(diretorioPath)) {
                Files.createDirectories(diretorioPath);
            }

            // Gera um nome único para o arquivo para evitar sobreposição
            String extensao = getExtensaoArquivo(file.getOriginalFilename());
            String nomeArquivoUnico = UUID.randomUUID().toString() + extensao;

            Path destinoPath = diretorioPath.resolve(nomeArquivoUnico);
            Files.copy(file.getInputStream(), destinoPath);

            // Retorna a rota relativa para acesso via API
            return "/" + uploadDir + "/" + subpasta + "/" + nomeArquivoUnico;

        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar o arquivo no disco: " + e.getMessage(), e);
        }
    }

    /**
     * Deleta o arquivo físico do disco dado o caminho relativo
     */
    public void deletarArquivo(String urlArquivo) {
        if (urlArquivo == null || urlArquivo.isBlank()) return;

        try {
            // Remove a barra inicial se houver para resolver o caminho
            String caminhoRelativo = urlArquivo.startsWith("/") ? urlArquivo.substring(1) : urlArquivo;
            Path caminhoPath = Paths.get(caminhoRelativo);

            if (Files.exists(caminhoPath)) {
                Files.delete(caminhoPath);
            }
        } catch (IOException e) {
            System.err.println("Aviso: Não foi possível deletar o arquivo físico: " + urlArquivo);
        }
    }

    private String getExtensaoArquivo(String nomeOriginal) {
        if (nomeOriginal != null && nomeOriginal.contains(".")) {
            return nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
        }
        return ".dat";
    }
}