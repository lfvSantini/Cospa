-- Helper procedure para adicionar colunas com segurança se não existirem
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

-- 1. Colunas de status ativo nas tabelas
CALL AddColumnSafely('clientes', 'ativo', 'BOOLEAN DEFAULT TRUE');
CALL AddColumnSafely('fornecedores', 'ativo', 'BOOLEAN DEFAULT TRUE');
CALL AddColumnSafely('motoristas', 'ativo', 'BOOLEAN DEFAULT TRUE');

-- 2. Comprovante de endereço nos motoristas
CALL AddColumnSafely('motoristas', 'url_comp_endereco', 'VARCHAR(500)');

-- Remover a procedure temporária
DROP PROCEDURE IF EXISTS AddColumnSafely;