CREATE TABLE IF NOT EXISTS motorista_veiculo (
    motorista_id BIGINT NOT NULL,
    veiculo_id BIGINT NOT NULL,
    PRIMARY KEY (motorista_id, veiculo_id),
    CONSTRAINT fk_mv_motorista FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE,
    CONSTRAINT fk_mv_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE
);