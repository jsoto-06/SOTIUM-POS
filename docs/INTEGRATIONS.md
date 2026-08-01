# Especificación de Integraciones y Webhooks - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Ecosistema de Integraciones](#1-visión-general)
2. [Conectores Habilitados](#2-conectores-habilitados)
   - [2.1 Agregadores de Delivery (Glovo, Uber Eats, Deliverect)](#21-agregadores-de-delivery)
   - [2.2 Sistemas de Gestión Hotelera (PMS - Opera, Cloudbeds)](#22-sistemas-de-gestión-hotelera)
   - [2.3 Pasarelas de Pago (Adyen, Stripe, Redsys)](#23-pasarelas-de-pago)
3. [Mecanismo de Webhooks de Salida y Entrada](#3-mecanismo-de-webhooks)
4. [Gestión de Errores y Cola Dead-Letter (DLQ)](#4-gestión-de-errores)
5. [Seguridad en Integraciones (Autenticación HMAC)](#5-seguridad)

---

## 1. Visión General

**Sotium POS Enterprise** incluye un motor centralizado de conectividad gestionado por la suite en `src/components/integrations/IntegrationsModule.tsx` y las rutas `/api/integrations`.

Permite que el TPV actúe como el nodo central del restaurante, inyectando pedidos de plataformas de reparto directamente en el KDS de cocina y transfiriendo cobros a habitaciones de hotel.

---

## 2. Conectores Habilitados

### 2.1 Agregadores de Delivery
* **Plataformas:** Glovo, Uber Eats, Just Eat, Deliverect.
* **Flujo:** Las comandas entrantes de delivery se validan automáticamente con el stock disponible, se transforman al formato interno `Order` y se envían a las pantallas KDS correspondientes.

### 2.2 Sistemas de Gestión Hotelera (PMS)
* **Plataformas:** Opera PMS, Cloudbeds, Mews.
* **Flujo:** Permite el cargo directo de consumiciones de restaurante a la cuenta/habitación del huésped mediante consulta de validez en tiempo real.

### 2.3 Pasarelas de Pago
* **Terminales:** Redsys Pinpad, Adyen POS, Stripe Terminal.
* **Flujo:** Comunicación directa IP con el datáfono para enviar el importe exacto de la venta y recibir la autorización bancaria en < 2 segundos.

---

## 3. Mecanismo de Webhooks

Sotium POS emite webhooks eventos en tiempo real hacia sistemas externos configurados:

```json
{
  "event": "ORDER_CLOSED",
  "timestamp": "2026-08-01T12:00:00.000Z",
  "data": {
    "orderId": "ord-9901",
    "total": 52.40,
    "paymentMethod": "CARD",
    "itemsCount": 4
  }
}
```

---

## 4. Cola Dead-Letter (DLQ)

En caso de fallo en la entrega de un webhook a un endpoint externo (HTTP status 5xx o timeout), el mensaje se redirige a la cola Dead-Letter Queue con reintentos automáticos programados con retardo exponencial (1m, 5m, 15m, 1h).

---

## 5. Seguridad en Integraciones

Todas las llamadas entrantes y salientes de webhooks incluyen la cabecera signature:

`X-Sotium-Signature: sha256=a8f9c7...`

Permitiendo al receptor verificar la autenticidad del payload utilizando la clave secreta compartida.
