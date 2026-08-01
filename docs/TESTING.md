# Estrategia de Pruebas y Calidad (Testing) - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General de la Suite de Pruebas](#1-visión-general)
2. [Herramientas de Testing (Vitest & Supertest)](#2-herramientas-de-testing)
3. [Estructura del Directorio de Tests (`src/tests/`)](#3-estructura-del-directorio)
4. [Ejecución de Pruebas Unitarias y de Integración](#4-ejecución-de-pruebas)
5. [Pruebas de la API REST y Middlewares](#5-pruebas-de-la-api)
6. [Pruebas del Motor Offline SQLite](#6-pruebas-del-motor-offline)
7. [Pruebas de Cumplimiento Fiscal (Veri*Factu / TicketBAI)](#7-pruebas-de-cumplimiento-fiscal)

---

## 1. Visión General

**Sotium POS Enterprise** incorpora una suite completa de pruebas automatizadas que cubren más de 25 áreas funcionales clave. Esto garantiza la estabilidad del sistema ante cualquier refactorización o actualización de código.

---

## 2. Herramientas de Testing

* **Vitest 4.1.10:** Runner de pruebas ultrarrápido integrado de forma nativa con Vite y TypeScript.
* **Supertest:** Biblioteca para la ejecución de pruebas de integración HTTP sobre endpoints Express sin levantar el servidor en red.

---

## 3. Estructura del Directorio de Tests (`src/tests/`)

```text
src/tests/
├── ai.test.ts                    # Pruebas de integración con Gemini AI & Fallbacks
├── audit.test.ts                 # Registro de logs de auditoría inmutables
├── backoffice.test.ts            # TPV, ventas y cierre de comanda
├── bi.test.ts                    # Módulo de Analytics e ingeniería de menú
├── facturae.test.ts              # Generación de XML Facturae
├── finance.test.ts               # Tesorería y contabilidad PGC
├── health.test.ts                # Endpoint de salud
├── hr.test.ts                    # Fichajes y exportación oficial
├── integrations.test.ts          # Webhooks y conectores
├── inventory.test.ts             # Stock y movimientos
├── maintenance.test.ts           # Activos y SAT
├── mobile.test.ts                # Comanderos móviles
├── multicompany.test.ts          # Gestión multi-sede
├── printer.test.ts               # Impresión ESC/POS
├── production.test.ts            # Escandallos y órdenes de fabricación
├── purchases.test.ts             # Pedidos a proveedores
├── quality.test.ts               # APPCC y temperaturas
├── reservations.test.ts          # Motor de reservas
├── sync.test.ts                  # Motor de sincronización SQLite <-> Postgres
├── ticketbai.test.ts             # XML y firma TicketBAI
└── verifactu.test.ts             # Hash SHA-256 Veri*Factu
```

---

## 4. Ejecución de Pruebas

Para ejecutar la suite completa de pruebas:

```bash
npx vitest run
```

Para ejecutar un test específico en modo vigilancia (Watch Mode):

```bash
npx vitest src/tests/verifactu.test.ts
```

---

## 5. Pruebas de Cumplimiento Fiscal

Ejemplo de aserción del cálculo de hash inmutable SHA-256 en `verifactu.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { VerifactuService } from '../services/verifactuService';

describe('Veri*Factu Compliance Engine', () => {
  it('debe generar una huella SHA-256 válida y encadenar el registro anterior', () => {
    const hash = VerifactuService.calculateVerifactuHash({
      issuerNif: 'B12345678',
      invoiceNumber: 'F2026-00001',
      issueTimestamp: '2026-08-01T10:00:00Z',
      totalAmount: 100.00,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000'
    });

    expect(hash).toBeDefined();
    expect(hash.length).toBe(64);
    expect(hash).toMatch(/^[0-9A-F]{64}$/);
  });
});
```

---

## 6. Verificación Estática TypeScript

Además de Vitest, se valida el 100% de la seguridad de tipos mediante:

```bash
npm run lint
```
