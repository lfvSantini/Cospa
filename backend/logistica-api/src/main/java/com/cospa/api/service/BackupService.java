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

    private List<Path> getPossibleUploadPaths() {
        List<Path> paths = new ArrayList<>();

        // 1. Caminho configurado no application.properties ou env
        if (uploadDirConfig != null && !uploadDirConfig.isBlank()) {
            paths.add(Paths.get(uploadDirConfig).toAbsolutePath().normalize());
        }
        // 2. Caminho padrão do volume Docker
        paths.add(Paths.get("/app/uploads").toAbsolutePath().normalize());
        // 3. Caminhos relativos de execução
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
        Path fallback = Paths.get(uploadDirConfig != null ? uploadDirConfig : "/app/uploads").toAbsolutePath().normalize();
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
            byte[] zipBytes = gerarBackupManualZip();
            Files.write(arquivoZipDestino, zipBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            System.out.println("[BACKUP] Backup compactado criado com sucesso: " + arquivoZipDestino);
        } catch (Exception e) {
            System.err.println("[BACKUP ERRO] Falha ao gerar backup: " + e.getMessage());
        }
    }

    public byte[] gerarBackupManualZip() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            // 1. Exporta Dump SQL do Banco de Dados
            String scriptSql = gerarDumpBancoDeDados();
            ZipEntry sqlEntry = new ZipEntry("database_dump.sql");
            zos.putNextEntry(sqlEntry);
            zos.write(scriptSql.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // 2. Varre todos os diretórios de upload para empacotar todas as fotos encontradas
            List<String> arquivosAdicionados = new ArrayList<>();
            for (Path pasta : getPossibleUploadPaths()) {
                if (Files.exists(pasta) && Files.isDirectory(pasta)) {
                    try (var stream = Files.walk(pasta)) {
                        stream.filter(Files::isRegularFile)
                                .filter(path -> !path.toString().contains("backups"))
                                .filter(path -> !path.getFileName().toString().endsWith(".zip"))
                                .forEach(path -> {
                                    String relativePath = pasta.relativize(path).toString().replace('\\', '/');
                                    String entryName = "uploads/" + relativePath;

                                    if (!arquivosAdicionados.contains(entryName)) {
                                        arquivosAdicionados.add(entryName);
                                        try {
                                            ZipEntry zipEntry = new ZipEntry(entryName);
                                            zos.putNextEntry(zipEntry);
                                            Files.copy(path, zos);
                                            zos.closeEntry();
                                        } catch (IOException ignored) {}
                                    }
                                });
                    }
                }
            }
        }
        return baos.toByteArray();
    }

    public String restaurarBackupZip(InputStream zipInputStream) throws Exception {
        Path pastaDestino = getPrimaryUploadPath();
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

                String entryName = entry.getName().replace('\\', '/');

                if (entryName.equals("database_dump.sql") || entryName.endsWith("/database_dump.sql")) {
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

                String relativeClean = entryName.startsWith("uploads/") ? entryName.substring("uploads/".length()) : entryName;
                Path caminhoArquivo = pastaDestino.resolve(relativeClean).normalize();

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

        boolean bancoRestaurado = false;
        if (sqlScript != null && !sqlScript.isBlank()) {
            try (Connection conn = dataSource.getConnection()) {
                ScriptUtils.executeSqlScript(conn, new ByteArrayResource(sqlScript.getBytes(StandardCharsets.UTF_8)));
                bancoRestaurado = true;
            }
        }

        return String.format("Backup restaurado com sucesso! Fotos e Arquivos: %d | Banco de Dados: %s",
                arquivosRestaurados, (bancoRestaurado ? "Atualizado com Sucesso" : "Não encontrado"));
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
                    if (!"flyway_schema_history".equalsIgnoreCase(nomeTabela)) {
                        tabelas.add(nomeTabela);
                    }
                }
            }

            for (String tabela : tabelas) {
                sql.append("DELETE FROM `").append(tabela).append("`;\n");

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