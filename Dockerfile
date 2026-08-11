# Se selecciona imagen oficial de Node.js sobre Alpine Linux
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8080

CMD ["npm", "start"]