@echo off
:: Gera timestamp no formato AAAA-MM-DD_HH-MM-SS
set ANO=%date:~6,4%
set MES=%date:~3,2%
set DIA=%date:~0,2%
set HORA=%time:~0,2%
set MIN=%time:~3,2%
set SEG=%time:~6,2%

:: Corrige espaço em branco nas horas menores que 10 (ex: 09h)
if "%HORA:~0,1%" == " " set HORA=0%HORA:~1,1%
set TIMESTAMP=%ANO%-%MES%-%DIA%_%HORA%-%MIN%-%SEG%

:: Diretório onde os arquivos de backup .sql serão salvos
set BACKUP_DIR=C:\Backups\Logistica
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo   Iniciando backup do banco de dados logistica_db

:: Executa o utilitário mysqldump nativo do MySQL Server
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe" -u root -p123456 logistica_db > "%BACKUP_DIR%\logistica_db_%TIMESTAMP%.sql"

if %ERRORLEVEL% EQU 0 (
    echo [SUCESSO] Backup gerado com sucesso em:
    echo %BACKUP_DIR%\logistica_db_%TIMESTAMP%.sql
) else (
    echo [ERRO] Falha ao gerar o backup. Verifique a senha ou o caminho do MySQL.
)

pause