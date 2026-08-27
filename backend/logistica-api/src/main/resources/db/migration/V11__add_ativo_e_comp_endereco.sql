DROP PROCEDURE IF EXISTS AddColumnSafelyV11;
DELIMITER $$
CREATE PROCEDURE AddColumnSafelyV11(
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

CALL AddColumnSafelyV11('clientes', 'ativo', 'BOOLEAN DEFAULT TRUE');
CALL AddColumnSafelyV11('fornecedores', 'ativo', 'BOOLEAN DEFAULT TRUE');
CALL AddColumnSafelyV11('motoristas', 'ativo', 'BOOLEAN DEFAULT TRUE');
CALL AddColumnSafelyV11('motoristas', 'url_comp_endereco', 'VARCHAR(500)');

DROP PROCEDURE IF EXISTS AddColumnSafelyV11;