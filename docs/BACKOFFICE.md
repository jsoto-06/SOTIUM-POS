# Especificación de Backoffice Multi-Compañía - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General del Backoffice Centralizado](#1-visión-general)
2. [Gestión Multi-Empresa, Cadenas y Franquicias](#2-gestión-multi-empresa)
3. [Administración Central de Cartas, Precios y Escandallos](#3-administración-central)
4. [Consolidación Financiera y Ventas de Grupo](#4-consolidación-financiera)
5. [Gestión de Roles, Permisos RBAC y Accesos](#5-gestión-de-roles)

---

## 1. Visión General

El módulo de **Backoffice Multi-Compañía** (`src/components/multicompany/MultiCompanyModule.tsx` y `src/server/routes/multiCompanyRoutes.ts`) está diseñado para propietarios, administradores y franquiciadores que gestionan múltiples establecimientos o marcas comerciales desde un único panel central.

---

## 2. Gestión Multi-Empresa y Sedes

Permite estructurar la jerarquía corporativa en tres niveles:
1. **Holding / Grupo Corporativo**
2. **Empresas / Razones Sociales (NIFs)**
3. **Centros de Trabajo / Restaurantes Físicos (Branches)**

---

## 3. Administración Central de Cartas

Permite publicar una carta máster de productos a nivel de grupo y aplicar variaciones de precio o disponibilidad según la zona geográfica de cada restaurante (ej: precios especiales en centro ciudad vs aeropuerto).

---

## 4. Consolidación Financiera

Permite analizar en una sola pantalla la cifra de ventas agregada de todo el grupo empresarial en tiempo real, comparar el rendimiento entre locales e identificar el centro de mayor rentabilidad.
