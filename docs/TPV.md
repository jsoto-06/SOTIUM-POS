# Especificación del Punto de Venta (TPV) - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Módulo TPV](#1-visión-general)
2. [Editor y Gestión de Planos de Sala (FloorPlan)](#2-editor-y-gestión-de-planos)
3. [Operativa de Venta Táctil y Comandas](#3-operativa-de-venta-táctil)
4. [Gestión de Tarifas, Descuentos y Modificadores](#4-gestión-de-tarifas)
5. [Cobro Multi-Tarjeta, Fraccionado y Cierre de Caja (Z/X)](#5-cobro-multi-tarjeta)
6. [Integración con Impresoras Térmicas ESC/POS](#6-integración-con-impresoras)

---

## 1. Visión General

El módulo **TPV (Terminal Punto de Venta)** (`src/components/TPVModule.tsx` y `src/components/floorplan/FloorPlanModule.tsx`) constituye el núcleo operativo de venta directa de Sotium POS Enterprise.

Diseñado para soportar pantallas táctiles de alta resolución desde 10" hasta 24", permite realizar operaciones de cobro y comandas con la máxima velocidad del mercado.

---

## 2. Editor y Gestión de Planos de Sala

El editor interactivo de planos permite diseñar la distribución exacta del establecimiento por zonas o salones (Comedor Principal, Terraza, Barra, VIP, Eventos):

* **Formas de Mesa Customizables:** Redondas, cuadradas, rectangulares, barras.
* **Código de Color por Estado:**
  * ⚪ **Libre:** Disponible para asignación.
  * 🔵 **Ocupada:** Con cuenta activa en consumo.
  * 🟡 **Comanda Pedida:** Esperando platos de cocina.
  * 🟢 **Postres / Cuenta Pedida:** Lista para cobro.
  * 🔴 **Bloqueada / Reservada:** Ocupación confirmada.

---

## 3. Operativa de Venta Táctil y Comandas

* **Asignación de Comensales:** Registro opcional del número de cubiertos para cálculo de ticket medio.
* **Pases de Cocina:** Botones de acción "Marcha 1º", "Marcha 2º" y "Marcha Postre".
* **Comentarios Libre/Predeterminados:** Indicaciones como "Sin sal", "Muy hecho", "Salsa aparte".

---

## 4. Gestión de Tarifas, Descuentos y Modificadores

* **Tarifas Dinámicas por Zona:** Aplicación automática de recargo en terraza (+10%) o precios especiales de Happy Hour.
* **Control de Descuentos Permisivos:** Permiso específico de rol requerido para aplicar descuentos en porcentaje o importe fijo.

---

## 5. Cobro y Arqueos de Caja (Z/X)

* **Cobro Fraccionado:** División en partes iguales entre comensales o pago por artículo seleccionado.
* **Arqueo X (Informe Ciego):** Resumen parcial de caja sin revelar el total teórico al cajero.
* **Arqueo Z (Cierre Definitivo):** Cierre formal de turno/día con cuadre de efectivo, tarjetas, desglose de IVA y transmisión fiscal.

---

## 6. Impresión ESC/POS

El servicio `PrinterRoutes` genera el código de control térmico ESC/POS para la apertura del cajón portamonedas y el corte automático del papel.
