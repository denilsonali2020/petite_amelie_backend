# ETAPA 1: COMPILACIÓN
FROM node:24-bookworm-slim AS build

# Directorio de trabajo dentro de la imagen
WORKDIR /app

COPY package.json package-lock.json ./

# Instala exactamente las versiones del package-lock.json,
RUN npm ci --legacy-peer-deps

COPY prisma ./prisma

COPY prisma.config.ts tsconfig.json tsconfig.build.json ./

COPY src ./src

# Genera el cliente de Prisma y compila TypeScript.
# La URL real de Neon se proporcionará al ejecutar el contenedor.
RUN DATABASE_URL="postgresql://docker:docker@localhost:5432/docker" npm run build


# ETAPA 2: DESARROLLO
# Hereda todo lo instalado y generado en la etapa build
FROM build AS development

ENV NODE_ENV=development

ENV PORT=4000

EXPOSE 4000

# Comando predeterminado para desarrollo con Nodemon
CMD ["npm", "run", "dev"]


# ETAPA 3: PRODUCCIÓN
# Se utiliza una nueva imagen limpia de Node.js
FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

ENV PORT=4000

# Evita que Prisma intente generar nuevamente el cliente
# durante la instalación de dependencias de producción
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

COPY package.json package-lock.json ./

# Instala solamente dependencias de producción y después
# elimina la caché de npm para reducir el tamaño de la imagen
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=build /app/dist ./dist

# Ejecuta la aplicación con el usuario limitado incluido
# en la imagen oficial de Node.js
USER node

EXPOSE 4000

CMD ["npm", "start"]
