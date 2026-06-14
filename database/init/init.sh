#!/bin/bash
echo "Esperando SQL Server..."

until /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "Password123!" -C \
    -Q "SELECT 1" > /dev/null 2>&1; do
    echo "No listo, reintentando en 5s..."
    sleep 5
done

echo "SQL Server listo. Ejecutando schema..."
/opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "Password123!" \
    -C \
    -b \
    -i /init/schema.sql

echo "Base de datos creada."