-- 1. Corrige formatos 'DD/MM/YYYY HH:MM' para 'YYYY-MM-DD HH:MM:00' na tabela viagens
UPDATE viagens 
SET data_hora_pagamento = DATE_FORMAT(STR_TO_DATE(data_hora_pagamento, '%d/%m/%Y %H:%i'), '%Y-%m-%d %H:%i:00')
WHERE data_hora_pagamento LIKE '%/%/% %:%';

-- 2. Limpa strings vazias ou inválidas que não possam ser convertidas para datetime
UPDATE viagens 
SET data_hora_pagamento = NULL 
WHERE data_hora_pagamento = '' OR data_hora_pagamento = ' ' OR data_hora_pagamento = 'null';

-- 3. Sanitizar colunas de datas em clientes e motoristas caso existam textos vazios
UPDATE clientes SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE motoristas SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;