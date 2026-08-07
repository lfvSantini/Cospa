ALTER TABLE viagens
    ADD COLUMN cpf_motorista VARCHAR(14),
    ADD COLUMN data_coleta_prevista DATETIME,
    ADD COLUMN data_coleta_real DATETIME,
    ADD COLUMN data_entrega_prevista DATETIME,
    ADD COLUMN data_entrega_real DATETIME;