-- Garante que todas as colunas de datas em viagens aceitem qualquer string enviada pelo frontend
ALTER TABLE viagens MODIFY COLUMN data_coleta_prevista TEXT;
ALTER TABLE viagens MODIFY COLUMN data_coleta_real TEXT;
ALTER TABLE viagens MODIFY COLUMN data_entrega_prevista TEXT;
ALTER TABLE viagens MODIFY COLUMN data_entrega_real TEXT;
ALTER TABLE viagens MODIFY COLUMN data_hora_pagamento TEXT;