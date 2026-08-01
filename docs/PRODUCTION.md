# Especificación de Producción, Recetas y Escandallos - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Módulo de Producción](#1-visión-general)
2. [Gestión de Fichas Técnicas y Escandallos Multinivel](#2-gestión-de-fichas-técnicas)
3. [Órdenes de Fabricación e Ingredientes Semielaborados](#3-órdenes-de-fabricación)
4. [Control de Mermas y Rendimiento de Materia Prima](#4-control-de-mermas)
5. [Gestión de Lotes y Trazabilidad Alimentaria](#5-gestión-de-lotes)
6. [Cálculo de Costes Teóricos vs Reales](#6-cálculo-de-costes)

---

## 1. Visión General

El módulo de **Producción, Escandallos y Recetas** (`src/components/production/ProductionModule.tsx`) gestiona la transformación de materia prima en elaboraciones culinarias y platos terminados.

Es indispensable para obrador central, cocinas ensambladoras y restaurantes de alta gastronomía que requieren control absoluto sobre el escandallo y la rentabilidad del menú.

---

## 2. Escandallos Multinivel

Sotium POS permite definir recetas compuestas por ingredientes base e ingredientes **semielaborados** (ej: Salsa Boloñesa utilitzada posteriormente en Lasaña y Cannelloni):

```text
Plato: Lasaña de Ternera (PVP: 14.50€)
├── 0.150 kg - Pasta Lasaña Fresh (Materia Prima)
├── 0.200 kg - Salsa Boloñesa Obradoiro (Semielaborado Receta #04)
│   ├── 0.100 kg - Carne Picada Ternera
│   ├── 0.050 kg - Tomate Triturado
│   └── 0.020 L  - Aceite de Oliva
└── 0.080 kg - Queso Mozzarella Rallado (Materia Prima)
```

---

## 3. Órdenes de Fabricación

Para cocinas centrales u obradores, permite programar órdenes de fabricación diaria:
* Generación de orden de producción de 50 Litros de Salsa de Tomate.
* Descontado automático de stock de los ingredientes crudos.
* Entrada en stock del producto elaborado con nuevo lote y fecha de caducidad.

---

## 4. Control de Mermas y Rendimiento

Permite registrar el factor de mermas en limpio/sucio de ingredientes (ej: un solomillo de ternera de 5 kg produce 4.2 kg de raciones útiles tras la merma de limpieza = 84% rendimiento).

---

## 5. Trazabilidad y Lotes

Garantiza el cumplimiento de la normativa sanitaria europea registrando el número de lote del proveedor en cada orden de preparación y trazando a qué tiques de mesa fue servido dicho lote.
