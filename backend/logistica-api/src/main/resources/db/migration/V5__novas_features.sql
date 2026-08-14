-- Novos campos financeiros nas viagens
ALTER TABLE viagens 
    ADD COLUMN valor_a_receber DECIMAL(10,2),
    ADD COLUMN valor_a_pagar DECIMAL(10,2);

-- Novos campos de dados bancários e anexos nos motoristas
ALTER TABLE motoristas 
    ADD COLUMN observacoes TEXT,
    ADD COLUMN url_cnh VARCHAR(500),
    ADD COLUMN url_crlv VARCHAR(500);