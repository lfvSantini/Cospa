-- 1. Adicionar campo Cidade/UF na tabela de veículos
ALTER TABLE veiculos ADD COLUMN cidade_uf VARCHAR(100) NULL AFTER data_vencimento;

-- 2. Adicionar tipo de operação e tipos de adicionais na tabela de viagens
ALTER TABLE viagens ADD COLUMN tipo_operacao VARCHAR(30) NULL AFTER local_entrega;
ALTER TABLE viagens ADD COLUMN tipo_adicional_receber VARCHAR(50) NULL AFTER valor_adicional_receber;
ALTER TABLE viagens ADD COLUMN tipo_adicional_pagar VARCHAR(50) NULL AFTER valor_adicional_pagar;