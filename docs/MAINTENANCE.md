# Especificación de Mantenimiento de Activos y SAT - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Módulo de Mantenimiento](#1-visión-general)
2. [Inventario y Registro de Activos de Equipamiento](#2-inventario-de-activos)
3. [Mantenimiento Preventivo Programado](#3-mantenimiento-preventivo)
4. [Gestión de Partes de Avería y Correctivos (SAT)](#4-gestión-de-partes)
5. [Control de Recambios, Garantías y Proveedores Técnicos](#5-control-de-recambios)
6. [Asistente IA de Diagnóstico Técnico de Maquinaria](#6-asistente-ia-de-diagnóstico)

---

## 1. Visión General

El módulo de **Mantenimiento y Servicio de Asistencia Técnica (SAT)** (`src/components/maintenance/MaintenanceModule.tsx` y `src/server/routes/maintenanceRoutes.ts`) gestiona el ciclo de vida, revisiones y reparaciones de toda la maquinaria y activos del establecimiento (Hornos inteligentes, lavavajillas industriales, aparatos de aire acondicionado, TPVs e impresoras).

---

## 2. Inventario de Activos

Cada equipo registrado cuenta con:
* Número de serie, fecha de compra y estado de garantía.
* Ficha técnica del fabricante en PDF y manual de usuario.
* Historial de averías y coste total de propiedad (TCO).

---

## 3. Mantenimiento Preventivo

Alertas programadas por fecha o ciclos de uso para tareas críticas:
* Cambio de filtros de agua y descalcificador.
* Desinfección y limpieza de condensadores de máquinas de hielo.
* Revisión anual de extintores e instalación de gas.

---

## 4. Partes de Avería y SAT Correctivo

Creación instantánea de partes de incidencia técnica asignados al proveedor SAT correspondiente con seguimiento del tiempo medio de reparación (MTTR).
