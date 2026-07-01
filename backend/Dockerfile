FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install --production

# Copiar todo el código fuente del backend, incluyendo src
COPY . .

# Exponer el puerto en el que corre app.js 
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["npm", "start", "src/app.js"]