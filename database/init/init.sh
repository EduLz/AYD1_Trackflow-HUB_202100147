#!/bin/bash

echo "Esperando SQL Server..."

until /opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "Password123!" \
    -C \
    -Q "SELECT 1" > /dev/null 2>&1
do
    echo "No listo, reintentando en 5s..."
    sleep 5
done

echo "SQL Server listo."

echo "Ejecutando scripts SQL..."

for file in /init/*.sql
do
    echo "===================================="
    echo "Ejecutando $(basename "$file")"
    echo "===================================="

    /opt/mssql-tools18/bin/sqlcmd \
        -S localhost \
        -U sa \
        -P "Password123!" \
        -C \
        -b \
        -i "$file"

    if [ $? -ne 0 ]; then
        echo "Error ejecutando $file"
        exit 1
    fi
done

echo "Todos los scripts fueron ejecutados correctamente."