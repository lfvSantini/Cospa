-- Torna o campo legado 'motorista' nulo (ou opcional) caso exista na tabela
ALTER TABLE veiculos MODIFY COLUMN motorista VARCHAR(255) NULL;
