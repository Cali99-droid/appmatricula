# Etapa de desarrollo
FROM node:21-alpine3.19 as dev
WORKDIR /app
COPY package*.json ./
RUN yarn install  
RUN yarn add sharp --ignore-engines
CMD [ "yarn","start:dev"]

# Preparación de dependencias de desarrollo
FROM node:21-alpine3.19 as dev-deps
WORKDIR /app
COPY package.json package.json
RUN yarn install --frozen-lockfile
RUN yarn add sharp --ignore-engines
# Construcción del proyecto
FROM node:21-alpine3.19 as builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
# Descomentar la siguiente línea si necesitas ejecutar pruebas
# RUN yarn test
RUN yarn build

# Preparación de dependencias de producción
FROM node:21-alpine3.19 as prod-deps
WORKDIR /app
COPY package.json package.json
RUN yarn install --prod --frozen-lockfile 
RUN yarn add sharp --ignore-engines
# Entorno de producción
FROM node:21-alpine3.19 as prod
# EXPOSE 3000
WORKDIR /app
ENV APP_VERSION=${APP_VERSION}
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD [ "node","dist/main.js"]    
