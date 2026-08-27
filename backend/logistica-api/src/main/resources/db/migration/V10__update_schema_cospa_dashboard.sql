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

-- 2. Atualizar tabela de clientes
ALTER TABLE clientes
    ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(150),
    ADD COLUMN IF NOT EXISTS razao_social VARCHAR(200),
    ADD COLUMN IF NOT EXISTS nome_contato VARCHAR(100),
    ADD COLUMN IF NOT EXISTS situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    ADD COLUMN IF NOT EXISTS obs TEXT;

UPDATE clientes SET nome_fantasia = nome WHERE nome_fantasia IS NULL;
ALTER TABLE clientes MODIFY COLUMN nome VARCHAR(255) NULL;

-- 3. Atualizar tabela de motoristas
ALTER TABLE motoristas
    ADD COLUMN IF NOT EXISTS cpf VARCHAR(20),
    ADD COLUMN IF NOT EXISTS fornecedor_vinculado VARCHAR(150),
    ADD COLUMN IF NOT EXISTS situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    ADD COLUMN IF NOT EXISTS informacoes_adicionais TEXT;

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

-- 5. Atualizar tabela de viagens com os campos financeiros, agência e origens/destinos estendidos
ALTER TABLE viagens
    ADD COLUMN IF NOT EXISTS origem_nome TEXT,
    ADD COLUMN IF NOT EXISTS destino_nome TEXT,
    ADD COLUMN IF NOT EXISTS valor_adicional_receber DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS valor_adicional_pagar DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS valor_adicional_agencia DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS fornecedor_agencia VARCHAR(255),
    ADD COLUMN IF NOT EXISTS data_hora_pagamento VARCHAR(50);