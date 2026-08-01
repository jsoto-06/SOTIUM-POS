# Especificación de Cumplimiento Fiscal Veri*Factu (AEAT) - Sotium POS Enterprise

---

## 📌 Índice
1. [Marco Normativo y Regulaciones de la AEAT](#1-marco-normativo)
2. [Requisitos Técnicos del Reglamento de Sistemas Informáticos de Facturación (SIF)](#2-requisitos-técnicos)
3. [Encadenamiento Criptográfico de Facturas/Tiques (SHA-256)](#3-encadenamiento-criptográfico)
4. [Estructura del Registro de Facturación (`VerifactuRecord`)](#4-estructura-del-registro)
5. [Generación de Código QR e Identificador Único](#5-generación-de-código-qr)
6. [Registro Inmutable de Eventos de Auditoría de Impresión y Anulación](#6-registro-inmutable)
7. [Integración con las Rutas Express (`/api/verifactu`)](#7-integración-con-las-rutas-express)

---

## 1. Marco Normativo y Regulaciones de la AEAT

**Sotium POS Enterprise** cumple estrictamente con el **Real Decreto 1007/2023** y la Ley 11/2021 de medidas de prevención y lucha contra el fraude fiscal en España.

El módulo Veri*Factu garantiza que el software de punto de venta no permite la omisión, alteración o borrado de transacciones de venta, asegurando los principios de **Integridad, Conservación, Accesibilidad, Legibilidad, Trazabilidad e Inalterabilidad**.

---

## 2. Requisitos Técnicos del SIF

* **Firma de Registros:** Cálculo de huella digital o Hash de cada tique emitido.
* **Encadenamiento Secuencial:** Cada registro incluye la huella del registro inmediatamente anterior.
* **Inmutabilidad:** Imposibilidad de alterar, editar o eliminar tiques cerrados.
* **Generación de Código QR Regulado:** Inclusión en la impresión del tique en papel y PDF del código QR normativo para verificación del ciudadano en la sede electrónica de la AEAT.

---

## 3. Encadenamiento Criptográfico (SHA-256)

La función de encadenamiento calcula el hash del tique actual combinando los datos críticos del emisor, importe, fecha y la huella del tique previo:

```typescript
// Algoritmo de Hashing Veri*Factu en VerifactuService
public calculateVerifactuHash(params: {
  issuerNif: string;
  invoiceNumber: string;
  issueTimestamp: string;
  totalAmount: number;
  previousHash: string;
}): string {
  const payload = [
    params.issuerNif,
    params.invoiceNumber,
    params.issueTimestamp,
    params.totalAmount.toFixed(2),
    params.previousHash || '0000000000000000000000000000000000000000000000000000000000000000'
  ].join('|');

  return crypto.createHash('sha256').update(payload).digest('hex').toUpperCase();
}
```

---

## 4. Estructura del Registro de Facturación (`VerifactuRecord`)

```prisma
model VerifactuRecord {
  id             String   @id @default(uuid())
  orderId        String   @unique
  order          Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  invoiceNumber  String   @unique
  issueTimestamp DateTime
  issuerNif      String
  issuerName     String
  subtotal       Float
  vatAmount      Float
  total          Float
  previousHash   String
  currentHash    String
  signatureRsa   String
  qrCodeUrl      String
  aeatResponse   String   @default("SENT_OK_200")
  createdAt      DateTime @default(now())
}
```

---

## 5. Generación de Código QR e Identificador Único

El tique impreso al cliente incluye la URL oficial de verificación AEAT:

```text
https://www1.agenciatributaria.gob.es/wlpl/invo-fact/qr?nif=B12345678&num=F2026-00104&fec=01-08-2026&imp=45.50&hash=8F3A2B...
```

---

## 6. Registro Inmutable de Eventos

Cualquier rectificación, abono o anulación genera una nueva factura rectificativa con su propio hash de encadenamiento y se registra en la tabla de auditoría `AuditLog`.
