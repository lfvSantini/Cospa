CREATE TABLE IF NOT EXISTS cliente_documentos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    nome_arquivo VARCHAR(255),
    url_arquivo VARCHAR(500) NOT NULL,
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_documentos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);