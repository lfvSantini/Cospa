CREATE TABLE IF NOT EXISTS documentos_veiculo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    url VARCHAR(500) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    data_envio DATETIME NOT NULL,
    veiculo_id BIGINT NOT NULL,
    CONSTRAINT fk_documentos_veiculo_veic FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE
);