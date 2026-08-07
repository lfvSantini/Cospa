CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('ADMIN', 'MOTORISTA', 'TRANSPORTADORA') NOT NULL
);

CREATE TABLE viagens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente VARCHAR(255) NOT NULL,
    local_coleta VARCHAR(255) NOT NULL,
    local_entrega VARCHAR(255) NOT NULL,
    placa VARCHAR(20) NOT NULL,
    nome_motorista VARCHAR(255) NOT NULL,
    status ENUM('CRIADA', 'EM_CARREGAMENTO', 'CARREGADO', 'EM_TRANSITO', 'EM_DESCARREGAMENTO', 'FINALIZADA', 'CANCELADA') NOT NULL,
    observacao TEXT,
    url_foto_comprovante VARCHAR(255),
    inicio_carregamento DATETIME,
    fim_carregamento DATETIME,
    inicio_descarregamento DATETIME,
    fim_descarregamento DATETIME
);

CREATE TABLE veiculos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) NOT NULL UNIQUE,
    motorista VARCHAR(255) NOT NULL
);