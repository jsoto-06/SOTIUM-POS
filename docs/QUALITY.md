# Especificación de Calidad, APPCC e Higiene - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Módulo de Calidad & APPCC](#1-visión-general)
2. [Control y Registro de Temperaturas de Cámaras](#2-control-de-temperaturas)
3. [Checklists Digitales de Limpieza y Desinfección](#3-checklists-de-limpieza)
4. [Gestión de Alérgenos (Reglamento UE 1169/2011)](#4-gestión-de-alérgenos)
5. [Auditorías Sanitarias e Inspecciones](#5-auditorías-sanitarias)
6. [Asistente de Incidencias e Higiene con IA Gemini](#6-asistente-de-incidencias)

---

## 1. Visión General

El módulo de **Calidad y APPCC (Análisis de Peligros y Puntos de Control Crítico)** (`src/components/quality/QualityHaccpModule.tsx` y `src/server/routes/qualityHaccpRoutes.ts`) digitaliza la documentación sanitaria obligatoria exigida por las autoridades de sanidad en la Unión Europea.

Sustituye las hojas de papel en cocina por registros digitales inalterables con fecha, hora y firma del responsable.

---

## 2. Control de Temperaturas

Registro diario de lecturas de temperatura para cada equipo frigorífico (Cámaras de Congelación, Cámaras de Mantenimiento, Abatidores, Armarios de Pescado):
* Umbrales normales de congelación (-18ºC a -22ºC) y refrigeración (+1ºC a +5ºC).
* Generación de **Acción Correctora Obligatoria** si la temperatura medida supera el límite de seguridad.

---

## 3. Checklists de Limpieza y Desinfección

Plantillas de tareas de limpieza diarias, semanales y mensuales asignadas por zona (Superficies de Trabajo, Campana Extractora, Filtros, Suelos, Freidoras) con firma digital del empleado.

---

## 4. Gestión de Alérgenos (Reglamento UE 1169/2011)

Identificación de los 14 alérgenos de declaración obligatoria en cada plato de la carta (Gluten, Crustáceos, Huevos, Pescado, Cacahuetes, Soja, Leche/Lácteos, Frutos de cáscara, Apio, Mostaza, Sésamo, Dióxido de azufre/Sulfitos, Altramuces, Moluscos).

Impresión automática de la carta de alérgenos actualizada para el cliente.
