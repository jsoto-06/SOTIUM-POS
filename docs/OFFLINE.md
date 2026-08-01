# Especificación del Motor Offline y Sincronización - Sotium POS Enterprise

---

## 📌 Índice
1. [Filosofía Offline-First](#1-filosofía-offline-first)
2. [Arquitectura del Motor SQLite (`better-sqlite3`)](#2-arquitectura-del-motor-sqlite)
3. [Estructura de la Tabla de Sincronización (`SyncRecord`)](#3-estructura-de-la-tabla-de-sincronización)
4. [Flujo de Transacción Local y Confirmación Fast-Path](#4-flujo-de-transacción-local)
5. [Estrategias de Sincronización Asíncrona](#5-estrategias-de-sincronización-asíncrona)
6. [Resolución de Conflictos de Datos](#6-resolución-de-conflictos-de-datos)
7. [Manejo de Desconexiones y Reconexión Automática](#7-manejo-de-desconexiones)

---

## 1. Filosofía Offline-First

En el sector hostelero, perder la capacidad de cobrar a un cliente o enviar una comanda a cocina durante un pico de trabajo debido a la caída de la conexión a Internet o del servidor en la nube resulta inaceptable.

**Sotium POS Enterprise** garantiza la **continuidad operativa total** almacenando el 100% de las operaciones de punto de venta directamente en una base de datos local SQLite administrada por la clase `SQLiteSyncEngine` (`src/db/sqlite-sync-engine.ts`).

---

## 2. Arquitectura del Motor SQLite

El motor utiliza la biblioteca nativa C++ `better-sqlite3`, ofreciendo lecturas y escrituras sincrónicas en disco en menos de 2 milisegundos.

```text
+-----------------------------------------------------------------------+
|                       FRONTEND (REACT POSContext)                     |
+-----------------------------------------------------------------------+
                                    |
                    Escribir Operación Venta / Mesa
                                    v
+-----------------------------------------------------------------------+
|                    MOTOR DE SINCRONIZACIÓN SQLITE                     |
|                   (src/db/sqlite-sync-engine.ts)                      |
|                                                                       |
|  1. Persistir Registro en SQLite Local                                |
|  2. Encolar en Tabla `SyncRecord`                                      |
|  3. Notificar a UI (Respuesta Instantánea)                            |
+-----------------------------------------------------------------------+
                                    |
                            Daemon Background
                                    v
+-----------------------------------------------------------------------+
|                  SERVIDOR CENTRAL POSTGRESQL (CLOUD)                  |
+-----------------------------------------------------------------------+
```

---

## 3. Estructura de la Tabla de Sincronización (`SyncRecord`)

Cualquier mutación efectuada en estado offline o local genera un registro inmutable de sincronización:

```prisma
model SyncRecord {
  id            String    @id @default(uuid())
  entityName    String    // 'Order', 'OrderItem', 'CashClosing', 'Customer'
  entityId      String    // UUID de la entidad
  action        String    // 'INSERT', 'UPDATE', 'DELETE'
  payloadJson   String    // JSON serializado de la entidad
  sqliteVersion Int       @default(1)
  synced        Boolean   @default(false)
  syncedAt      DateTime?
  createdAt     DateTime  @default(now())

  @@index([synced])
}
```

---

## 4. Flujo de Transacción Local y Confirmación Fast-Path

1. **Recepción del Cobro:** El usuario presiona "Cobrar Ticket #1002" en el TPV.
2. **Escritura SQLite:** `SQLiteSyncEngine.saveOrder(order)` ejecuta la transacción en SQLite local.
3. **Generación del SyncRecord:** Se inserta el registro en la cola con `synced: false`.
4. **Respuesta UI:** La interfaz emite el tique de caja e imprime la comanda sin esperar la respuesta del servidor en la nube.

---

## 5. Estrategias de Sincronización Asíncrona

El servicio de sincronización `SyncService` (`src/services/syncService.ts`) ejecuta un bucle de fondo cada 10 segundos:

```typescript
export class SyncService {
  public static async processPendingSyncs(): Promise<{ syncedCount: number; errors: any[] }> {
    const pendingRecords = SQLiteSyncEngine.getPendingSyncRecords();
    
    for (const record of pendingRecords) {
      try {
        await PrismaClient[record.entityName].upsert({ ... });
        SQLiteSyncEngine.markAsSynced(record.id);
      } catch (err) {
        // Log & Retentativa con Backoff
      }
    }
  }
}
```

---

## 6. Resolución de Conflictos de Datos

Para evitar inconsistencias en entornos multi-terminal:

* **Primary Authority for Orders:** El terminal que abre la mesa o emite el tique es la autoridad primaria.
* **Timestamp LWW (Last-Write-Wins):** Para actualizaciones de perfil de clientes o productos, prevalece la modificación con timestamp de reloj vectorial más reciente.
* **Secuencia Estricta de Cierres de Caja:** Los arqueos de caja (`CashClosing`) son inmutables y de adición exclusiva (Append-Only).

---

## 7. Manejo de Desconexiones y Reconexión Automática

El frontend escucha los eventos de red `window.addEventListener('online')` y `window.addEventListener('offline')`:
* Al perder conexión, el indicador visual en el encabezado cambia a **Modo Offline (SQLite Activo)**.
* Al recuperar conectividad, se dispara de inmediato `SyncService.processPendingSyncs()`.
