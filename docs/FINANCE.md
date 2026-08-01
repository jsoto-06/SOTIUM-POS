# Especificación de Finanzas y Contabilidad - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Módulo Financiero](#1-visión-general)
2. [Gestión de Tesorería, Cajas y Arqueos](#2-gestión-de-tesorería)
3. [Facturación Oficial y Modelo Facturae (XML)](#3-facturación-oficial)
4. [Integración con el Plan General Contable (PGC)](#4-integración-con-el-pgc)
5. [Gestión de Impuestos (Desglose IVA / IGIC)](#5-gestión-de-impuestos)
6. [Conciliación Bancaria y Control de Cobros](#6-conciliación-bancaria)

---

## 1. Visión General

El módulo de **Finanzas y Contabilidad** (`src/components/finance/FinanceModule.tsx`) proporciona una visión completa de la salud económica del negocio, permitiendo la gestión centralizada de facturación emitida/recibida, arqueos de caja, impuestos y apuntes contables.

---

## 2. Gestión de Tesorería y Arqueos

* **Cierres de Caja Múltiples:** Gestión de caja principal, cajas secundarias por TPV, cambio inicial y entradas/salidas de efectivo registradas con motivo justificado.
* **Arqueo Ciego:** Previene el fraude obligando al empleado a contar el efectivo físico sin conocer el total calculado por el sistema.

---

## 3. Facturación Oficial e Intercambio Facturae

Genera facturas completas nominativas a partir de tiques simplificados de venta, permitiendo la exportación al formato oficial **Facturae (XML v3.2.2)** requerido por Administraciones Públicas en España (`src/server/routes/facturaeRoutes.ts`).

---

## 4. Integración con el Plan General Contable (PGC)

Genera automáticamente los asientos contables del libro diario en base a las ventas diarias y facturas de compras recibidas:
* **Subcuenta 700.x:** Ventas de Mercaderías / Restauración.
* **Subcuenta 477.x:** Hacienda Pública IVA Repercutido (10%, 21%, 4%).
* **Subcuenta 570.x:** Caja, euros.
* **Subcuenta 572.x:** Bancos e instituciones de crédito.

---

## 5. Gestión de Impuestos

Genera los borradores de liquidación trimestral y resumen anual para la AEAT:
* **Modelo 303:** Autoliquidación del Impuesto sobre el Valor Añadido (IVA).
* **Modelo 347:** Declaración anual de operaciones con terceras personas (> 3.005,06 €).
