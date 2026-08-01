# Registro de Cambios (Changelog) - Sotium POS Enterprise

Todas las modificaciones notables realizadas en este proyecto serán documentadas en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-enterprise] - 2026-08-01

### 🚀 Añadido
* **Plataforma Core Sotium POS:** Lanzamiento oficial de la arquitectura Enterprise v1.0.0.
* **Rediseño UX/UI Enterprise (Fase 26.8):** Nueva navegación lateral flotante inteligente, barra de búsqueda global omnicanal, pestañas modulares por roles de usuario (Camarero, Cocina, Repartidor, Encargado, Gerente, Admin).
* **Módulo TPV & Plano de Salas:** Editor interactivo de salas, estados de mesa en tiempo real, gestión de comandero táctil y cobros fraccionados.
* **Cocina KDS:** Panel multi-estación por partidas (Cocina, Bar, Horno, Postres) con reproducción de audio para nuevas comandas y estados de tique.
* **Módulo de Reservas & CRM:** Gestión de reservas, cálculo predictivo de probabilidad de No-Show, lista de espera dinámica y ficha de cliente con historial de consumos.
* **Producción, Escandallos & Recetas:** Gestión de recetas elaboradas y semielaboradas, costes teóricos vs reales, cálculo de mermas y órdenes de fabricación.
* **Compras & Gestión de Proveedores:** Reconciliación 3-Way (Pedido, Albarán, Factura), comparador de tarifas de proveedores y alertas de stock mínimo.
* **Cumplimiento Fiscal Español:** Generación de encadenamiento hash inmutable Veri*Factu (AEAT) y archivos XML firmados para TicketBAI (Diputaciones Forales).
* **RRHH & Registro Horario:** Fichaje con verificación IP/Dispositivo, generador de exportación oficial de inspección de trabajo española, cuadrantes de turnos y nóminas.
* **Calidad & APPCC:** Cuaderno de registros de temperatura de cámaras, checklists de limpieza, trazabilidad de alérgenos Reglamento UE 1169/2011 y auditorías sanitarias.
* **Mantenimiento SAT:** Gestión de activos del establecimiento, preventivos y correctivos técnicos, inventario de recambios y control de garantías.
* **BI & Gemini AI Assistant:** Cuadro de mando de ventas por tramos horarios, predicción de demanda de platos con IA Gemini 2.5 Flash y asistente conversacional de dirección.
* **Sincronización Offline (Better-SQLite3):** Motor de sincronización bidireccional entre almacenamiento SQLite embebido local y servidor central PostgreSQL.

### 🛡️ Seguridad y Calidad
* Cobertura de tests unitarios e integración con Vitest superior a 25 suites completas.
* Integración de middlewares Helmet, CORS restrictivo, Rate Limiter y JWT auth.
* Sanitización y validación tipada estricta mediante Zod en todas las rutas API.
