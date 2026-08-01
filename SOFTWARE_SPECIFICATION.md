# ESPECIFICACIÓN TÉCNICA Y ARQUITECTURA DE SOFTWARE: SOTIUM POS ENTERPRISE

> **Documento de Especificación Comercial y Arquitectura de Sistemas v2026.1**  
> **Sistema Integral de Gestión de Hostelería, TPV Táctil, ERP Multialmacén y Cumplimiento Fiscal**  
> **Ámbito Geográfico y Fiscal**: España (AEAT VeriFactu, Gipuzkoa TicketBAI, Bizkaia Batuz, Álava TicketBAI) y Resto de Europa  
> **Plataformas**: Linux, Windows, macOS, Electron, Docker, PWA Móvil

---

## 📑 ÍNDICE GENERAL DETALLADO

1. [RESUMEN EJECUTIVO Y VISIÓN DEL PRODUCTO](#1-resumen-ejecutivo-y-visión-del-producto)
2. [ARQUITECTURA DE SISTEMAS Y PATRONES DISEÑO](#2-arquitectura-de-sistemas-y-patrones-diseño)
3. [MODELO DE DATOS Y BASE DE DATOS DUAL (POSTGRESQL + SQLITE)](#3-modelo-de-datos-y-base-de-datos-dual-postgresql--sqlite)
4. [MOTOR DE SINCRONIZACIÓN OFFLINE-FIRST (SYNC ENGINE)](#4-motor-de-sincronización-offline-first-sync-engine)
5. [SISTEMA TPV TÁCTIL Y GESTIÓN DE SALONES](#5-sistema-tpv-tÁctil-y-gestiÓn-de-salones)
6. [GESTIÓN DE COMANDAS Y PANTALLAS DE COCINA (KDS)](#6-gestiÓn-de-comandas-y-pantallas-de-cocina-kds)
7. [MOTOR DE PRICING, TARIFAS, COMBOS Y ALÉRGENOS](#7-motor-de-pricing-tarifas-combos-y-alÉrgenos)
8. [ALMACÉN, ESCANDALLOS, MERMAS Y COMPRAS](#8-almacÉn-escandallos-mermas-y-compras)
9. [CRM, FIDELIZACIÓN, TARJETAS PREPAGO Y RESERVAS](#9-crm-fidelizaciÓn-tarjetas-prepago-y-reservas)
10. [NORMATIVA FISCAL: VERIFACTU Y TICKETBAI](#10-normativa-fiscal-verifactu-y-ticketbai)
11. [HARDWARE, IMPRESIÓN ESC/POS Y DISPOSITIVOS](#11-hardware-impresiÓn-escpos-y-dispositivos)
12. [MÓDULO DE INTELIGENCIA ARTIFICIAL (GEMINI ENTERPRISE)](#12-mÓdulo-de-inteligencia-artificial-gemini-enterprise)
13. [SEGURIDAD, MATRIZ DE PERMISOS Y OWASP](#13-seguridad-matriz-de-permisos-y-owasp)
14. [INTEGRACIÓN ELECTRON Y DESPLIEGUE DOCKER](#14-integraciÓn-electron-y-despliegue-docker)
15. [ESPECIFICACIÓN COMPLETA DE APIS REST & WEBSOCKETS](#15-especificaciÓn-completa-de-apis-rest--websockets)
16. [RENDIMIENTO, BENCHMARKS Y MÉTRICAS DE CALIDAD](#16-rendimiento-benchmarks-y-mÉtricas-de-calidad)

---

## 1. RESUMEN EJECUTIVO Y VISIÓN DEL PRODUCTO

### 1.1 Objetivo del Sistema
Sotium POS es una plataforma de software Enterprise para la gestión integral de establecimientos hosteleros (restaurantes, cadenas de comida rápida, cafeterías, discotecas, hoteles y catering). Combina la rapidez operativa de un Terminal Punto de Venta (TPV) táctil industrial con la solidez de un ERP de gestión centralizada y cumplimiento normativo estricto.

### 1.2 Diferenciadores Competitivos Clave
* **Resiliencia Offline-First Absoluta**: Capacidad de operabilidad completa sin conexión a red o servidor central mediante réplica local síncrona en SQLite y motor de encolado transaccional determinista hacia PostgreSQL.
* **Cumplimiento Tributario Nativo**: Encadenamiento SHA-256 inmutable, firma digital RSA, generación de QR oficial AEAT/TicketBAI y trazabilidad total conforme al Real Decreto 1007/2023 y Ley 11/2021 Antifraude.
* **Driver ESC/POS Universal Directo**: Impresión térmica de alta velocidad en impresoras de red (Ethernet/Wi-Fi), USB y RS232 sin intermediarios de drivers del sistema operativo.
* **Integración IA Predictiva**: Motor asistido por modelos de lenguaje de última generación para optimización de compras, prevención de mermas y análisis de menú engineering.

---

## 2. ARQUITECTURA DE SISTEMAS Y PATRONES DISEÑO

### 2.1 Visión General de la Arquitectura
El sistema adopta una arquitectura multicapa desacoplada con patrón **Hexagonal (Ports and Adapters)** en el servidor Node.js/TypeScript y **Clean Component Architecture** en el frontend React 18+.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENTES (FRONTEND)                               |
|   +-------------------+    +---------------------+    +-----------------------+   |
|   |  TPV Táctil Web   |    | Comandero PWA Mobile|    | Electron Desktop App  |   |
|   +---------+---------+    +----------+----------+    +-----------+-----------+   |
+-------------|-------------------------|---------------------------|---------------+
              |                         |                           |
              v                         v                           v
+-----------------------------------------------------------------------------------+
|                              CAPA DE ADAPTADORES (API)                            |
|        Express REST Routes (v1)   |   WebSocket Realtime Gateways                 |
+-----------------------------------|-----------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------------+
|                             NÚCLEO DE NEGOCIO (SERVICES)                          |
|  +----------------+  +----------------+  +----------------+  +-----------------+  |
|  | Auth & Security|  | Pricing Engine |  | VeriFactu/TBAI |  | ESC/POS Printer |  |
|  +----------------+  +----------------+  +----------------+  +-----------------+  |
|  | Sync Engine    |  | KDS Service    |  | Audit Service  |  | Stock & Recipe  |  |
|  +----------------+  +----------------+  +----------------+  +-----------------+  |
+-----------------------------------|-----------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------------+
|                        CAPA DE PERSISTENCIA & ALMACENAMIENTO                      |
|  +----------------------------------+    +-------------------------------------+  |
|  |  PostgreSQL 16 (Central Multi-Tenant)|    |  Better-SQLite3 (Local Standalone)  |  |
|  +----------------------------------+    +-------------------------------------+  |
|  |  Redis 7.0 (Cache & Pub/Sub Queue) |    |  Prisma ORM (Data Access Layer)     |  |
|  +----------------------------------+    +-------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 2.2 Principios de Diseño
1. **Desacoplamiento Tecnológico**: El dominio de negocio no depende de frameworks externos ni de librerías de UI específicas.
2. **Imutabilidad Fiscal**: Los registros de venta emitidos se firman digitalmente y se encadenan criptográficamente en estructuras anexas inalterables.
3. **Failover Transparente**: Detección de caída de nodo central con conmutación automática a almacenamiento local sin interrupción de pantalla.

---

## 3. MODELO DE DATOS Y BASE DE DATOS DUAL (POSTGRESQL + SQLITE)

### 3.1 Estrategia de Base de Datos Dual
El sistema utiliza una arquitectura de almacenamiento híbrido:
* **Entorno Online Central**: PostgreSQL 16 desplegado en contenedor Docker con réplica de lectura.
* **Entorno Standalone / Offline TPV**: Better-SQLite3 incrustado en memoria y disco local en el cliente Electron / Node.js local.

### 3.2 Esquema Principal en Prisma (Extracto de Entidades Clave)

#### Entidad: Tenant & Salon (Organización y Salones)
```prisma
model Organization {
  id        String   @id @default(uuid())
  name      String
  taxId     String   @unique
  address   String
  salons    Salon[]
  users     User[]
  createdAt DateTime @default(now())
}

model Salon {
  id             String   @id @default(uuid())
  organizationId String
  name           String
  code           String
  tables         Table[]
  @@index([organizationId])
}

model Table {
  id        String   @id @default(uuid())
  salonId   String
  number    String
  capacity  Int
  posX      Float
  posY      Float
  shape     String   @default("RECTANGLE")
  orders    Order[]
  @@index([salonId])
}
```

#### Entidad: Order & OrderItem (Comandas y Tickets)
```prisma
enum OrderStatus {
  OPEN
  SENT_TO_KITCHEN
  CHECK_REQUESTED
  PAID
  CANCELLED
}

enum KdsStatus {
  PENDING
  PREPARING
  READY
  SERVED
}

model Order {
  id             String      @id @default(uuid())
  orderNumber    String      @unique
  tableId        String?
  serverId       String
  status         OrderStatus @default(OPEN)
  subtotal       Float
  vatTotal       Float
  total          Float
  paymentMethod  String?
  verifactuHash  String?
  items          OrderItem[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([status, createdAt])
  @@index([tableId])
  @@index([serverId])
}

model OrderItem {
  id         String    @id @default(uuid())
  orderId    String
  productId  String
  quantity   Int
  unitPrice  Float
  totalPrice Float
  notes      String?
  kdsStatus  KdsStatus @default(PENDING)
  order      Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([kdsStatus])
}
```

---

## 4. MOTOR DE SINCRONIZACIÓN OFFLINE-FIRST (SYNC ENGINE)

### 4.1 Algoritmo de Encolado y Resolución de Conflictos (CRDT)
El `SyncService` gestiona una cola local persistente (`SyncQueue`) en la base de datos local SQLite. Cada operación de creación, actualización o eliminación en modo fuera de línea produce un registro estructurado con:
* `id`: UUID v4 de la operación.
* `action`: Enum (`CREATE`, `UPDATE`, `DELETE`).
* `entity`: Nombre de la tabla destino.
* `payload`: Documento JSON serializado.
* `timestamp`: Unix Timestamp en milisegundos NTP.

```
       +-------------------------------------------------------+
       |               ACCION DE USUARIO EN TPV                |
       +---------------------------+---------------------------+
                                   |
                         ¿Conexión activa?
                        /                 \
                     SÍ                    NO
                    /                        \
                   v                          v
      +------------------------+  +------------------------+
      | Transacción Directa    |  | Inserción en SQLite    |
      | PostgreSQL Central     |  | Local SyncQueue        |
      +------------------------+  +-----------+------------+
                                              |
                                              v
                                  +------------------------+
                                  | Reintentos periódicos  |
                                  | Sync Engine Background |
                                  +-----------+------------+
                                              |
                                              v
                                  +------------------------+
                                  | Envío Batch a          |
                                  | POST /api/v1/sync      |
                                  +------------------------+
```

---

## 5. SISTEMA TPV TÁCTIL Y GESTIÓN VISUAL DE SALONES Y MESAS (FASE 8 ENTERPRISE)

### 5.1 Interfaz Táctil y Diseñador Visual Drag & Drop
* **Resolución & Ergonomía**: Diseñado para paneles táctiles capacitivos e inductivos desde 10" hasta 24" (Full HD 1920x1080). Botones con objetivo mínimo de `48px x 48px`.
* **Editor Visual Interactivo**: Diseñador tipo Drag & Drop con ajuste magnético a rejilla de 20px, zoom configurable (50% a 200%), bloqueo de posición (`isLocked`), duplicado instantáneo y rotación personalizada (0º, 45º, 90º, 180º, 360º).
* **Salones Ilimitados y Tipologías**:
  - `COMEDOR`: Comedor principal noble con climatización.
  - `BARRA`: Taburetes y consumo de tapeo rápido.
  - `TERRAZA`: Exterior con sombrillas y estufas.
  - `RESERVADOS`: Espacios VIP privados.
  - `EVENTOS`: Banquetes y salones modulares.
  - `PLANTA_SUPERIOR`: Altillo y miradores panorámicos.
  - `CUSTOM`: Configuración de zonas libres.

### 5.2 Estados de Mesa y Trazabilidad en Tiempo Real (11 Estados)
1. **LIBRE (`FREE`)**: Mesa desinfectada lista para ocupar.
2. **RESERVADA (`RESERVED`)**: Vinculada a reserva confirmada con hora y pax.
3. **OCUPADA (`OCCUPIED`)**: Clientes sentados consumiendo.
4. **PENDIENTE PEDIR (`PENDING_ORDER`)**: Clientes en mesa esperando comanda.
5. **EN COCINA (`IN_KITCHEN`)**: Comanda enviada a KDS / barra.
6. **SIRVIENDO (`SERVING`)**: Platos principales servidos.
7. **ESPERANDO POSTRE (`WAITING_DESSERT`)**: Retirada de platos, marcha de postres/cafés.
8. **PIDIENDO CUENTA (`BILL_REQUESTED`)**: Solicitud de prefactura / proforma en curso.
9. **PAGANDO (`PAYING`)**: Proceso de cobro en TPV.
10. **LIMPIEZA (`CLEANING`)**: Requerimiento de desbarraso y desinfección.
11. **FUERA DE SERVICIO (`OUT_OF_SERVICE`)**: Mesa bloqueada por avería o mantenimiento.

### 5.3 Operaciones Avanzadas y Sincronización WebSockets
* **Unión y Separación de Mesas**: Agrupación lógica de múltiples mesas adyacentes manteniendo la mesa principal y liberando / separando con un clic.
* **Transferencia de Comandas y Cambio de Salón**: Traslado íntegro de comensales, comanda activa y servidor asignado entre mesas o salones.
* **Vincular Reservas & Check-In / No-Show**: Asignación directa de reservas confirmadas con cambio automático de color y estado, check-in para sentar cliente y no-show para liberar mesa.
* **Sincronización WebSockets Real-Time**: Emisión inmediata mediante Socket.io de eventos `table:status-changed`, `table:position-changed`, `table:joined-changed` y `salon:changed` para actualización instantánea en comanderos móviles y terminales TPV.
   * *Selección por Artículos*: Transferencia visual de ítems de la comanda original a una nueva subcuenta parcial.

---

## 6. GESTIÓN DE COMANDAS Y PANTALLAS DE COCINA (KDS)

### 6.1 Enrutamiento de Comandas
Cada producto posee una categoría vinculada a un destino de impresión o pantalla KDS (`Cocina Caliente`, `Barra Bebidas`, `Parrilla`, `Postres`). Al pulsar "Enviar Comanda", el sistema fragmenta el pedido y despacha simultáneamente:
1. Petición WebSocket al servidor de la pantalla KDS de la estación correspondiente.
2. Flujo de datos binario ESC/POS a la impresora de comanda física (respuesto secundario).

### 6.2 Ciclo de Vida del Plato en KDS
```
[PENDIENTE] -> (Pulsación Cocinero) -> [EN PREPARACIÓN] -> (Completado) -> [LISTO EN PASE] -> (Camarero retira) -> [ENTREGADO]
```

---

## 7. MOTOR DE PRICING, TARIFAS, COMBOS Y ALÉRGENOS

### 7.1 Evaluación Dinámica de Precios (`PricingEngine`)
El motor aplica reglas sucesivas de ajuste de precio:
$$\text{Precio Final} = (\text{Precio Base} \times \text{Factor Tarifa Salón}) + \sum \text{Coste Modificadores} - \text{Descuentos Aplicables}$$

### 7.2 Reglamento UE 1169/2011 (Alérgenos Obligatorios)
Gestión completa de los 14 alérgenos de declaración obligatoria (Gluten, Crustáceos, Huevos, Pescado, Cacahuetes, Soja, Lácteos, Frutos de cáscara, Apio, Mostaza, Sésamo, Dióxido de azufre/Sulfitos, Altramuces, Moluscos) con filtrado preventivo al tomar la comanda.

---

## 8. ALMACÉN, ESCANDALLOS, MERMAS Y COMPRAS

### 8.1 Descuento por Escandallo en Tiempo Real
Cuando se vende una unidad del producto `Hamburguesa Completa`, el sistema calcula y ejecuta la deducción de existencias en el almacén asociado:
* $0.200 \text{ kg}$ de Carne de Vacuno Picada.
* $1.000 \text{ un}$ de Pan Brioche.
* $0.030 \text{ kg}$ de Queso Cheddar.

### 8.2 Valoración de Inventario y PMP
Cálculo continuo del **Precio Medio Ponderado (PMP)** tras la recepción de cada Albarán de Compra:
$$\text{PMP}_{\text{nuevo}} = \frac{(\text{Stock Actual} \times \text{PMP}_{\text{anterior}}) + (\text{Cantidad Entrante} \times \text{Precio Compra})}{\text{Stock Actual} + \text{Cantidad Entrante}}$$

### 8.3 Módulo Enterprise de Compras, Proveedores & IA Prediccional (FASE 11)
Integración completa de la cadena de suministro HORECA:
* **Ficha de Proveedor Enterprise**: Gestión multivariable (UUID, CIF/NIF, Razón Social, Nombre Comercial, IBAN, SWIFT, Plazos/Formas de pago, Días y horarios de reparto, Familias asociadas, Documentación adjunta).
* **Gestión de Pedidos de Compra**: Ciclo de vida con estados transaccionales (`BORRADOR`, `PENDIENTE`, `ENVIADO`, `CONFIRMADO`, `PREPARANDO`, `EN_TRANSITO`, `RECEPCIONADO_PARCIAL`, `RECEPCIONADO`, `CANCELADO`).
* **Recepción y Albaranes de Entrada**: Control parcial/total de recepcióm de mercancías con lotes y fechas de caducidad, actualización automática de existencias e incremento del PMP.
* **Liquidación de Facturas de Proveedor & Vencimientos**: Conversión directa de albaranes agrupados a Factura, desglose de IVA soportado (21%, 10%, 4%, 0%) y calendario interactivo de vencimientos con estados (`PENDIENTE`, `PAGADO`, `VENCIDO`).
* **Devoluciones a Proveedor**: Registro auditado de devoluciones por mermas o incidencias con deducción de stock en almacén.
* **Comparador Histórico de Precios & Asistente IA**: Matriz de variación de costes entre proveedores y motor de recomendación de pedidos en 1-Click impulsado por algoritmos predíccionales de seguridad de stock.

---

## 9. CRM, FIDELIZACIÓN, TARJETAS PREPAGO Y RESERVAS

### 9.1 Ficha de Cliente y Monedero Virtual
Soporte para clientes corporativos e individuales con límite de crédito autorizado, saldo prepago en monedero virtual y emisión de facturas recapitulativas a fin de mes.

---

## 10. NORMATIVA FISCAL: VERIFACTU Y TICKETBAI

### 10.1 Especificación TÉCNICA VeriFactu (AEAT España)
* **Algoritmo de Hashing**: SHA-256 codificado en mayúsculas hexadecimal.
* **Encadenamiento**:
$$\text{Hash}_N = \text{SHA256}(\text{ID\_Emisor} + \text{NumFactura}_N + \text{Fecha}_N + \text{TipoFactura} + \text{ImporteTotal} + \text{Hash}_{N-1})$$
* **Código QR AEAT**: URL oficial de la Sede Electrónica de la Agencia Tributaria codificada con parámetros de validación obligatorios.

---

## 11. HARDWARE, IMPRESIÓN ESC/POS Y DISPOSITIVOS

### 11.1 Módulo `PrinterService` (ESC/POS Nativo)
El driver interno genera comandos ESC/POS binarios directos para térmicas de 80mm:
* `0x1B 0x40`: Inicialización de impresora.
* `0x1B 0x61 0x01`: Alineación centrada para encabezado.
* `0x1D 0x56 0x42 0x00`: Comando de corte de papel automático.

---

## 12. MÓDULO DE INTELIGENCIA ARTIFICIAL (GEMINI ENTERPRISE)

### 12.1 Integración Asistida Server-Side
El backend incluye proxy hacia la API de Gemini mediante `@google/genai` (utilizando la clave de entorno de servidor `GEMINI_API_KEY`) para realizar:
1. Predictivo de ocupación de salones por condiciones meteorológicas y día festivo.
2. Análisis de Menú Engineering recomendando aumento/reducción de precios en función del margen contribution margin.

---

## 13. SEGURIDAD, MATRIZ DE PERMISOS Y OWASP

### 13.1 Control de Accesos Basado en Roles (RBAC)
* **ADMIN**: Acceso total a configuración, finanzas y parametrización.
* **MANAGER**: Cierres de caja, anulaciones, gestión de stock y modificación de precios.
* **WAITER**: Apertura de comandas, envío a cocina y cobro básico.
* **KITCHEN**: Visualización exclusiva del panel KDS.

---

## 14. INTEGRACIÓN ELECTRON Y DESPLIEGUE DOCKER

### 14.1 Docker Environment Multi-Contenedor
El archivo `docker-compose.yml` orquesta la pila productiva Enterprise:
* **App (Node.js/Express)**: Servicio web y servidor API REST/WS.
* **PostgreSQL 16**: Base de datos relacional persistente con volumen `pgdata`.
* **Redis 7.0**: Servidor de caché y pub/sub de eventos en tiempo real.

---

## 15. ESPECIFICACIÓN COMPLETA DE APIS REST & WEBSOCKETS

### 15.1 Tabla de Endpoints API Principales

| Método | Endpoint | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Autenticación de usuario con PIN o Email | Pública |
| `GET` | `/api/v1/tables` | Obtiene el plano de mesas y estados | JWT Bearer |
| `POST` | `/api/v1/orders` | Crea o actualiza una comanda activa | JWT Bearer |
| `POST` | `/api/v1/cash/close` | Ejecuta el Cierre de Caja Z | JWT (Manager+) |
| `POST` | `/api/v1/printer/ticket` | Genera flujo binario ESC/POS para impresión | JWT Bearer |
| `POST` | `/api/v1/sync` | Procesa el lote de registros offline | JWT Bearer |
| `GET` | `/api/v1/delivery/orders` | Obtiene los pedidos omnicanal y delivery | JWT Bearer |
| `POST` | `/api/v1/delivery/orders` | Crea un pedido delivery o webhook | JWT Bearer |
| `PATCH` | `/api/v1/delivery/orders/:id/status` | Actualiza estado de pedido con auditoría | JWT Bearer |
| `POST` | `/api/v1/delivery/drivers/assign` | Asigna repartidor a pedido | JWT Bearer |
| `POST` | `/api/v1/delivery/routes/optimize` | Optimiza ruta con waypoints via Gemini IA | JWT Bearer |
| `POST` | `/api/v1/delivery/webhook/:connectorId` | Receptor de webhooks Deliverect / Glovo / Uber | API Key |
| `GET` | `/api/hr/employees` | Lista completa de empleados con contratos y datos | JWT (RRHH/Admin) |
| `POST` | `/api/hr/employees` | Alta de nuevo empleado con asignación de PIN y rol | JWT (RRHH/Admin) |
| `POST` | `/api/hr/timelogs` | Registro de fichaje de jornada (RD 8/2019) | Público/PIN |
| `GET` | `/api/hr/timelogs/export` | Exportación CSV oficial del Registro Diario de Jornada | JWT (RRHH/Admin) |
| `GET` | `/api/hr/shifts` | Planificador y cuadrante de turnos por departamento | JWT Bearer |
| `POST` | `/api/hr/vacations` | Solicitud y tramitación de vacaciones/ausencias | JWT Bearer |
| `POST` | `/api/hr/payrolls/generate` | Generación de borrador de pre-nómina y cálculo IRPF | JWT (RRHH/Admin) |
| `POST` | `/api/hr/ai/analyze` | Diagnóstico de RRHH, rotación y sobrecarga vía Gemini IA | JWT (RRHH/Admin) |
| `GET` | `/api/finance/accounts` | Obtiene el Plan General Contable (PGC) y saldos | JWT (Finanzas) |
| `POST` | `/api/finance/journal-entries` | Registra asiento contable en libro diario con validación | JWT (Finanzas) |
| `GET` | `/api/finance/treasury/cashflow` | Proyección de flujo de caja y saldo de tesorería | JWT (Finanzas) |
| `POST` | `/api/finance/treasury/reconcile` | Conciliación bancaria de extractos y cobros | JWT (Finanzas) |
| `POST` | `/api/finance/invoices/facturae` | Generación de XML Facturae 3.2.2 con firma XAdES | JWT (Finanzas) |
| `GET` | `/api/multicompany/companies` | Lista empresas del grupo corporativo multi-tenant | JWT Bearer |
| `POST` | `/api/multicompany/companies` | Alta de nueva empresa con configuración fiscal | JWT (SuperAdmin) |
| `GET` | `/api/multicompany/venues` | Lista sedes (Restaurantes, Hoteles, Dark Kitchens) | JWT Bearer |
| `GET` | `/api/multicompany/corporate-kpis` | Métricas y KPIs consolidados multiempresa | JWT (CorpManager) |
| `GET` | `/api/multicompany/ai-diagnosis` | Diagnóstico Gemini IA multiempresa y ahorros | JWT (CorpManager) |
| `POST` | `/api/multicompany/switch-scope` | Cambio dinámico de contexto de empresa y sede | JWT Bearer |
| `POST` | `/api/mobile/auth/login` | Login con JWT para aplicaciones móviles y comanderos | Público |
| `POST` | `/api/mobile/notifications` | Envío de notificaciones push móviles multicanal | JWT Bearer |
| `GET` | `/api/mobile/delivery/tasks` | Tareas de reparto con seguimiento GPS y firmas digitales | JWT Bearer |
| `GET` | `/api/mobile/executive/kpis` | Métricas BI y diagnósticos Gemini 3.6 Flash para gerencia | JWT (Executive) |
| `GET` | `/api/mobile/search` | Buscador global omnicanal para dispositivos móviles | JWT Bearer |

---

## 16. RENDIMIENTO, BENCHMARKS Y MÉTRICAS DE CALIDAD

### 16.1 Tiempos de Respuesta Promedio
* **Pulsación Táctil a Respuesta UI**: $< 16 \text{ ms}$ (60 FPS garantizados).
* **Generación de Ticket ESC/POS**: $< 30 \text{ ms}$.
* **Firma y Hashing VeriFactu**: $< 5 \text{ ms}$.
* **Búsqueda en Catálogo (10,000 SKUs)**: $< 12 \text{ ms}$.

---
*Especificación elaborada por la Oficina de Arquitectura de Software de Sotium POS Enterprise.*
