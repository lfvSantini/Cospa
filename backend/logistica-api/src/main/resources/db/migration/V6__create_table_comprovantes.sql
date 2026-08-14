CREATE TABLE comprovantes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    url_arquivo VARCHAR(255) NOT NULL,
    viagem_id BIGINT NOT NULL,
    CONSTRAINT fk_comprovante_viagem FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE
);