package com.cospa.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class BackupService {

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    @Autowired
    private DataSource dataSource;

    private Path getUploadPath() {
        Path path = Paths.get(uploadDirConfig).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            path = Paths.get("uploads").toAbsolutePath().normalize();
        }
        return path;
    }

    // Executa diariamente às 03:00 da manhã
    @Scheduled(cron = "0 0 3 * * ?")
    public void rotinaBackupDiario() {
        try {
            Path pastaUploads = getUploadPath();
            if (!Files.exists(pastaUploads)) {
                return;
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            Path pastaBackups = pastaUploads.resolve("backups");
            if (!Files.exists(pastaBackups)) {
                Files.createDirectories(pastaBackups);
            }

            Path arquivoZipDestino = pastaBackups.resolve("backup_completo_" + timestamp + ".zip");
            byte[] zipBytes = gerarBackupManualZip();
            Files.write(arquivoZipDestino, zipBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            System.out.println("[BACKUP] Backup completo (Fotos + SQL) criado: " + arquivoZipDestino);
        } catch (Exception e) {
            System.err.println("[BACKUP ERRO] Falha ao gerar backup completo: " + e.getMessage());
        }
    }

    public byte[] gerarBackupManualZip() throws IOException {
        Path pastaUploads = getUploadPath();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            // 1. Gera o Dump do Banco de Dados em SQL e adiciona no ZIP
            String scriptSql = gerarDumpBancoDeDados();
            ZipEntry sqlEntry = new ZipEntry("database_dump.sql");
            zos.putNextEntry(sqlEntry);
            zos.write(scriptSql.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // 2. Adiciona todas as fotos e arquivos físicos ao ZIP
            if (Files.exists(pastaUploads)) {
                Files.walk(pastaUploads)
                        .filter(path -> !Files.isDirectory(path))
                        .filter(path -> !path.toString().contains("backups"))
                        .forEach(path -> {
                            String entryName = "uploads/" + pastaUploads.relativize(path).toString().replace('\\', '/');
                            ZipEntry zipEntry = new ZipEntry(entryName);
                            try {
                                zos.putNextEntry(zipEntry);
                                Files.copy(path, zos);
                                zos.closeEntry();
                            } catch (IOException ignored) {}
                        });
            }
        }
        return baos.toByteArray();
    }

    public String restaurarBackupZip(InputStream zipInputStream) throws Exception {
        Path pastaDestino = getUploadPath();
        if (!Files.exists(pastaDestino)) {
            Files.createDirectories(pastaDestino);
        }

        int arquivosRestaurados = 0;
        String sqlScript = null;

        try (ZipInputStream zis = new ZipInputStream(zipInputStream)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    continue;
                }

                String nome = entry.getName().replace('\\', '/');

                // Se for o dump do banco, lê o SQL
                if (nome.equals("database_dump.sql") || nome.endsWith("/database_dump.sql")) {
                    ByteArrayOutputStream sqlBaos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        sqlBaos.write(buffer, 0, len);
                    }
                    sqlScript = sqlBaos.toString(StandardCharsets.UTF_8);
                    zis.closeEntry();
                    continue;
                }

                // Normaliza o caminho das fotos (remove o prefixo uploads/ se presente)
                String nomeRelativo = nome.startsWith("uploads/") ? nome.substring("uploads/".length()) : nome;
                Path caminhoArquivo = pastaDestino.resolve(nomeRelativo).normalize();

                // Proteção Zip Slip
                if (!caminhoArquivo.startsWith(pastaDestino)) {
                    continue;
                }

                if (caminhoArquivo.getParent() != null && !Files.exists(caminhoArquivo.getParent())) {
                    Files.createDirectories(caminhoArquivo.getParent());
                }

                Files.copy(zis, caminhoArquivo, StandardCopyOption.REPLACE_EXISTING);
                arquivosRestaurados++;
                zis.closeEntry();
            }
        }

        // Executa a restauração do banco caso exista o dump SQL no zip
        boolean bancoRestaurado = false;
        if (sqlScript != null && !sqlScript.isBlank()) {
            try (Connection conn = dataSource.getConnection()) {
                ScriptUtils.executeSqlScript(conn, new ByteArrayResource(sqlScript.getBytes(StandardCharsets.UTF_8)));
                bancoRestaurado = true;
            }
        }

        return String.format("Backup restaurado com sucesso! Arquivos físicos: %d | Banco de Dados: %s",
                arquivosRestaurados, (bancoRestaurado ? "Restaurado" : "Não encontrado no .zip"));
    }

    private String gerarDumpBancoDeDados() {
        StringBuilder sql = new StringBuilder();
        sql.append("SET FOREIGN_KEY_CHECKS = 0;\n\n");

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            String catalog = conn.getCatalog();

            List<String> tabelas = new ArrayList<>();
            try (ResultSet rs = metaData.getTables(catalog, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String nomeTabela = rs.getString("TABLE_NAME");
                    // Não inclui a tabela de controle de migrations do Flyway
                    if (!"flyway_schema_history".equalsIgnoreCase(nomeTabela)) {
                        tabelas.add(nomeTabela);
                    }
                }
            }

            for (String tabela : tabelas) {
                // 1. Limpa tabela existente
                sql.append("DELETE FROM `").append(tabela).append("`;\n");

                // 2. Exporta os registros
                try (Statement stmt = conn.createStatement();
                     ResultSet rsData = stmt.executeQuery("SELECT * FROM `" + tabela + "`")) {

                    ResultSetMetaData rsMeta = rsData.getMetaData();
                    int colCount = rsMeta.getColumnCount();

                    while (rsData.next()) {
                        sql.append("INSERT INTO `").append(tabela).append("` VALUES (");
                        for (int i = 1; i <= colCount; i++) {
                            Object val = rsData.getObject(i);
                            if (val == null) {
                                sql.append("NULL");
                            } else if (val instanceof Number || val instanceof Boolean) {
                                sql.append(val);
                            } else {
                                String strVal = val.toString().replace("'", "\\'");
                                sql.append("'").append(strVal).append("'");
                            }
                            if (i < colCount) sql.append(", ");
                        }
                        sql.append(");\n");
                    }
                }
                sql.append("\n");
            }

            sql.append("SET FOREIGN_KEY_CHECKS = 1;\n");
        } catch (Exception e) {
            sql.append("-- Erro ao gerar dump: ").append(e.getMessage()).append("\n");
        }

        return sql.toString();
    }
}