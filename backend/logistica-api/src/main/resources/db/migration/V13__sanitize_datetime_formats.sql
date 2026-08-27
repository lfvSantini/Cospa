-- 1. Garante que data_hora_pagamento seja TEXT sem quebrar textos livres
ALTER TABLE viagens MODIFY COLUMN data_hora_pagamento TEXT;

-- 2. Limpa datas invalidas/vazias nas colunas de data/hora de viagens
UPDATE viagens SET data_coleta_prevista = NULL WHERE CAST(data_coleta_prevista AS CHAR) = '' OR CAST(data_coleta_prevista AS CHAR) = '0000-00-00 00:00:00';
UPDATE viagens SET data_coleta_real = NULL WHERE CAST(data_coleta_real AS CHAR) = '' OR CAST(data_coleta_real AS CHAR) = '0000-00-00 00:00:00';
UPDATE viagens SET data_entrega_prevista = NULL WHERE CAST(data_entrega_prevista AS CHAR) = '' OR CAST(data_entrega_prevista AS CHAR) = '0000-00-00 00:00:00';
UPDATE viagens SET data_entrega_real = NULL WHERE CAST(data_entrega_real AS CHAR) = '' OR CAST(data_entrega_real AS CHAR) = '0000-00-00 00:00:00';