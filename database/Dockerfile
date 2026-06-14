FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

COPY ./init /init

RUN chmod +x /init/init.sh

USER mssql

CMD /bin/bash -c "/opt/mssql/bin/sqlservr & /init/init.sh && wait"