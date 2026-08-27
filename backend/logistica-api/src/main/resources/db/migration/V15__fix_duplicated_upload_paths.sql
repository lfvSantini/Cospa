-- Remove caminhos duplicados /uploads//uploads/ ou /uploads/uploads/
UPDATE comprovantes 
SET url_arquivo = REPLACE(url_arquivo, '/uploads//uploads/', '/uploads/')
WHERE url_arquivo LIKE '%/uploads//uploads/%';

UPDATE comprovantes 
SET url_arquivo = REPLACE(url_arquivo, '/uploads/uploads/', '/uploads/')
WHERE url_arquivo LIKE '%/uploads/uploads/%';

UPDATE motoristas 
SET url_cnh = REPLACE(url_cnh, '/uploads//uploads/', '/uploads/'),
    url_crlv = REPLACE(url_crlv, '/uploads//uploads/', '/uploads/'),
    url_comp_endereco = REPLACE(url_comp_endereco, '/uploads//uploads/', '/uploads/');