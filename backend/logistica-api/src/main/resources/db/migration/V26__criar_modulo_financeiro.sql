CREATE TABLE titulos_financeiros (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_titulo VARCHAR(50) NOT NULL UNIQUE,
    viagem_id BIGINT,
    tipo VARCHAR(20) NOT NULL, -- 'A RECEBER' ou 'A PAGAR'
    entidade_nome VARCHAR(255) NOT NULL, -- Cliente ou Fornecedor
    operacao VARCHAR(100),
    numero_rota VARCHAR(100),
    numero_cte VARCHAR(100),
    numero_mdfe VARCHAR(100),
    origem VARCHAR(255),
    destino VARCHAR(255),
    perfil_veiculo VARCHAR(100),
    placa VARCHAR(50),
    valor_frete DECIMAL(12, 2) DEFAULT 0.00,
    valor_adicional DECIMAL(12, 2) DEFAULT 0.00,
    total_previsto DECIMAL(12, 2) DEFAULT 0.00,
    total_realizado DECIMAL(12, 2) DEFAULT 0.00,
    saldo_em_aberto DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'PARCIAL', 'QUITADO', 'VENCIDO'
    data_coleta VARCHAR(50),
    data_entrega VARCHAR(50),
    data_pagamento VARCHAR(50),
    proximo_vencimento VARCHAR(50),
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_titulos_viagem FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE SET NULL
);

CREATE TABLE lancamentos_financeiros (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo_id BIGINT NOT NULL,
    viagem_id BIGINT,
    tipo VARCHAR(20) NOT NULL, -- 'A RECEBER' ou 'A PAGAR'
    etapa VARCHAR(50) NOT NULL, -- 'ADIANTAMENTO', 'SALDO', 'ADICIONAL', 'OUTRO'
    tipo_adicional VARCHAR(100),
    entidade_nome VARCHAR(255) NOT NULL,
    valor_previsto DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    valor_realizado DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    saldo_em_aberto DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    data_vencimento VARCHAR(50),
    data_efetiva VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    numero_cte VARCHAR(100),
    numero_mdfe VARCHAR(100),
    comprovante_url VARCHAR(500),
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lancamentos_titulo FOREIGN KEY (titulo_id) REFERENCES titulos_financeiros(id) ON DELETE CASCADE
);