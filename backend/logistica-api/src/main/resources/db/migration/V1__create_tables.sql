CREATE TABLE IF NOT EXISTS usuarios (
                                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                        nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil ENUM('ADMIN', 'MOTORISTA', 'TRANSPORTADORA') NOT NULL
    );

CREATE TABLE IF NOT EXISTS viagens (
                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       local_coleta VARCHAR(255) NOT NULL,
    local_entrega VARCHAR(255) NOT NULL,
    nome_motorista VARCHAR(255) NOT NULL,
    transportadora VARCHAR(255) NOT NULL,
    status ENUM('CRIADA', 'EM_CARREGAMENTO', 'CARREGADO', 'EM_TRANSITO', 'EM_DESCARREGAMENTO', 'FINALIZADA', 'CANCELADA') NOT NULL,
    observacao TEXT,
    url_foto_comprovante VARCHAR(255),
    inicio_carregamento DATETIME,
    fim_carregamento DATETIME,
    inicio_descarregamento DATETIME,
    fim_descarregamento DATETIME
    );