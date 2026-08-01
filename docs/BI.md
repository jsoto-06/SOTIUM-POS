# Especificación de Business Intelligence y Analytics - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General de Analytics & BI](#1-visión-general)
2. [Indicadores Clave de Rendimiento (KPIs Hosteleros)](#2-indicadores-clave)
3. [Informes de Ventas, Ticket Medio y Rotación](#3-informes-de-ventas)
4. [Ingeniería de Menú (Matriz Boston Consulting Group)](#4-ingeniería-de-menú)
5. [Visualizaciones Interactivas (Recharts)](#5-visualizaciones-interactivas)
6. [Analítica Predictiva con IA Gemini](#6-analítica-predictiva)

---

## 1. Visión General

El módulo de **Business Intelligence (BI)** (`src/components/bi/ReportsDashboard.tsx` y `src/server/routes/biRoutes.ts`) transforma la masa de datos transaccionales de las ventas en un cuadro de mando ejecutivo para la toma de decisiones basada en evidencia.

---

## 2. Indicadores Clave de Rendimiento (KPIs Hosteleros)

* **RevPASH (Revenue Per Available Seat Hour):** Ingresos por asiento disponible por hora.
* **Ticket Medio por Comensal:** `Ventas Totales / Número de Cubiertos Servidos`.
* **Coste Primo (Prime Cost):** `Coste de Materia Prima (COGS) + Coste de Personal (Labor Cost)`. *(Objetivo Enterprise < 60%)*.
* **Índice de Popularidad y Rentabilidad:** Evaluación de cada plato de la carta.

---

## 3. Ingeniería de Menú (Matriz BCG de Hostelería)

Clasifica automáticamente todos los productos de la carta en cuatro cuadrantes según su volumen de ventas y margen de contribución:

| Cuadrante | Descripción | Acción Estratégica |
| :--- | :--- | :--- |
| ⭐ **Estrellas (Stars)** | Alta Popularidad, Alto Margen | Mantener receta y ubicar en zona destacada de la carta. |
| 🐴 **Caballos de Batalla (Plowhorses)** | Alta Popularidad, Bajo Margen | Reducir tamaño de ración o ajustar precio sin perder volumen. |
| 🧩 **Puzles (Puzzles)** | Baja Popularidad, Alto Margen | Promocionar mediante sugerencias de camarero o fotos atractivas. |
| 🐶 **Perros (Dogs)** | Baja Popularidad, Bajo Margen | Eliminar del menú o sustituir por nuevo plato. |

---

## 4. Visualizaciones con Recharts

Utiliza la biblioteca Recharts para mostrar gráficos de área de ventas por hora, diagramas de barras comparativos interanuales y gráficos circulares de reparto por método de pago.
