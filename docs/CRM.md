# Especificación de CRM y Motor de Reservas - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Módulo CRM & Reservas](#1-visión-general)
2. [Gestión de Fichas de Clientes y Hábitos de Consumo](#2-gestión-de-fichas)
3. [Motor de Reservas y Ocupación en Tiempo Real](#3-motor-de-reservas)
4. [Algoritmo Predictivo de No-Show (IA Gemini)](#4-algoritmo-predictivo-de-no-show)
5. [Programas de Fidelización, Puntos y Tarjetas VIP](#5-programas-de-fidelización)
6. [Lista de Espera Dinámica (Waitlist)](#6-lista-de-espera-dinámica)

---

## 1. Visión General

El módulo de **CRM y Reservas** (`src/components/reservations/ReservationsModule.tsx`) centraliza las interacciones con los clientes del restaurante, permitiendo maximizar la ocupación de mesas, personalizar la atención y reducir drásticamente las mesas vacías por incomparecencia (No-Show).

---

## 2. Fichas de Clientes y Hábitos

Cada cliente posee un perfil unificado que registra:
* Historial completo de visitas, ticket medio gastado y facturación acumulada.
* **Alergias e Intolerancias:** Aviso destacado automático al abrir la comanda (ej: "Celíaco - Intolerante al gluten").
* **Preferencias:** Mesa preferida (ej: "Junto al ventanal"), vino favorito, cumpleaños.

---

## 3. Motor de Reservas

Permite la asignación automática de mesas en función del número de comensales y el turno (Comida / Cena), evitando solapamientos y optimizando la rotación del salón.

---

## 4. Algoritmo Predictivo de No-Show (IA Gemini)

El modelo de IA evalúa cada reserva asignándole una probabilidad de incomparecencia basada en:
1. Historial de asistencias/cancelaciones previas del cliente.
2. Anticipación con la que se realizó la reserva.
3. Tamaño del grupo y día/hora de la reserva.

Si el riesgo es elevado (> 60%), el sistema recomienda solicitar una fianza previa con tarjeta bancaria o enviar una confirmación vía SMS/WhatsApp.

---

## 5. Programas de Fidelización y Tarjetas VIP

Asignación de saldo acumulable, descuentos por nivel (Gold, Platinum) y recarga de saldo de prepago en tarjetas de cliente.
