# Especificación de API REST - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General](#1-visión-general)
2. [Autenticación y Cabeceras](#2-autenticación-y-cabeceras)
3. [Estructura Estándar de Respuestas](#3-estructura-estándar-de-respuestas)
4. [Códigos de Estado HTTP](#4-códigos-de-estado-http)
5. [Catálogo Completo de Endpoints](#5-catálogo-completo-de-endpoints)
   - [5.1 Salud y Estado (`/api/health`)](#51-salud-y-estado)
   - [5.2 Autenticación (`/api/auth`)](#52-autenticación)
   - [5.3 Auditoría (`/api/audit`)](#53-auditoría)
   - [5.4 Backoffice & TPV (`/api/backoffice`)](#54-backoffice--tpv)
   - [5.5 Reservas & CRM (`/api/reservations`)](#55-reservas--crm)
   - [5.6 Compras & Proveedores (`/api/purchases`)](#56-compras--proveedores)
   - [5.7 Inventario & Almacenes (`/api/inventory`)](#57-inventario--almacenes)
   - [5.8 Producción & Recetas (`/api/production`)](#58-producción--recetas)
   - [5.9 RRHH & Fichajes (`/api/hr`)](#59-rrhh--fichajes)
   - [5.10 Finanzas & Tesorería (`/api/finance`)](#510-finanzas--tesorería)
   - [5.11 Business Intelligence & IA (`/api/bi`, `/api/ai`)](#511-business-intelligence--ia)
   - [5.12 Cumplimiento Fiscal (`/api/verifactu`, `/api/ticketbai`, `/api/facturae`)](#512-cumplimiento-fiscal)
   - [5.13 Calidad & APPCC (`/api/quality-haccp`)](#513-calidad--appcc)
   - [5.14 Mantenimiento & SAT (`/api/maintenance`)](#514-mantenimiento--sat)
   - [5.15 Integraciones & Webhooks (`/api/integrations`)](#515-integraciones--webhooks)
   - [5.16 Sincronización Offline (`/api/sync`)](#516-sincronización-offline)

---

## 1. Visión General

La API REST de **Sotium POS Enterprise** proporciona acceso seguro a todas las entidades de dominio y operaciones del sistema. Diseñada bajo principios RESTful estrictos, utiliza payloads en formato JSON, autenticación mediante Tokens JWT y validación previa de datos mediante esquemas Zod.

---

## 2. Autenticación y Cabeceras

Todas las peticiones a endpoints protegidos deben incluir el token Bearer JWT en la cabecera `Authorization`:

```http
Authorization: Bearer <tu_jwt_token_aqui>
Content-Type: application/json
Accept: application/json
```

---

## 3. Estructura Estándar de Respuestas

### **Respuesta Exitosa (HTTP 200 / 201)**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación realizada con éxito",
  "timestamp": "2026-08-01T10:00:00.000Z"
}
```

### **Respuesta de Error (HTTP 4xx / 5xx)**
```json
{
  "error": "DESCRIPCION_ERROR",
  "details": [ ... ],
  "timestamp": "2026-08-01T10:00:00.000Z"
}
```

---

## 4. Códigos de Estado HTTP

| Código | Significado | Descripción |
| :---: | :--- | :--- |
| **200 OK** | Solicitud Exitosa | Petición procesada correctamente. |
| **201 Created** | Recurso Creado | Recurso creado con éxito en la base de datos. |
| **400 Bad Request** | Datos Inválidos | Fallo en la validación del esquema Zod o parámetros faltantes. |
| **401 Unauthorized** | Sin Autenticación | Token JWT ausente, expirado o no válido. |
| **403 Forbidden** | Acceso Denegado | El usuario autenticado no posee los permisos de rol requeridos. |
| **404 Not Found** | No Encontrado | El recurso solicitado no existe. |
| **500 Internal Error** | Error de Servidor | Excepción no controlada en el servidor. |

---

## 5. Catálogo Completo de Endpoints

### 5.1 Salud y Estado

#### `GET /api/health`
Devuelve el estado operativo del servidor Express, conexión a PostgreSQL y SQLite local.

* **Respuesta Exitosa:**
  ```json
  {
    "status": "ok",
    "service": "Sotium POS Enterprise Engine",
    "timestamp": "2026-08-01T10:00:00.000Z",
    "databases": {
      "sqlite": "CONNECTED",
      "postgres": "CONNECTED"
    }
  }
  ```

---

### 5.2 Autenticación

#### `POST /api/auth/login`
Autentica un usuario mediante credenciales (email/username y contraseña) o PIN de camarero.

* **Body Request:**
  ```json
  {
    "username": "admin",
    "password": "Password123!"
  }
  ```
* **Respuesta Exitosa (200):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-100",
      "name": "Carlos Mendoza",
      "role": "ADMIN",
      "email": "carlos@sotium.com"
    }
  }
  ```

#### `GET /api/auth/me`
Obtiene los datos del usuario autenticado actualmente a partir del token JWT.

---

### 5.3 Auditoría

#### `GET /api/audit/logs`
Obtiene el historial registrado de acciones de auditoría del sistema con filtros opcionales por usuario, fecha o módulo.

* **Query Params:** `userId`, `module`, `limit`, `page`.

---

### 5.4 Backoffice & TPV

#### `GET /api/backoffice/dashboard`
Retorna el resumen de ventas del día, estado de mesas, arqueos activos y alertas.

#### `GET /api/backoffice/products`
Obtiene la lista completa de productos activos, precios, impuestos y destino de impresora KDS.

#### `POST /api/backoffice/orders`
Crea o actualiza una comanda en el sistema.

* **Body Request:**
  ```json
  {
    "tableId": "tbl-01",
    "tableName": "Mesa 1",
    "serverName": "Juan Pérez",
    "items": [
      {
        "productId": "prod-10",
        "productName": "Solomillo de Ternera",
        "quantity": 2,
        "unitPrice": 22.50,
        "course": "SEGUNDO"
      }
    ]
  }
  ```

---

### 5.5 Reservas & CRM

#### `GET /api/reservations`
Obtiene la lista de reservas filtradas por fecha, estado o salón.

#### `POST /api/reservations`
Registra una nueva reserva con validación de disponibilidad y predicción de No-Show.

---

### 5.6 Compras & Proveedores

#### `GET /api/purchases/suppliers`
Obtiene la lista de proveedores homologados con CIF, condiciones de pago e IBAN.

#### `POST /api/purchases/orders`
Genera un pedido de compra a proveedor.

---

### 5.7 Inventario & Almacenes

#### `GET /api/inventory/stock`
Consulta los niveles de stock actual por almacén e ingrediente.

#### `POST /api/inventory/movements`
Registra un movimiento manual de entrada, salida, ajuste o merma.

---

### 5.8 Producción & Recetas

#### `GET /api/production/recipes`
Obtiene el catálogo de fichas técnicas y escandallos de recetas.

#### `POST /api/production/orders`
Inicia una orden de producción industrial.

---

### 5.9 RRHH & Fichajes

#### `POST /api/hr/time-logs`
Registra un fichaje de entrada o salida de trabajador.

#### `GET /api/hr/inspection-export`
Genera el informe oficial en formato CSV para inspección de trabajo.

---

### 5.10 Finanzas & Tesorería

#### `GET /api/finance/journal`
Obtiene las entradas del libro diario de contabilidad PGC.

#### `POST /api/finance/closing`
Efectúa el cierre formal de caja (Arqueo Z).

---

### 5.11 Business Intelligence & IA

#### `POST /api/ai/analyze-sales`
Invoca la analítica de ventas asistida por la IA Gemini 2.5 Flash.

---

### 5.12 Cumplimiento Fiscal

#### `POST /api/verifactu/generate`
Genera el registro de factura/tique con firma y encadenamiento SHA-256 para la AEAT.

#### `POST /api/ticketbai/generate`
Genera la entrega XML firmada y código QR para Hacienda Foral.

---

### 5.13 Calidad & APPCC

#### `GET /api/quality-haccp/temperatures`
Obtiene los registros del cuaderno de temperaturas de cámaras.

---

### 5.14 Mantenimiento & SAT

#### `GET /api/maintenance/assets`
Obtiene el inventario de equipamiento y maquinaria del local.

---

### 5.15 Integraciones & Webhooks

#### `GET /api/integrations/catalog`
Lista los conectores activos (Glovo, Uber Eats, Deliverect, PMS Hotel).

---

### 5.16 Sincronización Offline

#### `POST /api/sync/push`
Sincroniza un lote de transacciones locales registradas en SQLite con PostgreSQL.
