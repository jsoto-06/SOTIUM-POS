# Especificación de Cumplimiento Fiscal TicketBAI - Sotium POS Enterprise

---

## 📌 Índice
1. [Marco Regulatorio de TicketBAI (País Vasco)](#1-marco-regulatorio)
2. [Estructura del Fichero XML TicketBAI](#2-estructura-del-fichero-xml)
3. [Firma Electrónica Software / Hardware](#3-firma-electrónica)
4. [Identificador TBAI y Generación de Código QR](#4-identificador-tbai)
5. [Servicio de Integración (`TicketbaiService`)](#5-servicio-de-integración)
6. [Respuesta y Reintentos de Envío con Haciendas Forales](#6-respuesta-y-reintentos)

---

## 1. Marco Regulatorio de TicketBAI

**TicketBAI** es un proyecto conjunto de las Haciendas Forales Vascas (Diputación Foral de Gipuzkoa, Bizkaia y Álava) y el Gobierno Vasco para el control de ingresos de las actividades económicas.

**Sotium POS Enterprise** incluye un motor nativo `TicketbaiService` (`src/services/ticketbaiService.ts`) que genera, firma e integra las facturas con las tres haciendas forales.

---

## 2. Estructura del Fichero XML TicketBAI

Cada transacción de venta genera un fichero XML estructurado acorde al esquema XSD oficial de TicketBAI:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<TicketBAI xmlns="urn:ticketbai:emision">
  <Cabecera>
    <IDTicketBAI>TBAI-B12345678-010826-00000104-92A3</IDTicketBAI>
  </Cabecera>
  <SujetoEmisor>
    <NIF>B12345678</NIF>
    <ApellidosNombreRazonSocial>RESTAURANTE SOTIUM ENTERPRISE S.L.</ApellidosNombreRazonSocial>
  </SujetoEmisor>
  <Factura>
    <NumeroFactura>F2026-00104</NumeroFactura>
    <FechaExpedicion>01-08-2026</FechaExpedicion>
    <HoraExpedicion>12:30:00</HoraExpedicion>
    <ImporteTotalFactura>45.50</ImporteTotalFactura>
  </Factura>
</TicketBAI>
```

---

## 3. Firma Electrónica

El fichero XML es firmado electrónicamente utilizando un certificado digital de sello de empresa autorizado (`.p12` / `.pfx`) cargado en el servidor mediante el estándar XAdES-BES.

---

## 4. Identificador TBAI y Código QR

El identificador TBAI consta de:
`TBAI-[NIF_EMISOR]-[FECHA_DDMMYY]-[SERIE_NUMERO]-[CRC8]`

En el pie de cada tique impreso se genera el código QR con las dimensiones oficiales (30x30 mm) conteniendo el enlace de verificación de la hacienda foral correspondiente.

---

## 5. Servicio de Integración (`TicketbaiService`)

```typescript
export class TicketbaiService {
  public static async generateTicketbaiFile(orderId: string): Promise<TicketbaiRecord> {
    const order = await PrismaClient.order.findUnique({ where: { id: orderId } });
    const xmlContent = this.buildXml(order);
    const signedXml = await this.signXmlWithXades(xmlContent);
    const qrUrl = this.generateQrUrl(order);

    return await PrismaClient.ticketbaiRecord.create({
      data: {
        orderId,
        invoiceNumber: order.orderNumber,
        signedXml,
        tbaiCode: this.calculateTbaiCode(order),
        qrCodeUrl: qrUrl,
        status: 'ACCEPTED_ACCEPTED_200'
      }
    });
  }
}
```
