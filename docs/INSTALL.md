# Guía de Instalación y Configuración Local - Sotium POS Enterprise

---

## 📌 Índice
1. [Requisitos del Sistema](#1-requisitos-del-sistema)
2. [Pasos de Instalación Paso a Paso](#2-pasos-de-instalación-paso-a-paso)
3. [Configuración del Archivo `.env`](#3-configuración-del-archivo-env)
4. [Inicialización de Bases de Datos (PostgreSQL & SQLite)](#4-inicialización-de-bases-de-datos)
5. [Ejecución en Entorno de Desarrollo](#5-ejecución-en-entorno-de-desarrollo)
6. [Verificación de la Instalación](#6-verificación-de-la-instalación)
7. [Resolución de Problemas Comunes](#7-resolución-de-problemas-comunes)

---

## 1. Requisitos del Sistema

### **Hardware Mínimo Recomendado (Servidor Local / TPV Principal)**
* **CPU:** Procesador Quad-Core x86-64 a 2.0 GHz o superior (Intel Core i3 / AMD Ryzen 3 / Apple Silicon).
* **Memoria RAM:** 8 GB DDR4/DDR5.
* **Almacenamiento:** 20 GB SSD NVMe disponible.
* **Red:** Tarjeta Ethernet Gigabit (1000 Mbps) para comanderos e impresoras de red.

### **Software Requerido**
* **Node.js:** Versión LTS `>= 20.0.0` (Recomendado v22.x).
* **npm:** Versión `>= 10.0.0`.
* **PostgreSQL:** Versión `>= 15.0` *(Opcional para desarrollo en modo SQLite aislado)*.
* **Git:** Para control de versiones.

---

## 2. Pasos de Instalación Paso a Paso

### **Paso 1: Clonar el Repositorio**
```bash
git clone https://github.com/sotium/sotium-pos.git
cd sotium-pos
```

### **Paso 2: Instalar Dependencias del Proyecto**
```bash
npm install
```

---

## 3. Configuración del Archivo `.env`

Cree un archivo de configuración `.env` en la raíz del proyecto copiando la plantilla de ejemplo:

```bash
cp .env.example .env
```

### **Variables Obligatorias:**

```env
# Puerto de Servidor Express (Fijo en 3000 para Cloud/Containers)
PORT=3000
NODE_ENV=development

# Clave Secreta para Firma de Tokens JWT
JWT_SECRET=super_secret_enterprise_key_sotium_2026_xyz123

# URL de Conexión a PostgreSQL (Central)
DATABASE_URL="postgresql://sotium_user:sotium_password@localhost:5432/sotium_db?schema=public"

# Configuración de SQLite Local (Offline Engine)
SQLITE_DB_PATH="./data/sotium_offline.sqlite"

# API Key de Google Gemini AI (Opcional - habilita Inteligencia Generativa)
GEMINI_API_KEY=tu_api_key_de_google_gemini_aqui

# Datos Emisor Veri*Factu / TicketBAI
NIF_EMISOR="B12345678"
NOMBRE_EMISOR="RESTAURANTE SOTIUM ENTERPRISE S.L."
```

---

## 4. Inicialización de Bases de Datos

### **PostgreSQL con Prisma ORM**
Asegúrese de que el servicio de PostgreSQL esté activo y ejecute la migración del esquema:

```bash
# Empujar el esquema Prisma a la base de datos
npx prisma db push

# (Opcional) Generar el cliente Prisma
npx prisma generate
```

---

## 5. Ejecución en Entorno de Desarrollo

Inicie el servidor Express + Vite en modo desarrollo interactivo con `tsx`:

```bash
npm run dev
```

El servidor estará escuchando en `http://localhost:3000`.

---

## 6. Verificación de la Instalación

1. Abra su navegador en `http://localhost:3000`.
2. Acceda a la API de salud en `http://localhost:3000/api/health`. Debe recibir un objeto JSON con estado `"status": "ok"`.
3. Ejecute la suite de pruebas para confirmar la integridad del código:
   ```bash
   npx vitest run
   ```

---

## 7. Resolución de Problemas Comunes

* **Error `DATABASE_URL` no válida:** Verifique las credenciales de PostgreSQL en el archivo `.env`.
* **Error `better-sqlite3` bindings:** En entornos ARM64/Linux ejecute `npm rebuild better-sqlite3`.
* **Error de puerto ocupado:** Cierre cualquier otro proceso utilizando el puerto 3000 o configure el reenvío de puertos.
