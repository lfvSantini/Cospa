package com.cospa.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    @Autowired
    private DataSource dataSource;

    private List<Path> getPossibleUploadPaths() {
        List<Path> paths = new ArrayList<>();
        if (uploadDirConfig != null && !uploadDirConfig.isBlank()) {
            paths.add(Paths.get(uploadDirConfig).toAbsolutePath().normalize());
        }
        paths.add(Paths.get("/app/uploads").toAbsolutePath().normalize());
        paths.add(Paths.get("uploads").toAbsolutePath().normalize());
        paths.add(Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize());
        return paths;
    }

    private Path getPrimaryUploadPath() {
        for (Path p : getPossibleUploadPaths()) {
            if (Files.exists(p) && Files.isDirectory(p)) {
                return p;
            }
        }
        Path fallback = Paths.get(uploadDirConfig != null && !uploadDirConfig.isBlank() ? uploadDirConfig : "/app/uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(fallback);
        } catch (IOException ignored) {}
        return fallback;
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void rotinaBackupDiario() {
        try {
            Path pastaUploads = getPrimaryUploadPath();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            Path pastaBackups = pastaUploads.resolve("backups");
            if (!Files.exists(pastaBackups)) {
                Files.createDirectories(pastaBackups);
            }

            Path arquivoZipDestino = pastaBackups.resolve("backup_completo_" + timestamp + ".zip");
            try (OutputStream fos = Files.newOutputStream(arquivoZipDestino, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)) {
                gerarBackupStreaming(fos);
            }

            log.info("[BACKUP] Backup compactado criado com sucesso: {}", arquivoZipDestino);
        } catch (Exception e) {
            log.error("[BACKUP ERRO] Falha ao gerar backup diário: ", e);
        }
    }

    public void gerarBackupStreaming(OutputStream outputStream) throws IOException {
        try (ZipOutputStream zos = new ZipOutputStream(new BufferedOutputStream(outputStream))) {
            // 1. Exporta Dump SQL mapeando explicitamente o nome das colunas
            ZipEntry sqlEntry = new ZipEntry("database_dump.sql");
            zos.putNextEntry(sqlEntry);
            escreverDumpBancoDeDados(zos);
            zos.closeEntry();

            // 2. Empacota todos os arquivos de upload (fotos de viagens, CNH/CRLV de motoristas e documentos de veículos)
            Set<String> arquivosAdicionados = new HashSet<>();
            byte[] buffer = new byte[8192];

            for (Path pasta : getPossibleUploadPaths()) {
                if (Files.exists(pasta) && Files.isDirectory(pasta)) {
                    try (var stream = Files.walk(pasta)) {
                        stream.filter(Files::isRegularFile)
                                .filter(path -> !path.toString().contains("backups"))
                                .filter(path -> !path.getFileName().toString().endsWith(".zip"))
                                .forEach(path -> {
                                    String relativePath = pasta.relativize(path).toString().replace('\\', '/');
                                    String entryName = "uploads/" + relativePath;

                                    if (arquivosAdicionados.add(entryName)) {
                                        try {
                                            ZipEntry zipEntry = new ZipEntry(entryName);
                                            zos.putNextEntry(zipEntry);
                                            try (InputStream is = Files.newInputStream(path)) {
                                                int len;
                                                while ((len = is.read(buffer)) > 0) {
                                                    zos.write(buffer, 0, len);
                                                }
                                            }
                                            zos.closeEntry();
                                        } catch (IOException e) {
                                            log.warn("Não foi possível adicionar arquivo ao zip: {}", path, e);
                                        }
                                    }
                                });
                    }
                }
            }
            zos.finish();
        }
    }

    private void escreverDumpBancoDeDados(OutputStream os) throws IOException {
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os, StandardCharsets.UTF_8));
        writer.write("SET FOREIGN_KEY_CHECKS = 0;\n\n");

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            String catalog = conn.getCatalog();

            List<String> tabelas = new ArrayList<>();
            try (ResultSet rs = metaData.getTables(catalog, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String nomeTabela = rs.getString("TABLE_NAME");
                    if (!"flyway_schema_history".equalsIgnoreCase(nomeTabela)) {
                        tabelas.add(nomeTabela);
                    }
                }
            }

            for (String tabela : tabelas) {
                writer.write("DELETE FROM `" + tabela + "`;\n");

                try (Statement stmt = conn.createStatement();
                     ResultSet rsData = stmt.executeQuery("SELECT * FROM `" + tabela + "`")) {

                    ResultSetMetaData rsMeta = rsData.getMetaData();
                    int colCount = rsMeta.getColumnCount();

                    // Constrói lista explícita de colunas para evitar incompatibilidade entre versões do schema
                    StringBuilder colsHeader = new StringBuilder();
                    for (int i = 1; i <= colCount; i++) {
                        colsHeader.append("`").append(rsMeta.getColumnName(i)).append("`");
                        if (i < colCount) colsHeader.append(", ");
                    }

                    while (rsData.next()) {
                        writer.write("INSERT INTO `" + tabela + "` (" + colsHeader + ") VALUES (");
                        for (int i = 1; i <= colCount; i++) {
                            Object val = rsData.getObject(i);
                            if (val == null) {
                                writer.write("NULL");
                            } else if (val instanceof Number || val instanceof Boolean) {
                                writer.write(val.toString());
                            } else {
                                String strVal = val.toString()
                                        .replace("\\", "\\\\")
                                        .replace("'", "\\'")
                                        .replace("\r", "\\r")
                                        .replace("\n", "\\n");
                                writer.write("'" + strVal + "'");
                            }
                            if (i < colCount) writer.write(", ");
                        }
                        writer.write(");\n");
                    }
                }
                writer.write("\n");
                writer.flush();
            }

            writer.write("SET FOREIGN_KEY_CHECKS = 1;\n");
            writer.flush();
        } catch (Exception e) {
            log.error("Erro ao gerar dump do banco: ", e);
            writer.write("\n-- Erro ao gerar dump: " + e.getMessage() + "\n");
            writer.flush();
        }
    }

    public String restaurarBackupZip(InputStream zipInputStream) throws Exception {
        Path pastaDestino = getPrimaryUploadPath();
        if (!Files.exists(pastaDestino)) {
            Files.createDirectories(pastaDestino);
        }

        int arquivosRestaurados = 0;
        String sqlScript = null;
        byte[] buffer = new byte[8192];

        try (ZipInputStream zis = new ZipInputStream(new BufferedInputStream(zipInputStream))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    continue;
                }

                String entryName = entry.getName().replace('\\', '/');

                if (entryName.equals("database_dump.sql") || entryName.endsWith("/database_dump.sql") || entryName.endsWith(".sql")) {
                    ByteArrayOutputStream sqlBaos = new ByteArrayOutputStream();
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        sqlBaos.write(buffer, 0, len);
                    }
                    sqlScript = sqlBaos.toString(StandardCharsets.UTF_8);
                    zis.closeEntry();
                    continue;
                }

                String relativeClean = entryName.startsWith("uploads/") ? entryName.substring("uploads/".length()) : entryName;
                Path caminhoArquivo = pastaDestino.resolve(relativeClean).normalize();

                if (!caminhoArquivo.startsWith(pastaDestino)) {
                    continue;
                }

                if (caminhoArquivo.getParent() != null && !Files.exists(caminhoArquivo.getParent())) {
                    Files.createDirectories(caminhoArquivo.getParent());
                }

                try (OutputStream fos = Files.newOutputStream(caminhoArquivo, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)) {
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        fos.write(buffer, 0, len);
                    }
                }

                arquivosRestaurados++;
                zis.closeEntry();
            }
        }

        boolean bancoRestaurado = false;
        if (sqlScript != null && !sqlScript.isBlank()) {
            executarScriptSqlTolerante(sqlScript);
            bancoRestaurado = true;
        }

        return String.format("Backup restaurado com sucesso! Fotos e Arquivos: %d | Banco de Dados: %s",
                arquivosRestaurados, (bancoRestaurado ? "Atualizado com Sucesso" : "Script não encontrado"));
    }

    private void executarScriptSqlTolerante(String sqlContent) {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            try {
                stmt.execute("SET FOREIGN_KEY_CHECKS = 0;");
            } catch (Exception ignored) {}

            String[] rawStatements = sqlContent.split(";");
            for (String rawStmt : rawStatements) {
                String statementText = rawStmt.trim();
                if (statementText.isEmpty() || statementText.startsWith("--") || statementText.startsWith("/*")) {
                    continue;
                }

                // Garante que inserts incompatíveis ou duplicados não abortem a importação
                if (statementText.toUpperCase().startsWith("INSERT INTO")) {
                    statementText = "INSERT IGNORE INTO" + statementText.substring("INSERT INTO".length());
                }

                try {
                    stmt.execute(statementText);
                } catch (Exception e) {
                    log.warn("Instrução ignorada durante restauração: {} | Motivo: {}", statementText, e.getMessage());
                }
            }

            try {
                stmt.execute("SET FOREIGN_KEY_CHECKS = 1;");
            } catch (Exception ignored) {}

        } catch (Exception e) {
            log.error("Erro ao executar script de restauração: ", e);
        }
    }
}