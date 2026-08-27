-- 1. Criar tabela de fornecedores / agenciadores
CREATE TABLE IF NOT EXISTS fornecedores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cnpj_cpf VARCHAR(20),
    nome_contato VARCHAR(100),
    telefone VARCHAR(30),
    email VARCHAR(100),
    chave_pix VARCHAR(100),
    situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    obs TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Helper procedure para adicionar colunas com segurança se nao existirem
DROP PROCEDURE IF EXISTS AddColumnSafely;
DELIMITER $$
CREATE PROCEDURE AddColumnSafely(
    IN p_table_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_column_def TEXT
)
BEGIN
    DECLARE col_count INT;
    SELECT COUNT(*) INTO col_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name;

    IF col_count = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_column_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- 2. Atualizar tabela de clientes
CALL AddColumnSafely('clientes', 'nome_fantasia', 'VARCHAR(150)');
CALL AddColumnSafely('clientes', 'razao_social', 'VARCHAR(200)');
CALL AddColumnSafely('clientes', 'nome_contato', 'VARCHAR(100)');
CALL AddColumnSafely('clientes', 'situacao', 'VARCHAR(20) NOT NULL DEFAULT ''ATIVO''');
CALL AddColumnSafely('clientes', 'obs', 'TEXT');

UPDATE clientes SET nome_fantasia = nome WHERE nome_fantasia IS NULL;
ALTER TABLE clientes MODIFY COLUMN nome VARCHAR(255) NULL;

-- 3. Atualizar tabela de motoristas
CALL AddColumnSafely('motoristas', 'cpf', 'VARCHAR(20)');
CALL AddColumnSafely('motoristas', 'fornecedor_vinculado', 'VARCHAR(150)');
CALL AddColumnSafely('motoristas', 'situacao', 'VARCHAR(20) NOT NULL DEFAULT ''ATIVO''');
CALL AddColumnSafely('motoristas', 'informacoes_adicionais', 'TEXT');

-- 4. Criar tabela de documentos para motoristas
CREATE TABLE IF NOT EXISTS documentos_motorista (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    url VARCHAR(500) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    data_envio DATETIME NOT NULL,
    motorista_id BIGINT NOT NULL,
    CONSTRAINT fk_documento_motorista FOREIGN KEY (motorista_id) REFERENCES motoristas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Atualizar tabela de viagens
CALL AddColumnSafely('viagens', 'origem_nome', 'TEXT');
CALL AddColumnSafely('viagens', 'destino_nome', 'TEXT');
CALL AddColumnSafely('viagens', 'valor_adicional_receber', 'DECIMAL(10,2) DEFAULT 0.00');
CALL AddColumnSafely('viagens', 'valor_adicional_pagar', 'DECIMAL(10,2) DEFAULT 0.00');
CALL AddColumnSafely('viagens', 'valor_adicional_agencia', 'DECIMAL(10,2) DEFAULT 0.00');
CALL AddColumnSafely('viagens', 'fornecedor_agencia', 'VARCHAR(255)');
CALL AddColumnSafely('viagens', 'pagamento_liberado', 'BOOLEAN DEFAULT FALSE');
CALL AddColumnSafely('viagens', 'pagamento_realizado_status', 'VARCHAR(30) DEFAULT ''NAO_REALIZADO''');
CALL AddColumnSafely('viagens', 'data_hora_pagamento', 'VARCHAR(50)');

-- Remover a procedure temporária
DROP PROCEDURE IF EXISTS AddColumnSafely;