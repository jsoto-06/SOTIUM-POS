# Especificación de Recursos Humanos y Fichajes - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Módulo de RRHH](#1-visión-general)
2. [Registro Horario Legal y Fichajes (Normativa Española)](#2-registro-horario-legal)
3. [Planificación de Cuadrantes de Turnos](#3-planificación-de-cuadrantes)
4. [Cálculo y Gestión de Nóminas, Bajas y Vacaciones](#4-cálculo-de-nóminas)
5. [Exportación Oficial para Inspección de Trabajo](#5-exportación-oficial)
6. [Asistente de Productividad y Clima Laboral (IA Gemini)](#6-asistente-de-productividad)

---

## 1. Visión General

El módulo de **Recursos Humanos y Fichajes** (`src/components/hr/HRModule.tsx` y `src/server/routes/hrRoutes.ts`) gestiona el capital humano de la empresa, garantizando el cumplimiento de la ley de registro de jornada laboral (Real Decreto-ley 8/2019) y optimizando el coste de personal sobre las ventas.

---

## 2. Registro Horario y Fichajes

* **Métodos de Fichaje:** PIN de empleado en TPV, huella/reconocimiento en comandero móvil o código QR.
* **Trazabilidad Geográfica e IP:** Registro inmutable de la dirección IP local y timestamp del fichaje de entrada, pausa de descanso y salida.
* **Inalterabilidad:** Imposibilidad de modificar registros pasados sin dejar rastro de auditoría con la justificación del encargado.

---

## 3. Planificación de Cuadrantes de Turnos

Editor visual de turnos de trabajo (Turno Mañana, Tarde, Partido, Noche) con control automático de descansos legales obligatorios entre jornadas (mínimo 12 horas) y límite de horas semanales según convenio de hostelería.

---

## 4. Exportación Oficial para Inspección de Trabajo

Generación instantánea con un clic del informe oficial requerido en inspecciones laborales, desglosado por trabajador, días trabajados, horas ordinarias y horas complementarias/extraordinarias realizadas.

---

## 5. Analítica de Coste de Personal (Labor Cost %)

Muestra el ratio `(Coste Total de Personal / Ventas Totales Netas) * 100`, permitiendo mantener el coste de plantilla dentro de los márgenes óptimos de la industria (28% - 32%).
