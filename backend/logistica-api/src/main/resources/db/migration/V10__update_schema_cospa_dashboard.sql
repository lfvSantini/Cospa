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
    ADD COLUMN nome_fantasia VARCHAR(150),
    ADD COLUMN razao_social VARCHAR(200),
    ADD COLUMN nome_contato VARCHAR(100),
    ADD COLUMN situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    ADD COLUMN obs TEXT;

UPDATE clientes SET nome_fantasia = nome WHERE nome_fantasia IS NULL;
ALTER TABLE clientes MODIFY COLUMN nome VARCHAR(255) NULL;

-- 3. Atualizar tabela de motoristas (remove restrição UNIQUE da placa e adiciona novos campos)
ALTER TABLE motoristas DROP INDEX placa;

ALTER TABLE motoristas
    ADD COLUMN cpf VARCHAR(20),
    ADD COLUMN fornecedor_vinculado VARCHAR(150),
    ADD COLUMN situacao VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    ADD COLUMN informacoes_adicionais TEXT;

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
    ADD COLUMN origem_nome TEXT,
    ADD COLUMN destino_nome TEXT,
    ADD COLUMN valor_adicional_receber DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN valor_adicional_pagar DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN valor_adicional_agencia DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN fornecedor_agencia VARCHAR(255),
    ADD COLUMN pagamento_liberado BOOLEAN DEFAULT FALSE,
    ADD COLUMN pagamento_realizado_status VARCHAR(30) DEFAULT 'NAO_REALIZADO',
    ADD COLUMN data_hora_pagamento VARCHAR(50);