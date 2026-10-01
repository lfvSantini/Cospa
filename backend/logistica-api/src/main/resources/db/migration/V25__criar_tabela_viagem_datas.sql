CREATE TABLE IF NOT EXISTS viagem_datas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    viagem_id BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'COLETA' ou 'ENTREGA'
    data_prevista VARCHAR(100) NULL,
    data_real VARCHAR(100) NULL,
    ordem INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_viagem_datas_viagem FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;