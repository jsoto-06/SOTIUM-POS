# Guía de Despliegue en Producción - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General de Despliegue](#1-visión-general-de-despliegue)
2. [Estrategias de Despliegue Suportadas](#2-estrategias-de-despliegue-suportadas)
3. [Despliegue con Docker y Docker Compose](#3-despliegue-con-docker-y-docker-compose)
4. [Despliegue en Cloud Run / Google Cloud Platform](#4-despliegue-en-cloud-run)
5. [Despliegue On-Premise (Servidor Local de Local)](#5-despliegue-on-premise)
6. [Compilación e Intercalado CJS (esbuild)](#6-compilación-e-intercalado-cjs)
7. [Inversión Proxies (Nginx) y Certificados SSL](#7-inversión-proxies-nginx-y-certificados-ssl)
8. [Monitoreo, Backups y Mantenimiento](#8-monitoreo-backups-y-mantenimiento)

---

## 1. Visión General de Despliegue

Sotium POS Enterprise utiliza un modelo de build híbrido de alta eficiencia:
* **Frontend:** Compilado como SPA estática optimizada con Vite en `dist/`.
* **Backend:** Empaquetado como un único bundle CommonJS `dist/server.cjs` mediante `esbuild`.

Este empaquetado elimina las fricciones de resolución ESM en Node.js en producción y garantiza arranques en contenedor ultrarrápidos (< 500ms).

---

## 2. Estrategias de Despliegue Soportadas

1. **Docker Container Standalone / Kubernetes:** Recomendado para grandes cadenas con infraestructura en nube privada o GCP/AWS.
2. **Google Cloud Run:** Totalmente compatible para microservicios serverless escalables.
3. **Servidor On-Premise Local (Appliance):** Servidor Linux Ubuntu Server en el establecimiento con réplica Cloud.

---

## 3. Despliegue con Docker y Docker Compose

### **Dockerfile Oficial de Producción**

```dockerfile
# ETAPA 1: Compilación
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ETAPA 2: Runtime Producción
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/data ./data

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

### **Docker Compose (`docker-compose.yml`)**

```yaml
version: '3.8'

services:
  sotium-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://sotium:password@postgres:5432/sotium_prod
      - JWT_SECRET=production_jwt_key_enterprise
    depends_on:
      - postgres
    restart: always

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: sotium
      POSTGRES_PASSWORD: password
      POSTGRES_DB: sotium_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_data:
```

---

## 4. Despliegue en Cloud Run

1. **Construir y subir imagen a Artifact Registry:**
   ```bash
   gcloud builds submit --tag gcr.io/tu-proyecto-gcp/sotium-pos:latest
   ```

2. **Desplegar servicio en Cloud Run:**
   ```bash
   gcloud run deploy sotium-pos \
     --image gcr.io/tu-proyecto-gcp/sotium-pos:latest \
     --platform managed \
     --region europe-west1 \
     --allow-unauthenticated \
     --port 3000 \
     --set-env-vars NODE_ENV=production
   ```

---

## 5. Compilación e Intercalado CJS (esbuild)

El script de producción definido en `package.json` ejecuta:

```bash
npm run build
```

Ejecuta dos pasos secuenciales:
1. `vite build`: Compila los assets de React en `dist/`.
2. `esbuild server.ts`: Bundlea la aplicación de servidor en `dist/server.cjs` marcando dependencias externas como `--packages=external`.

---

## 6. Configuración de Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name pos.tuempresa.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 7. Backups y Mantenimiento de Datos

* **PostgreSQL:** Realizar rotación diaria de dumps con `pg_dump`.
* **SQLite Local:** El archivo `./data/sotium_offline.sqlite` debe ser incluido en los scripts de respaldo de discos de la máquina local.
