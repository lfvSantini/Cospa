DROP PROCEDURE IF EXISTS AddColumnSafelyV12;
DELIMITER $$
CREATE PROCEDURE AddColumnSafelyV12(
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

-- 1. Garantir todas as colunas de fornecedores
CALL AddColumnSafelyV12('fornecedores', 'cnpj_cpf', 'VARCHAR(20)');
CALL AddColumnSafelyV12('fornecedores', 'nome_contato', 'VARCHAR(100)');
CALL AddColumnSafelyV12('fornecedores', 'telefone', 'VARCHAR(30)');
CALL AddColumnSafelyV12('fornecedores', 'email', 'VARCHAR(100)');
CALL AddColumnSafelyV12('fornecedores', 'chave_pix', 'VARCHAR(100)');
CALL AddColumnSafelyV12('fornecedores', 'situacao', 'VARCHAR(20) NOT NULL DEFAULT ''ATIVO''');
CALL AddColumnSafelyV12('fornecedores', 'obs', 'TEXT');
CALL AddColumnSafelyV12('fornecedores', 'ativo', 'BOOLEAN DEFAULT TRUE');

-- 2. Garantir colunas de clientes e motoristas
CALL AddColumnSafelyV12('clientes', 'ativo', 'BOOLEAN DEFAULT TRUE');
CALL AddColumnSafelyV12('motoristas', 'ativo', 'BOOLEAN DEFAULT TRUE');
CALL AddColumnSafelyV12('motoristas', 'url_comp_endereco', 'VARCHAR(500)');

DROP PROCEDURE IF EXISTS AddColumnSafelyV12;