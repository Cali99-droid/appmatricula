# Etapa de desarrollo
FROM node:19-alpine3.15 as dev
WORKDIR /app
COPY package*.json ./

RUN npm install

CMD [ "npm", "run", "start:dev"]

# Preparación de dependencias de desarrollo
FROM node:19-alpine3.15 as dev-deps
WORKDIR /app
COPY package*.json ./
COPY package.json package.json

RUN npm ci

# Construcción del proyecto
FROM node:19-alpine3.15 as builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
# Descomentar la siguiente línea si necesitas ejecutar pruebas
# RUN npm run test
RUN npm run build

# Preparación de dependencias de producción
FROM node:19-alpine3.15 as prod-deps
WORKDIR /app
COPY package-lock.json ./
COPY package.json package.json
RUN npm ci 

# Entorno de producción
FROM node:19-alpine3.15 as prod
EXPOSE 3000
WORKDIR /app
ENV APP_VERSION=${APP_VERSION}
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD [ "node", "dist/main.js"]
