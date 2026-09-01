CREATE TABLE IF NOT EXISTS veiculos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) NOT NULL UNIQUE,
    tipo_veiculo VARCHAR(50) NOT NULL,
    tipo_carroceria VARCHAR(50),
    adicional VARCHAR(50),
    numero_eixos VARCHAR(20),
    cubagem_bau VARCHAR(50),
    capacidade_peso VARCHAR(50),
    numero_paletes VARCHAR(50),
    ano_fabricacao VARCHAR(10),
    data_vencimento VARCHAR(50),
    fornecedor VARCHAR(255),
    numero_antt VARCHAR(50),
    tipo_rastreador VARCHAR(100),
    situacao VARCHAR(20) DEFAULT 'ATIVO'
);