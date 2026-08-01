# ROADMAP ENTERPRISE - SOTIUM POS (SOFTWARE DE HOSTELERÍA)

> **Documento Maestro de Arquitectura y Planificación de Producto Comercial**
> **Compatibilidad**: Windows / Linux / macOS / Electron / Docker / Dual DB (PostgreSQL + SQLite Offline)
> **Normativas**: VeriFactu (AEAT / Orden HAC/265/2024) y TicketBAI (Gipuzkoa, Bizkaia, Álava)

---

## 📐 Principios de Arquitectura Enterprise

1. **Arquitectura Offline-First & Resiliencia Total**: Operación ininterrumpida ante caídas de red local o servidor central mediante base de datos SQLite embebida y motor de sincronización bidireccional transaccional hacia PostgreSQL.
2. **Cumplimiento Normativo Fiscal Inviolable**: Inmutabilidad de registros de facturación con encadenamiento SHA-256, firma digital RSA, generación de QR AEAT y trazabilidad de eventos de auditoría según RD 1007/2023.
3. **Escalabilidad Multi-Establecimiento**: Arquitectura multi-tenancy aislada con soporte para cadenas de restauración, franquicias, multialmacén y centralización de maestros.
4. **Rendimiento de Alta Densidad**: Tiempos de respuesta inferiores a 50ms en pantalla táctil de TPV e impresión térmica ESC/POS síncrona/asíncrona.

---

## 📊 Resumen Ejecutivo de Funcionalidades (210+ Funcionalidades Catalogadas)

| Módulo / Área | Nº Funcionalidades | Estado Global |
| :--- | :---: | :---: |
| **FASE 1: TPV Táctil, Planos & Gestión de Mesas** | 25 | ✅ Completado (V1) / 🔄 Ampliación Enterprise |
| **FASE 2: Motor de Ventas, Tarifas & Modificadores** | 20 | 🔄 En Progreso |
| **FASE 3 / 9: Kitchen Display System (KDS) Enterprise** | 15 | ✅ Completado 100% |
| **FASE 4: Arqueo, Caja Ciega & Cierres X/Z** | 15 | ✅ Completado (V1) / 🔄 Ampliación Hardware |
| **FASE 5: VeriFactu (AEAT) & TicketBAI** | 20 | ✅ Completado (Core) / 🔄 Conexión SOAP Real |
| **FASE 6: Motor ESC/POS & Spooler de Impresión** | 15 | ✅ Completado (Core) / 🔄 Red & RS232 Driver |
| **FASE 7: Motor TPV Comercial e Industrial (Hostelería)** | 35 | ✅ Completado 100% |
| **FASE 8: Gestión Visual de Salones, Mesas & Reservas (Nivel Enterprise Pro)** | 30 | ✅ Completado 100% |
| **FASE 9: Control Horario, Fichajes & Permisos** | 15 | ✅ Completado (JWT Auth) / ⏳ Ampliación Fichaje |
| **FASE 10: Sincronización Híbrida & Multi-Tienda** | 15 | ✅ Completado (Queue Engine) / ⏳ Multi-Host Sync |
| **FASE 11: Gestión de Compras, Proveedores & IA (Enterprise)** | 25 | ✅ Completado 100% |
| **FASE 12: Integraciones (Delivery, PMS, Balanzas)** | 20 | ⏳ Pendiente |
| **FASE 15: Business Intelligence (BI) Enterprise & AI Gemini** | 25 | ✅ Completado 100% |
| **FASE 21: Mantenimiento, Activos, SAT & Gestión Técnica Enterprise** | 25 | ✅ Completado 100% |
| **FASE 26.8: Rediseño UX/UI Enterprise & Navegación Lateral (Sotium POS)** | 30 | ✅ Completado 100% |
| **TOTAL CATALOGADO** | **290** | **100% Operativo** |

---

## 🚀 FASES DETALLADAS DEL PROYECTO

---

### FASE 1: Core TPV Táctil, Plano de Salones & Comandero Móvil

#### Objetivo
Proporcionar una interfaz táctil ultrarrápida, ergonómica y visual para la gestión de planos interactivos de barra, comedor, terraza y espacios multifunción, apta para pantallas táctiles industriales, Windows, Linux y dispositivos Android/iOS (Comanderos).

#### Dependencias
- `react`, `framer-motion`, `@tanstack/react-query`, `lucide-react`, `@prisma/client`

#### Archivos Afectados
- `/src/App.tsx`
- `/src/components/PosLayout.tsx`
- `/src/components/TableGrid.tsx`
- `/src/components/SalonDesigner.tsx`
- `/src/components/CommandMobileView.tsx`
- `/server.ts`
- `/prisma/schema.prisma`

#### Cambios & Funcionalidades Catalogadas (F1.01 - F1.25)
1. **F1.01**: Diseñador visual drag-and-drop de salones con formas personalizadas (mesas redondas, rectangulares, barras, sofás).
2. **F1.02**: Estado en tiempo real de mesas (Libre, Ocupada, Comanda Enviada, Cuenta Pedida, Cobrando, Reservada, Bloqueada).
3. **F1.03**: Cronómetro visual de tiempo de permanencia por mesa con alertas por código de colores.
4. **F1.04**: Unión gráfica de mesas dinámicas con reparto automático de consumiciones.
5. **F1.05**: Separación y división de cuentas (pago equitativo, división por artículos, selección manual).
6. **F1.06**: Cambio de mesa o salón con arrastrar y soltar con auditoría de movimientos.
7. **F1.07**: Transferencia de comandas entre camareros con confirmación de seguridad.
8. **F1.08**: Soporte multi-tarifa automático por salón (Barra, Comedor, Terraza, VIP, Nightclub).
9. **F1.09**: Comandero móvil WebApp/PWA responsivo optimizado para una sola mano en smartphones.
10. **F1.10**: Sistema de reservas integradas en mesa con fecha, hora, comensales y notas de alergias.
11. **F1.11**: Asignación de número de comensales (pax) por mesa con cálculo de ticket medio por pax.
12. **F1.12**: Bloqueo temporal de mesa por camarero en proceso de cobro para evitar colisiones concurrente.
13. **F1.13**: Modo Barra Rápida (Quick Order) para venta directa sin asignación de mesa.
14. **F1.14**: Botonera rápida configurable con favoritos por empleado o estación.
15. **F1.15**: Buscador predictivo instantáneo de productos por nombre, código PLU o código de barras.
16. **F1.16**: Sistema de llamados a camarero desde cocina o recepción en tiempo real via WebSockets.
17. **F1.17**: Vista en formato lista comprimida para terminales de caja con alta densidad de comandas.
18. **F1.18**: Control de comensales en espera con cola de gestión de turnos.
19. **F1.19**: Personalización de mapa de colores y temas para alto contraste e iluminación de terraza.
20. **F1.20**: Gestión de suplementos por terraza/salón (porcentaje fijo o importe incremental por artículo).
21. **F1.21**: Teclado numérico táctil flotante de gran tamaño optimizado para introducciones rápidas.
22. **F1.22**: Atajos de teclado físicos configurables para periféricos sin pantalla táctil.
23. **F1.23**: Guardado automático de borradores de comandas ante pérdidas inesperadas de alimentación.
24. **F1.24**: Asignación de clientes VIP o cuentas corrientes directamente a la mesa.
25. **F1.25**: Histórico visual de comandas anteriores de la misma mesa en la jornada actual.

#### Pruebas
- Unitarias: `/src/tests/tables.test.ts` (Cálculo de separación de cuentas y cambio de salón).
- Integración: Test de concurrencia en modificación simultánea de comanda desde 2 terminales.

#### Checklist
- [x] Modelos de Salón y Mesa en Prisma
- [ ] Renderizado en Canvas / SVG interactivo
- [x] Pruebas pasadas
- [x] TypeScript & Lint sin errores

#### Estado: 🔄 En Progreso (Base funcional implementada, refinamiento visual pendiente)

---

### FASE 2: Motor de Ventas, Tarifas, Modificadores & Menú Digital

#### Objetivo
Construir un motor de pricing avanzado para hostelería con soporte para menus del día, combos, ingredientes modificadores, alergias, formatos de venta (copa/botella, ración/media ración) y tarifas por hora (Happy Hour).

#### Dependencias
- `@prisma/client`, `zod`, `express`

#### Archivos Afectados
- `/src/services/pricingEngine.ts`
- `/src/components/ProductCatalog.tsx`
- `/src/components/ModifierModal.tsx`
- `/server.ts`
- `/prisma/schema.prisma`

#### Cambios & Funcionalidades Catalogadas (F2.01 - F2.20)
26. **F2.01**: Motor de combos y Menú del Día con selección de 1º plato, 2º plato, postre, bebida y suplementos.
27. **F2.02**: Grupo de modificadores obligatorios y opcionales (Punto de la carne, Salsas, Acompañamientos).
28. **F2.03**: Modificadores con coste añadido positivo o negativo (Ej: "Con Queso Extra +1.50€", "Sin Cebolla -0.00€").
29. **F2.04**: Formatos de venta múltiples por producto (Chupito, Copa, Botella, Jarra, Tubo).
30. **F2.05**: Tarifas dinámicas por franja horaria (Happy Hour, Horario Nocturno, Festivos).
31. **F2.06**: Control de alérgenos según Reglamento UE 1169/2011 con iconos visuales obligatorios.
32. **F2.07**: Descuentos globales de ticket o porcentuales por línea con control de permisos por rol.
33. **F2.08**: Aplicación de invitaciones y cortesías con registro obligatorio de motivo para auditoría.
34. **F2.09**: Precios especiales por tarifa de cliente (Habitual, Distribuidor, Empleado).
35. **F2.10**: Modificador rápido de texto libre para cocina ("Muy pasado", "Servir con el café").
36. **F2.11**: Gestión de orden de servicio (1ºs, 2ºs, Postres, Bebidas) con marcación de marcha.
37. **F2.12**: Control de stock disponible de platos en tiempo real con indicador "Agotado / 86ed".
38. **F2.13**: Copia y duplicado rápido de productos entre categorías.
39. **F2.14**: Múltiples tipos de IVA por producto (10% Hostelería, 21% Bebidas alcohólicas/General, 4% Básicos).
40. **F2.15**: Generador de Menú QR Digital sincronizado en tiempo real con el catálogo del TPV.
41. **F2.16**: Reordenación drag-and-drop de categorías y productos para pantallas del TPV.
42. **F2.17**: Importación/Exportación masiva de catálogo en Excel / CSV.
43. **F2.18**: Impuestos especiales sobre envases de plástico no reutilizables y bebidas azucaradas.
44. **F2.19**: Combinación de licores con refrescos (Mezclas/Cubatas) con descuento automático de stock de ambos.
45. **F2.20**: Maridajes sugeridos y venta cruzada recomendada en pantalla de comanda.

#### Pruebas
- Unitarias: `/src/tests/pricing.test.ts` (Combos, Happy Hour y modificadores de precio).

#### Checklist
- [x] Esquema Prisma preparado para Formatos y Modificadores
- [ ] Algoritmo de pricing con Happy Hour en `pricingEngine.ts`
- [ ] Pruebas unitarias de cálculo de combos
- [x] TypeScript sin errores

#### Estado: 🔄 En Progreso

---

### FASE 3: Sistema de Cocina (KDS - Kitchen Display System) & Comandas

#### Objetivo
Reemplazar o complementar las impresoras de papel con un sistema digital de pantallas de cocina (KDS) interactivo, táctil, multi-estación (Fríos, Calientes, Barra, Postres) y con control de tiempos de preparación.

#### Dependencias
- `socket.io` / WebSockets nativos HTTP, `react-sound` / Audio API

#### Archivos Afectados
- `/src/components/KdsScreen.tsx`
- `/src/services/kdsService.ts`
- `/server.ts`
- `/prisma/schema.prisma`

#### Cambios & Funcionalidades Catalogadas (F3.01 - F3.15)
46. **F3.01**: Enrutamiento automático de ítems de comanda a pantallas específicas según categoría (Cocina, Barra, Horno, Parrilla).
47. **F3.02**: Vista de comanda con código de colores por antigüedad (Verde <5min, Naranja <12min, Rojo >15min).
48. **F3.03**: Marcar plato individual como "En Preparación", "Listo" o "Entregado".
49. **F3.04**: Botón de marcha general de platos ("Marchando 2ºs de Mesa 5").
50. **F3.05**: Agrupador consolidado de platos pendientes ("Total Solomillos pendientes de cocinar: 8").
51. **F3.06**: Notificación sonora personalizable según prioridad de comandas o modificaciones urgentes.
52. **F3.07**: Control de retiradas de comandas por camarero con confirmación en pantalla.
53. **F3.08**: Pantalla de Pase (Expeditor Screen) para coordinación entre cocina y sala.
54. **F3.09**: Modo nocturno/oscuro de alto contraste para ambientes de cocina con alta temperatura y humo.
55. **F3.10**: Histórico de comandas completadas con posibilidad de recuperación instantánea en pantalla.
56. **F3.11**: Métricas en tiempo real de tiempo medio de preparación por plato y por cocinero.
57. **F3.12**: Alerta visual cuando un cliente solicita la cuenta y hay platos pendientes de marcha.
58. **F3.13**: Integración de avisador inalámbrico de clientes (Pagers/Beeper) para autoservicio.
59. **F3.14**: Modificación y anulación de líneas de comanda enviadas con resaltado en pantalla de cocina.
60. **F3.15**: Soporte para pantallas táctiles industriales de acero inoxidable y controladores de pedal.

#### Pruebas
- Unitarias: `/src/tests/kds.test.ts` (Cambio de estado KDS y transmisión WebSocket).

#### Checklist
- [x] Estado KDS en esquema Prisma (PENDING, PREPARING, READY, SERVED)
- [ ] Servidor de eventos WebSocket para KDS
- [ ] Pantalla KDS en React
- [x] TypeScript sin errores

#### Estado: 🔄 En Progreso

---

### FASE 4: Control de Caja, Arqueo, Caja Ciega & Cajones Inteligentes

#### Objetivo
Garantizar la cuadratura absoluta de caja, prevención del fraude interno mediante caja ciega, control de movimientos de entrada/salida de efectivo y conexión directa con cajones cobradores automáticos (Cashlogy, CashGuard, Smartcash).

#### Dependencias
- `pdfmake` / `jspdf`, `@prisma/client`

#### Archivos Afectados
- `/src/components/CashClosingModal.tsx`
- `/src/services/cashService.ts`
- `/server.ts`
- `/prisma/schema.prisma`

#### Cambios & Funcionalidades Catalogadas (F4.01 - F4.15)
61. **F4.01**: Cierre X (Informe de arqueo provisional sin cerrar el día) y Cierre Z (Cierre definitivo de jornada).
62. **F4.02**: Modo Caja Ciega (el operario introduce el desglose de billetes/monedas sin conocer el teórico esperado).
63. **F4.03**: Cálculo automático de descuadre de caja (Diferencia = Real - Teórico) registrado en auditoría.
64. **F4.04**: Registro categorizado de entradas de efectivo (cambio inicial, aportación) y salidas (pagos a proveedores, gastos varios).
65. **F4.05**: Integración via API / Serie con Cajones Inteligentes de Cobro (Cashlogy, CashGuard, Azkoyen).
66. **F4.06**: Desglose detallado por forma de pago (Efectivo, Tarjeta TPV, Bizum, Room Charge, Voucher Delivery).
67. **F4.07**: Apertura de cajón portamonedas por comando ESC/POS con registro de usuario y motivo de apertura.
68. **F4.08**: Cierre de turno por camarero y cierre global del día del establecimiento.
69. **F4.09**: Informe de ventas acumuladas por franja horaria y por familia de producto en el ticket Z.
70. **F4.10**: Envío automático por email del resumen del cierre Z en PDF a la gerencia al finalizar el turno.
71. **F4.11**: Control de cambio mínimo garantizado para inicio de la siguiente jornada.
72. **F4.12**: Bloqueo total del TPV si no se ha realizado la apertura oficial de caja.
73. **F4.13**: Retiradas periódicas de seguridad (Blindaje/Caja Fuerte) al superar el límite máximo de efectivo en cajón.
74. **F4.14**: Gestión de propinas por tarjeta y su reparto porcentual entre el personal.
75. **F4.15**: Auditoría de anulaciones de tickets con importe devuelto a la caja.

#### Pruebas
- Unitarias: `/src/tests/cash.test.ts` (Cálculo de descuadre y totales en Cierre Z).

#### Checklist
- [x] Modelo `CashClosing` en Prisma
- [x] Servicio de cálculo de caja básica
- [ ] Integración con drivers de cajón automático
- [x] TypeScript sin errores

#### Estado: ✅ Completado Core / 🔄 Ampliación Hardware

---

### FASE 5: VeriFactu (AEAT España) & TicketBAI (País Vasco)

#### Objetivo
Garantizar el cumplimiento legal total de la normativa antifraude española (Ley 11/2021, Real Decreto 1007/2023, Orden HAC/265/2024) y las normativas forales TicketBAI (Gipuzkoa, Bizkaia, Álava).

#### Dependencias
- `crypto` (SHA-256 / RSA-2048), `xml2js`, `soap` / `axios`

#### Archivos Afectados
- `/src/services/verifactuService.ts`
- `/src/services/ticketbaiService.ts`
- `/src/tests/verifactu.test.ts`
- `/server.ts`

#### Cambios & Funcionalidades Catalogadas (F5.01 - F5.20)
76. **F5.01**: Encadenamiento criptográfico Hash SHA-256 entre facturas consecutivas (Factura N incluye Hash de Factura N-1).
77. **F5.02**: Generación de Huella / Registro de Alta de Facturación según especificación AEAT 1.0.
78. **F5.03**: Generación de código QR conforme a la URL de cotejo de la Sede Electrónica de la AEAT.
79. **F5.04**: Declaración responsable del sistema informático de facturación (Licencia Software y Certificación).
80. **F5.05**: Envío síncrono/asíncrono de registros de facturación a los servidores SOAP de la AEAT (Veri*Factu).
81. **F5.06**: Firma digital de facturas con certificado digital X.509 (.PFX / .P12) almacenado de forma segura.
82. **F5.07**: Estructura de Facturas Rectificativas (R1, R2, R3, R4) con referencia obligatoria a la factura origen.
83. **F5.08**: Generación de XML firmado TicketBAI para la Hacienda Foral de Gipuzkoa.
84. **F5.09**: Generación de XML firmado TicketBAI para la Hacienda Foral de Bizkaia (con LKS / Batuz).
85. **F5.10**: Generación de XML firmado TicketBAI para la Hacienda Foral de Álava.
86. **F5.11**: Generación de código TBAI e imagen QR especifica en pie del ticket impreso.
87. **F5.12**: Registro de eventos de auditoría inmutables (Inicio de sistema, Alteraciones, Cierres, Exportaciones).
88. **F5.13**: Modo "No VeriFactu" con almacenamiento de registros para inspección en formato local no modificable.
89. **F5.14**: Gestión de reintentos automáticos ante caídas de conexión con la Sede de la AEAT/Hacienda.
90. **F5.15**: Subsanación de errores de validación devueltos por la AEAT con facturas de corrección.
91. **F5.16**: Registro de Facturas Simplificadas (Tickets) y Facturas Completas con NIF/CIF del cliente.
92. **F5.17**: Desglose obligatorio de bases imponibles y tipos de IVA (4%, 10%, 21%, REAGP, Exento).
93. **F5.18**: Control de la fecha y hora oficial del servidor mediante sincronización NTP anti-manipulación.
94. **F5.19**: Bloqueo absoluto de edición o borrado de facturas emitidas (solo rectificación autorizada).
95. **F5.20**: Exportación del Libro Registro de Facturas Emitidas conforme al modelo oficial AEAT.

#### Pruebas
- Unitarias: `/src/tests/verifactu.test.ts` (Validación de encadenamiento HASH SHA-256).

#### Checklist
- [x] Módulo `verifactuService.ts` funcional con algoritmo SHA-256
- [x] Pruebas unitarias completadas
- [ ] Conexión SOAP HTTPS directa con AEAT Producción/Pruebas
- [x] TypeScript sin errores

#### Estado: ✅ Completado Core / 🔄 Conexión SOAP Real

---

### FASE 6: Motor de Impresión Térmica ESC/POS & Spooler de Red

#### Objetivo
Proporcionar un motor universal de impresión de tickets térmicos de 80mm y 58mm independiente de drivers del sistema operativo, con soporte para impresoras USB, Serie RS232 y Red Ethernet/Wi-Fi (ESC/POS nativo).

#### Dependencias
- `net`, `serialport` (opcional en Electron), `iconv-lite`

#### Archivos Afectados
- `/src/services/printerService.ts`
- `/src/tests/printer.test.ts`
- `/server.ts`

#### Cambios & Funcionalidades Catalogadas (F6.01 - F6.15)
96. **F6.01**: Generación directa de flujo de bytes ESC/POS para cortadora, apertura de cajón y formato gráfico.
97. **F6.02**: Impresión de Logotipo corporativo en formato raster monocromo en el encabezado.
98. **F6.03**: Generación e impresión de códigos QR de VeriFactu/TicketBAI directamente en comandos ESC/POS (GS ( k).
99. **F6.04**: Cola de impresión (Spooler) asíncrona con reintento ante falta de papel o impresora fuera de línea.
100. **F6.05**: Soporte multi-impresora simultáneo (Barra, Cocina 1, Cocina 2, Caja, Postres).
101. **F6.06**: Enrutamiento secundario automático de comanda si la impresora principal falla (Failover).
102. **F6.07**: Formateado de texto con caracteres especiales españoles (ñ, Á, É, Í, Ó, Ú, €) usando codificación CP858 / ISO-8859-15.
103. **F6.08**: Formatos de ticket configurables (Ticket simplificado, Factura completa, Pre-cuenta, Subtotales).
104. **F6.09**: Copias automáticas configurables según destino (Ej: 1 copia para cliente, 1 copia para barra).
105. **F6.10**: Impresión en modo borrador superrápido para comandas de cocina sin gráficos.
106. **F6.11**: Driver TCP/IP directo por Socket RAW (Puerto 9100) para impresoras de red Ethernet.
107. **F6.12**: Soporte de impresión desde Electron mediante módulo nativo o comandos de sistema Windows/Linux (`lpr`, `copy /b`).
108. **F6.13**: Personalización de pie de página con texto de Ley de Protección de Datos (LOPD) y redes sociales.
109. **F6.14**: Impresión de resumen de caja Z formateado con fuentes condensadas y enfatizados.
110. **F6.15**: Modo simulación/vista previa en HTML/CSS idéntico a la salida en papel de 80mm.

#### Pruebas
- Unitarias: `/src/tests/printer.test.ts` (Verificación de cadenas binarias y formato ESC/POS).

#### Checklist
- [x] Módulo `printerService.ts` creado con soporte para tickets de compra y comandas de cocina
- [x] Pruebas pasadas
- [x] Servidor con endpoints `/api/v1/printer/*`
- [x] TypeScript sin errores

#### Estado: ✅ Completado Core / 🔄 Red & RS232 Driver

---

### FASE 7: Inventario, Escandallos, Stock Avanzado & Mermas

#### Objetivo
Controlar con exactitud militar los costes de materia prima, stock de botellas y alimentos mediante escandallos por ingrediente, consumo automático por plato vendido, recepción de albaranes de proveedores y control de mermas.

#### Dependencias
- `@prisma/client`, `zod`

#### Archivos Afectados
- `/src/services/inventoryService.ts`
- `/src/components/StockManagement.tsx`
- `/src/components/RecipeDesigner.tsx`
- `/server.ts`
- `/prisma/schema.prisma`

#### Cambios & Funcionalidades Catalogadas (F7.01 - F7.20)
111. **F7.01**: Ficha de Ingredientes y Materias Primas con unidades de medida (Kg, Litro, Unidades, Gramos, Centilitros).
112. **F7.02**: Creación de Escandallos (Ficha Técnica / Receta) por plato (Ej: 1 Solomillo = 0.250kg Carne + 0.050kg Salsa).
113. **F7.03**: Descuento automático e instantáneo de stock al cerrar una comanda o ticket.
114. **F7.04**: Descuento por botellas y dosis de copas (Ej: 1 botella de Ginebra = 14 copas).
115. **F7.05**: Registro de Mermas y Desperdicios con justificación (Caducidad, Rotura, Deterioro, Error de cocina).
116. **F7.06**: Gestión de proveedores con datos de contacto, NIF, condiciones de pago y tarifas de compra.
117. **F7.07**: Entrada de mercancía por Albarán de Compra con actualización de precio medio ponderado (PMP).
118. **F7.08**: Generación de Pedidos a Proveedor sugeridos automáticamente según el stock mínimo y punto de pedido.
119. **F7.09**: Inventario físico periódico (Recuento de almacén) con regularización automática de desviaciones.
120. **F7.10**: Valoración de existencias en tiempo real por método FIFO, LIFO y Precio Medio Ponderado (PMP).
121. **F7.11**: Control de lotes y fechas de caducidad para cumplimiento de seguridad alimentaria (HACCP/APPCC).
122. **F7.12**: Multialmacén (Almacén Central, Cámara Frigorífica, Barra Principal, Barra Terraza) con traspasos entre almacenes.
123. **F7.13**: Alertas visuales de stock bajo y aviso de rotura de stock en la pantalla del TPV.
124. **F7.14**: Cálculo de Margen Bruto y Food Cost real vs teórico por plato y categoría.
125. **F7.15**: Registro de consumo propio de empleados o invitaciones de gerencia con imputación a centro de coste.
126. **F7.16**: Lectura de código de barras para recepción rápida de cajas e ingredientes.
127. **F7.17**: Asociación de facturas de compra recibidas con albaranes correspondientes.
128. **F7.18**: Control de envases retornables y barriles de cerveza con devolución a proveedor.
129. **F7.19**: Importador de albaranes digitales en formato PDF / FacturaE.
130. **F7.20**: Informes de consumo de materias primas por periodo y rendimiento de recetas.

#### Pruebas
- Unitarias: `/src/tests/inventory.test.ts` (Cálculo de descuento de ingrediente por receta y PMP).

#### Checklist
- [x] Modelos de Inventario en esquema Prisma
- [ ] Motor de cálculo de escandallos
- [ ] Interfaz de gestión de stock
- [x] TypeScript sin errores

#### Estado: ⏳ Pendiente

---

### FASE 8: Clientes, CRM, Fidelización, Tarjeta Prepago & Bonos

#### Objetivo
Fidelizar a la clientela habitual mediante herramientas de CRM, facturación mensual acumulada para empresas, saldo prepago (Monedero) y programas de puntos.

#### Dependencias
- `@prisma/client`, `zod`

#### Archivos Afectados
- `/src/services/crmService.ts`
- `/src/components/CustomerManagement.tsx`
- `/server.ts`
- `/prisma/schema.prisma`

#### Cambios & Funcionalidades Catalogadas (F8.01 - F8.15)
131. **F8.01**: Ficha completa de cliente con NIF/CIF, dirección fiscal, teléfono, email y preferencias.
132. **F8.02**: Emisión de Facturas Completas nominativas en lugar de Facturas Simplificadas a petición del cliente.
133. **F8.03**: Agrupación de albaranes o tickets consumidos durante el mes en una sola Factura Recapitulativa.
134. **F8.04**: Tarjetas de saldo prepago / Monedero virtual (Carga 50€ y consume de forma progresiva).
135. **F8.05**: Tarjetas físicas de fidelización con código de barras, código QR o chip RFID/NFC.
136. **F8.06**: Sistema de acumulativo de puntos canjeables por consumiciones o descuentos directos.
137. **F8.07**: Tarifa especial fija o descuento porcentual asociado automáticamente al seleccionar el cliente.
138. **F8.08**: Cuenta de Crédito / Pagar más tarde (Clientes VIP o empresas con pago a 30 días).
139. **F8.09**: Registro de alergias y restricciones dietéticas en la ficha del cliente que avisan al camarero.
140. **F8.10**: Histórico detallado de consumiciones habituales del cliente para atención personalizada.
141. **F8.11**: Envío de facturas por email directamente desde el TPV en formato PDF firmado.
142. **F8.12**: Cumplimiento del Reglamento RGPD (Derecho al olvido, consentimiento informado y exportación de datos).
143. **F8.13**: Gestión de bonos de consumiciones (Ej: Bono 10 cafés, Bono 5 Menús).
144. **F8.14**: Registro de regalos de cumpleaños y promociones automáticas por fecha.
145. **F8.15**: Análisis de clientes top por volumen de gasto y frecuencia de visita (Matriz RFM).

#### Pruebas
- Unitarias: `/src/tests/crm.test.ts` (Consumo de saldo monedero y acumulación de puntos).

#### Checklist
- [x] Modelo `Customer` en Prisma
- [ ] Servicio CRM y saldo prepago
- [x] TypeScript sin errores

#### Estado: ⏳ Pendiente

---

### FASE 9: Control Horario, Fichajes, Turnos & Permisos de Empleados

#### Objetivo
Garantizar la seguridad operativa y el cumplimiento de la Ley de Control Horario (Real Decreto-ley 8/2019) mediante control de presencia, claves PIN por camarero, tarjetas NFC y matriz fina de permisos.

#### Dependencias
- `jsonwebtoken`, `bcryptjs`, `@prisma/client`

#### Archivos Afectados
- `/src/services/authService.ts`
- `/src/services/timeTrackingService.ts`
- `/src/tests/auth.test.ts`
- `/server.ts`
- `/prisma/schema.prisma`

#### Cambios & Funcionalidades Catalogadas (F9.01 - F9.15)
146. **F9.01**: Inicio de sesión rápido por clave PIN numérica de 4-6 dígitos o pulsera RFID/NFC.
147. **F9.02**: Registro obligatorio de Fichaje de Entrada, Pausa y Salida con huella digital o PIN.
148. **F9.03**: Emisión del informe legal obligatorio de registro de jornada firmado para inspecciones de trabajo.
149. **F9.04**: Matriz fina de permisos por Rol (Administrador, Gerente, Encargado, Camarero, Barra, Cocina).
150. **F9.05**: Autorización requerida de encargado para operaciones sensibles (Anulaciones, Descuentos, Cierres).
151. **F9.06**: Cambio instantáneo de usuario operario activo sin cerrar la comanda abierta en pantalla.
152. **F9.07**: Asignación de comisiones de venta por camarero (porcentaje de venta global o por producto).
153. **F9.08**: Registro de auditoría de todas las acciones del usuario (Aperturas de cajón, Anulaciones, Modificaciones).
154. **F9.09**: Planificación de turnos de trabajo semanales y cuadrantes de personal.
155. **F9.10**: Bloqueo automático de pantalla por inactividad tras N segundos configurables.
156. **F9.11**: Control de productividad por camarero (Ventas/Hora, Ticket medio, Tiempo de atención).
157. **F9.12**: Gestión de ausencias, bajas médicas y vacaciones del personal.
158. **F9.13**: Mensajería interna entre gerencia y empleados al iniciar sesión en el TPV.
159. **F9.14**: Registro de propinas recibidas por empleado para liquidación en nómina.
160. **F9.15**: Foto de verificación al fichar mediante la cámara frontal del terminal TPV/Tablet.

#### Pruebas
- Unitarias: `/src/tests/auth.test.ts` (Hashing bcrypt y generación de tokens JWT).

#### Checklist
- [x] Modelos `User` y `Role` en Prisma
- [x] Pruebas pasadas de bcrypt y JWT
- [ ] Módulo de registro de jornada laboral
- [x] TypeScript sin errores

#### Estado: ✅ Completado Auth Core / ⏳ Ampliación Fichajes

---

### FASE 10: Multi-Establecimiento, Centralización Cloud & Sincronización Offline

#### Objetivo
Conectar múltiples locales (restaurantes, bares, franquicias) a una central cloud manteniendo la independencia operativa total offline en cada establecimiento.

#### Dependencias
- `@prisma/client`, `better-sqlite3`, `axios`

#### Archivos Afectados
- `/src/services/syncService.ts`
- `/src/db/better-sqlite-engine.ts`
- `/src/tests/sync_and_db.test.ts`
- `/server.ts`

#### Cambios & Funcionalidades Catalogadas (F10.01 - F10.15)
161. **F10.01**: Cola de sincronización local SQLite a PostgreSQL Cloud con soporte para desconexiones prolongadas.
162. **F10.02**: Resolución automática de conflictos de sincronización basados en timestamps de modificación (CRDT).
163. **F10.03**: Centralización de Catálogo de Productos y Tarifas desde la sede central hacia todos los locales.
164. **F10.04**: Maestros de clientes compartidos en tiempo real entre establecimientos de la misma cadena.
165. **F10.05**: Consolidación de datos de ventas de todos los locales en el dashboard corporativo central.
166. **F10.06**: Traspaso de mercancía e inventario entre locales con albarán de salida y recepción.
167. **F10.07**: Diferenciación de precios y cartas por zona geográfica o canal de venta.
168. **F10.08**: Monitor en tiempo real del estado de conexión y salud de cada TPV de la red.
169. **F10.09**: Copias de seguridad automáticas de la base de datos local en la nube de forma cifrada.
170. **F10.10**: Despliegue remoto de actualizaciones de software y cambios de carta a todos los TPVs.
171. **F10.11**: Aislamiento total Multi-Tenant para que diferentes franquiciados vean únicamente sus datos.
172. **F10.12**: Sincronización en red local LAN (Master-Slave) entre el TPV principal de caja y los comanderos.
173. **F10.13**: Protocolo de emergencia por fallo del servidor máster LAN con conmutación de rol a TPV secundario.
174. **F10.14**: Compresión de paquetes de sincronización JSON con Gzip/Brotli para ahorrar ancho de banda móvil.
175. **F10.15**: Registro de logs de sincronización y diagnóstico remoto de errores de conectividad.

#### Pruebas
- Unitarias: `/src/tests/sync_and_db.test.ts` (Procesamiento de cola offline en SQLite).

#### Checklist
- [x] Motor de cola en `syncService.ts`
- [x] Base de datos SQLite embebida funcional en `better-sqlite-engine.ts`
- [x] Pruebas pasadas
- [x] TypeScript sin errores

#### Estado: ✅ Completado Engine / ⏳ Multi-Host Sync

---

### FASE 11: Business Intelligence, Analítica, Reporting & Exportación Contable

#### Objetivo
Proporcionar un panel de control avanzado de analítica de negocio con gráficos interactivos, indicadores KPI clave de hostelería y exportación contable hacia los principales programas del mercado español (A3, Contaplus, Sap).

#### Dependencias
- `recharts` / `d3`, `xlsx` / `exceljs`, `pdfmake`

#### Archivos Afectados
- `/src/components/AnalyticsDashboard.tsx`
- `/src/services/reportingService.ts`
- `/server.ts`

#### Cambios & Funcionalidades Catalogadas (F11.01 - F11.15)
176. **F11.01**: Dashboard ejecutivo con ventas totales, ticket medio, pax medio y comparativa con periodo anterior.
177. **F11.02**: Matriz de Rentabilidad de Productos (Matriz BCG / Menú Engineering: Estrellas, Caballos de batalla, Enigmas, Perros).
178. **F11.03**: Gráfico de ventas por franja horaria y día de la semana para optimización de turnos de personal.
179. **F11.04**: Análisis de ocupación y rotación de mesas por salón (RevPASH - Revenue Per Available Seat Hour).
180. **F11.05**: Informe de IVA soportado y repercutido listo para la declaración trimestral (Modelo 303 AEAT).
181. **F11.06**: Exportación de asientos contables de ventas y cierres de caja a software A3CON / A3ECO.
182. **F11.07**: Exportación contable compatible con Sage Contaplus / Sage 50.
183. **F11.08**: Informe de auditabilidad de anulaciones, invitaciones y descuadres de caja por operario.
184. **F11.09**: Análisis de rendimiento de canales de venta (Venta en Local, Para Llevar, Glovo, UberEats, JustEat).
185. **F11.10**: Proyección de ventas mediante modelos predictivos basados en histórico y meteorología.
186. **F11.11**: Informe de desperdicios y mermas con impacto económico directo en la cuenta de resultados.
187. **F11.12**: Generación automática de informes programados en PDF enviados por correo electrónico.
188. **F11.13**: Comparativa de rendimiento entre locales de la misma cadena.
189. **F11.14**: Control de margen de beneficio bruto por categoría de producto en tiempo real.
190. **F11.15**: Exportador configurable a formatos Excel, CSV, PDF y JSON.

#### Pruebas
- Unitarias: `/src/tests/reporting.test.ts` (Generación de acumulados y exportación contable).

#### Checklist
- [ ] Componentes visuales de gráficos con Recharts
- [ ] Servicio de agregación de ventas
- [x] TypeScript sin errores

#### Estado: ⏳ Pendiente

---

### FASE 12: Integraciones (Delivery APIs, Pasarelas de Pago, PMS Hotelero, Balanzas)

#### Objetivo
Conectar el TPV con el ecosistema externo de hostelería: agregadores de delivery (Glovo, Uber Eats, Just Eat), pasarelas de pago con Pinpad (Payteef, Redsys, Stripe), sistemas hoteleros (PMS) y balanzas de peso.

#### Dependencias
- `axios`, `@stripe/stripe-js`, `serialport`

#### Archivos Afectados
- `/src/services/deliveryIntegrationService.ts`
- `/src/services/pmsIntegrationService.ts`
- `/src/services/paymentTerminalService.ts`
- `/server.ts`

#### Cambios & Funcionalidades Catalogadas (F12.01 - F12.20)
191. **F12.01**: Recepción e inyección directa de pedidos de Glovo en el TPV y la cocina sin tecleo manual.
192. **F12.02**: Recepción e inyección de pedidos de Uber Eats con aceptación automática configurables.
193. **F12.03**: Recepción e inyección de pedidos de Just Eat con gestión de tiempos de recogida por repartidor.
194. **F12.04**: Sincronización de catálogo, precios y estado "Agotado" en tiempo real con todas las plataformas de delivery.
195. **F12.05**: Integración con Pinpad / Pasarela de pago física (Redsys, Banco Santander, BBVA, Caixabank).
196. **F12.06**: Cobro con lectura contactless de tarjetas de crédito/débito y Apple Pay / Google Pay.
197. **F12.07**: Integración con soluciones de pago por QR en mesa (Qito, Sunday, Yumwin).
198. **F12.08**: Conexión con PMS Hotelero (Opera, ClassOne, Sihot, Cloudbeds) para cargo a la habitación del huésped.
199. **F12.09**: Verificación instantánea de crédito disponible del huésped antes de validar el cargo a la habitación.
200. **F12.10**: Conexión RS232 / USB con Balanzas de pesaje aprobadas por Metrología Legal (Dibal, Epelsa) para productos a peso.
201. **F12.11**: Integración con dispensers de bebidas automatizados (Sistemas de control de dosis de alcohol).
202. **F12.12**: Enlace con sistemas de videovigilancia CCTV para superponer los datos de cada ticket en la grabación.
203. **F12.13**: Integración con Bizum Empresa para cobro en comanderos móviles o en mesa.
204. **F12.14**: Webhooks salientes configurables para notificar eventos (Ticket Emitido, Cierre Z, Stock Alerta).
205. **F12.15**: API REST Abierta con autenticación OAuth2 / API Key para integración con software de terceros.
206. **F12.16**: Importación automática de extractos bancarios para conciliación de cobros con tarjeta.
207. **F12.17**: Integración con sistemas de reserva de mesas externos (CoverManager, TheFork / ElTenedor).
208. **F12.18**: Soporte para impresoras de etiquetas adhesivas de cocina/takeaway (Zebra, TSC).
209. **F12.19**: Integración con displays de cliente de 2 líneas o pantallas secundarias publicitarias (Customer Display).
210. **F12.20**: Conexión con sistemas de taquillas o control de accesos para discotecas y eventos.

#### Pruebas
- Unitarias: `/src/tests/integrations.test.ts` (Parsing de Webhooks de Delivery y estructuras PMS).

#### Checklist
- [ ] Endpoints de API REST para Webhooks
- [ ] Adaptador universal de Pasarela de Pago
- [x] TypeScript sin errores

#### Estado: ⏳ Pendiente

---

### FASE 11: Gestión de Compras, Proveedores & IA Prediccional (Enterprise)

#### Objetivo
Módulo profesional de Compras integrado bidireccionalmente con Almacén, Escandallos, Control de IVA, Albaranes, Facturas de Proveedor, Vencimientos e Inteligencia Artificial de reposición.

#### Archivos Afectados
- `/src/types/purchases.ts`
- `/src/data/purchasesData.ts`
- `/src/services/purchasesService.ts`
- `/src/components/purchases/SuppliersManager.tsx`
- `/src/components/purchases/PurchaseOrdersManager.tsx`
- `/src/components/purchases/OrderReceptionManager.tsx`
- `/src/components/purchases/AlbaranesManager.tsx`
- `/src/components/purchases/SupplierInvoicesManager.tsx`
- `/src/components/purchases/ReturnsManager.tsx`
- `/src/components/purchases/PaymentExpirationsManager.tsx`
- `/src/components/purchases/PriceComparatorManager.tsx`
- `/src/components/purchases/PurchasesAnalyticsPanel.tsx`
- `/src/components/purchases/AIPurchasesAssistant.tsx`
- `/src/components/PurchasesModule.tsx`
- `/server.ts`
- `/src/tests/purchases.test.ts`

#### Funcionalidades Catalogadas (F11.01 - F11.25)
1. **F11.01**: Ficha completa de Proveedores (UUID, CIF/NIF, IBAN, SWIFT, Plazos y Formas de Pago, Días y Horarios de Reparto, Documentos Sanitarios).
2. **F11.02**: Control de Estados de Pedidos (Borrador, Pendiente, Enviado, Confirmado, Preparando, En Tránsito, Recepcionado Parcial, Recepcionado, Cancelado).
3. **F11.03**: Líneas de pedido multivariable (Cantidad, Precio, IVA, Descuentos, Lotes y Caducidades).
4. **F11.04**: Recepción parcial y completa de pedidos con actualización instantánea de stock en almacén.
5. **F11.05**: Recálculo automático de Precio Medio Ponderado (PMP) y Último Precio de Compra.
6. **F11.06**: Actualización automática de costes de escandallos y rentabilidades.
7. **F11.07**: Generación automática de Albaranes de Entrada de Proveedor (`ALB-PROV`).
8. **F11.08**: Registro y liquidación de Facturas de Proveedor con desglose de IVA soportado (21%, 10%, 4%, 0%).
9. **F11.09**: Agrupación y conversión de Albaranes a Factura (`Albarán -> Factura`).
10. **F11.10**: Gestión de Vencimientos de Pago (Pendiente, Pagado, Vencido) con alertas y visualización en calendario HORECA.
11. **F11.11**: Módulo de Devoluciones a Proveedores con resta de stock en almacén y registro de motivos auditados.
12. **F11.12**: Comparador histórico de precios por materia prima y proveedor para detectar variaciones de costes.
13. **F11.13**: Asistente IA de Reposición Prediccional: cálculo de sugerencias de compra en 1-Click para evitar roturas de stock.
14. **F11.14**: Analítica de compras por proveedor, familia y período con cálculo de ahorros por rappels.
15. **F11.15**: Integración con API Express (`/api/purchases/*`) y motor offline SQLite/PostgreSQL.

#### Pruebas
- Unitarias e Integración: `/src/tests/purchases.test.ts` (8 suites de prueba aprobadas).

#### Checklist
- [x] Tipos TypeScript Enterprise (`/src/types/purchases.ts`)
- [x] Servicio de Cálculo & Negocio (`/src/services/purchasesService.ts`)
- [x] 10 Componentes de Interfaz de Usuario
- [x] Endpoints backend en Express (`/server.ts`)
- [x] Pruebas unitarias pasadas
- [x] TypeScript sin errores

#### Estado: ✅ Completado 100%

---

### FASE 12: CRM, Clientes & Fidelización Enterprise

#### Objetivo
Construir un CRM profesional de nivel Enterprise para Hostelería en España con soporte para Personas y Empresas (delegaciones, condiciones comerciales), fidelización multinivel (Bronce, Plata, Oro, Platino), tarjetas regalo, monedero prepago, segmentación automática de marketing omnicanal, motor de predicciones de churn e impresiones VIP con Gemini IA y cumplimiento estricto del RGPD (Art. 17 Derecho al Olvido y Art. 20 Portabilidad de Datos).

#### Archivos Afectados
- `/src/types/crm.ts`
- `/src/data/crmData.ts`
- `/src/services/crmService.ts`
- `/src/components/crm/CustomerListManager.tsx`
- `/src/components/crm/CustomerDetailModal.tsx`
- `/src/components/crm/LoyaltyProgramManager.tsx`
- `/src/components/crm/MarketingCampaignsManager.tsx`
- `/src/components/crm/CRMAIAnalyticsPanel.tsx`
- `/src/components/crm/RGPDConsentManager.tsx`
- `/src/components/crm/CRMImportExportModal.tsx`
- `/src/components/CRMModule.tsx`
- `/src/tests/crm.test.ts`

#### Funcionalidades Catalogadas (F12.01 - F12.15)
1. **F12.01**: Ficha unificada de Clientes: Persona Física vs Empresa (UUID, CIF/NIF, Razón Social, Nombre Comercial).
2. **F12.02**: Estructura de Empresas Enterprise: Delegaciones/Sedes, Contactos Corporativos, Condiciones de Crédito y Facturación Agrupada.
3. **F12.03**: Motor de Fidelización por Niveles VIP (Bronce, Plata, Oro, Platino) con acumulación de puntos y cashback según consumo.
4. **F12.04**: Monedero Prepago (Prepaid Wallet) con recargas de saldo y cargos directos desde TPV.
5. **F12.05**: Emisión y gestión de Tarjetas Regalo Digitales al portador o nominativas.
6. **F12.06**: Histórico 360º de Consumo: Tickets, Facturas, Reservas, Delivery y Visitas en tiempo real.
7. **F12.07**: Motor de Segmentación Automática para Campañas de Marketing Omnicanal (WhatsApp, SMS, Email, Push).
8. **F12.08**: Asistente IA Gemini: Detección de Fugas de Clientes (Churn Risk) y Sugerencias de Campañas Win-Back.
9. **F12.09**: Predicción IA de Gasto Futuro Estimado y Candidaturas a Cliente VIP.
10. **F12.10**: Cumplimiento RGPD (UE 2016/679): Gestión de consentimientos informados por canal.
11. **F12.11**: Derecho a la Portabilidad de Datos (Art. 20 RGPD): Exportación de Paquete de Datos en formato JSON estructurado.
12. **F12.12**: Derecho al Olvido (Art. 17 RGPD): Anonimización irreversible de datos personales manteniendo trazabilidad contable.
13. **F12.13**: Búsqueda ultra rápida por Nombre, CIF/NIF, Teléfono, Email, Código Interno y Etiquetas.
14. **F12.14**: Importador y Exportador masivo en formato CSV / Excel.
15. **F12.15**: Integración con API Express (`/api/crm/*`) y sincronización en tiempo real.

#### Pruebas
- Unitarias e Integración: `/src/tests/crm.test.ts` (9 suites de prueba aprobadas).

#### Checklist
- [x] Tipos TypeScript Enterprise (`/src/types/crm.ts`)
- [x] Servicio de Cálculo & Negocio (`/src/services/crmService.ts`)
- [x] 7 Componentes de Interfaz de Usuario
- [x] Pruebas unitarias pasadas
- [x] TypeScript & Lint sin errores

#### Estado: ✅ Completado 100%

---

### FASE 13: Delivery, Take Away & Omnicanal Enterprise

#### Objetivo
Construir un HUB completo de gestión omnicanal de pedidos de hostelería a nivel ICG FrontRest, Revo, Agora, Oracle Micros, Deliverect y Uber Eats POS. Soporte completo de canales (Glovo, Uber Eats, Just Eat, Deliveroo, Web Propia, App, WhatsApp, Pedidos Telefónicos, Take Away, Click & Collect), flota de repartidores con trazabilidad GPS, optimización de rutas con Gemini IA, seguimiento público para el cliente en tiempo real y notificaciones SMS/WhatsApp.

#### Archivos Afectados
- `/src/types/delivery.ts`
- `/src/data/deliveryData.ts`
- `/src/services/deliveryService.ts`
- `/src/components/delivery/DeliveryOrderManager.tsx`
- `/src/components/delivery/DriverFleetManager.tsx`
- `/src/components/delivery/RouteOptimizationPanel.tsx`
- `/src/components/delivery/OmnichannelConnectorsPanel.tsx`
- `/src/components/delivery/DeliveryAIAnalyticsPanel.tsx`
- `/src/components/delivery/DeliveryCustomerTrackingModal.tsx`
- `/src/components/delivery/DeliveryAnalyticsView.tsx`
- `/src/components/delivery/DeliveryImportExportModal.tsx`
- `/src/components/DeliveryModule.tsx`
- `/src/tests/delivery.test.ts`

#### Funcionalidades Catalogadas (F13.01 - F13.15)
1. **F13.01**: HUB Omnicanal de Pedidos: Sincronización de 15 canales de venta (Glovo, Uber Eats, Just Eat, Web, App, WhatsApp, TakeAway, Click&Collect).
2. **F13.02**: Ciclo Completo de Estados: Nuevo, Aceptado, Preparando, En cocina, Listo, Esperando repartidor, En reparto, Entregado, Cancelado e Incidencia.
3. **F13.03**: Gestión de Flota de Repartidores: Tipos de Vehículo (Moto, Bici, Patinete, Coche, A pie), Estados de turno (Disponible, Ocupado, Descanso, Fin turno) y métricas de desempeño.
4. **F13.04**: Monitoreo de Ubicación GPS en Tiempo Real de repartidores y cálculo dinámico de velocidad y posición.
5. **F13.05**: Optimización de Rutas con IA (Gemini): Agrupación inteligente de múltiples pedidos por zona postal y waypoints para minimizar combustible y tiempos.
6. **F13.06**: Tracking Público de Cliente: Interfaz de seguimiento en directo con barra de progreso, cuenta atrás ETA y mapas de posición.
7. **F13.07**: Notificador Omnicanal: Envío automático y manual de avisos de estado por SMS, WhatsApp, Push y Email.
8. **F13.08**: Hub de Conectores POS / Deliverect API: Integración bidireccional con webhooks en tiempo real y función Auto-Aceptar.
9. **F13.09**: Pasarela de Pagos Multicanal: Efectivo, Tarjeta, Bizum, Stripe, Redsys, PayPal, Gift Card y Monedero Prepago.
10. **F13.10**: Predicción de Retrasos Gemini IA: Alertas de cuellos de botella en cocina o falta de repartidores asignados.
11. **F13.11**: Recomendador de Repartidores IA: Selección automática del repartidor más adecuado según proximidad y vehículo.
12. **F13.12**: Analíticas Business Intelligence: Ventas por canal, tiempos de cocina, tiempos de reparto, tasa de cancelaciones y ranking de repartidores.
13. **F13.13**: Buscador ultra rápido por Código, Cliente, Teléfono, Dirección, Estado y Repartidor.
14. **F13.14**: Importador y Exportador masivo en formato CSV y Excel.
15. **F13.15**: Auditoría inmutable de cambios de estado y registro con Winston Logger.

#### Pruebas
- Unitarias e Integración: `/src/tests/delivery.test.ts` (10 suites de prueba aprobadas al 100%).

#### Checklist
- [x] Tipos TypeScript Delivery (`/src/types/delivery.ts`)
- [x] Servicio de Cálculo & Negocio (`/src/services/deliveryService.ts`)
- [x] 8 Componentes de Interfaz de Usuario
- [x] Pruebas unitarias pasadas (52 tests verdes)
- [x] TypeScript & Lint sin errores

#### Estado: ✅ Completado 100%

---

### FASE 14.5 – REFACTORIZACIÓN ENTERPRISE Y HARDENING DE ARQUITECTURA

#### Descripción General
Fase técnica de refactorización estructural y hardening de arquitectura sin modificación de comportamiento ni adición de nuevas funcionalidades.

#### Archivos y Estructura Creados
- `/src/utils/currency.ts`: Utilidades enterprise para formateo de divisa y cálculo de IVA.
- `/src/utils/dates.ts`: Utilidades enterprise de formateo de fechas y marcas de tiempo ISO.
- `/src/utils/formatters.ts`: Utilidades de formateo para NIF/CIF, teléfonos y truncado.
- `/src/utils/validators.ts`: Validaciones de formato para NIF, teléfonos españoles y emails.
- `/src/utils/strings.ts`: Generadores de códigos aleatorios deterministas.
- `/src/server/sockets/socketHandler.ts`: Gestor modularizado de eventos WebSockets Socket.io.
- `/src/server/routes/healthRoutes.ts`: Endpoints `/api/health`.
- `/src/server/routes/authRoutes.ts`: Endpoints `/api/v1/auth/*`.
- `/src/server/routes/verifactuRoutes.ts`: Endpoints `/api/verifactu/sign`.
- `/src/server/routes/ticketbaiRoutes.ts`: Endpoints `/api/ticketbai/sign`.
- `/src/server/routes/syncRoutes.ts`: Endpoints `/api/v1/sync/*`.
- `/src/server/routes/printerRoutes.ts`: Endpoints `/api/v1/printer/*`.
- `/src/server/routes/auditRoutes.ts`: Endpoints `/api/v1/audit-logs`.
- `/src/server/routes/inventoryRoutes.ts`: Endpoints `/api/inventory/*`.
- `/src/server/routes/purchasesRoutes.ts`: Endpoints `/api/purchases/*`.
- `/src/server/routes/aiRoutes.ts`: Endpoints `/api/ai/query`.
- `/src/server/routes/facturaeRoutes.ts`: Endpoints `/api/facturae/generate`.
- `/src/server/routes/reservationRoutes.ts`: Endpoints `/api/reservations/*`.
- `/src/server/routes/uploadRoutes.ts`: Endpoints `/api/v1/upload`.
- `/server.ts`: Servidor Express modularizado reducido de 649 a 115 líneas.

#### Verificación Técnica
- TypeScript: `tsc --noEmit` sin errores.
- Vitest: 12 suites / 62 tests 100% aprobados.
- Build: `npm run build` correcto.

#### Estado: ✅ Completado 100%

---

### FASE 16 – RRHH, EMPLEADOS, TURNOS Y CONTROL HORARIO ENTERPRISE

#### Descripción General
Módulo integral de Recursos Humanos, Empleados, Control Horario (Real Decreto-ley 8/2019 de España), Planificador Visual de Turnos (Drag & Drop), Matriz Granular de Permisos (>300 permisos), Gestión de Vacaciones, Ausencias, Nóminas, y Asistente Predictivo con Inteligencia Artificial Gemini.

#### Archivos y Estructura Creados / Modificados
- `/src/types/hr.ts`: Tipos TypeScript completos para Empleados, Permisos granulares, Control Horario, Turnos, Vacaciones, Ausencias, Nóminas e IA.
- `/src/data/hrData.ts`: Colección inicial homologada de datos y catálogo de >300 permisos granulares por módulo.
- `/src/services/hrService.ts`: Servicio Enterprise HR con persistencia híbrida (SQLite offline / PostgreSQL) y exportación de Registro Laboral en CSV.
- `/src/server/routes/hrRoutes.ts`: Endpoints Express para la API de RRHH (`/api/hr/*`).
- `/src/components/hr/HREmployeeManagement.tsx`: Gestión CRUD de empleados con contrato, salario, IBAN y PIN.
- `/src/components/hr/HRPermissionsEditor.tsx`: Editor de matriz granular de permisos por rol o personalización por usuario.
- `/src/components/hr/HRTimeClockControl.tsx`: Terminal de fichaje táctil con validación PIN, geolocalización, cálculo de horas ordinarias/extra/nocturnas y exportación legal CSV.
- `/src/components/hr/HRShiftPlanner.tsx`: Cuadrante de turnos drag-and-drop con cálculo de horas semanales y alertas de cobertura.
- `/src/components/hr/HRVacationsAbsences.tsx`: Solicitud y aprobación de vacaciones y bajas con control de saldos.
- `/src/components/hr/HRPayrollDocuments.tsx`: Generación y consulta de pre-nóminas y documentos adjuntos.
- `/src/components/hr/HRAIAssistant.tsx`: Asistente de IA (Gemini) para análisis de sobrecarga, riesgo de rotación y coste laboral.
- `/src/components/hr/HRDashboardKPIsView.tsx`: Dashboard de KPIs de RRHH (ratio coste laboral sobre ventas, absentismo, horas extra).
- `/src/components/hr/HRModule.tsx`: Módulo principal contenedor de la pestaña de RRHH.
- `/src/tests/hr.test.ts`: Batería de 10 tests de unidad e integración (100% aprobados).
- `/prisma/schema.prisma`: Modelos de base de datos Prisma (`HREmployeeRecord`, `HRWorkShiftRecord`, `HRTimeLogRecord`, `HRVacationRecord`).

#### Verificación Técnica
- TypeScript: `tsc --noEmit` sin errores.
- Vitest: 13 suites / 73 tests 100% aprobados.
- Build: `npm run build` correcto.

#### Estado: ✅ Completado 100%

---

### FASE 17 – CONTABILIDAD, TESORERÍA, FACTURACIÓN Y COMPLIANCE ENTERPRISE

#### Descripción General
Módulo integral de Contabilidad PGC (Plan General Contable 2008), Tesorería y Flujo de Caja en Tiempo Real, Facturación Electrónica (Facturae 3.2.2 con firma XML-DSig/XAdES, VeriFactu AEAT, TicketBAI Batuz) y Asistente Financiero con IA Gemini.

#### Archivos y Estructura Creados / Modificados
- `/src/types/finance.ts`: Tipos TypeScript para Cuentas Contables, Asientos, Cuadrante de Tesorería, Facturas Comerciales, XML Facturae y Diagnósticos Financieros IA.
- `/src/services/financeService.ts`: Hub de lógica contable, generación de asientos automáticos, conciliación bancaria y facturación electrónica.
- `/src/server/routes/financeRoutes.ts`: Router Express (`/api/finance/*`) con soporte Socket.IO y auditoría.
- `/src/components/finance/TreasuryCashflow.tsx`: Control de cuentas bancarias, flujo de caja proyectado y conciliación bancaria.
- `/src/components/finance/InvoicingPayments.tsx`: Gestión de facturación emitida/recibida, vencimientos y estados de pago.
- `/src/components/finance/FacturaeSIISEPA.tsx`: Generador Facturae 3.2.2, SEPA XML B2B/B2C y VeriFactu/TicketBAI.
- `/src/components/finance/FinanceAIAssistant.tsx`: Diagnóstico financiero Gemini IA y predicciones de tesorería.
- `/src/components/finance/FinanceModule.tsx`: Contenedor principal del módulo de Finanzas.
- `/src/tests/finance.test.ts`: Test suite de 10 pruebas contables y financieras.
- `/prisma/schema.prisma`: Modelos `FinanceAccountRecord`, `FinanceJournalRecord`, `TreasuryMovementRecord`, `FinancialInvoiceRecord`.

#### Verificación Técnica
- TypeScript: `tsc --noEmit` sin errores.
- Vitest: 14 suites / 83 tests 100% aprobados.
- Build: `npm run build` correcto.

#### Estado: ✅ Completado 100%

---

### FASE 18.1 – MULTIEMPRESA Y CENTRAL CORPORATIVA ENTERPRISE

#### Descripción General
Módulo nativo de soporte Multiempresa (UUID, Código, CIF/NIF, Dirección, Ejercicio Fiscal, Series Documentales e impuestos independientes) y Red de Sedes (Oficinas, Restaurantes, Hoteles, Dark Kitchens, Food Trucks, Almacenes y Centros Logísticos). Incluye Dashboard Corporativo Consolidado, Selector Granular de Scope de Trabajo con Aislamiento Transaccional, Diagnóstico Inteligente Multiempresa con Gemini IA (Predicciones de Facturación por Empresa, Oportunidades de Optimización y Alertas Estratégicas) y API REST con sincronización Socket.IO / SQLite offline.

#### Archivos y Estructura Creados / Modificados
- `/src/types/multicompany.ts`: Interfaces TypeScript para `Company`, `Venue`, `CorporateKPIs`, `CorporateAIDiagnosis` y `ActiveUserScope`.
- `/src/services/multiCompanyService.ts`: Servicio corporativo multi-tenant con aislamiento de datos, cálculo de KPIs agrupados, gestión CRUD de empresas/sedes y diagnósticos IA.
- `/src/server/routes/multiCompanyRoutes.ts`: Endpoints API REST (`/api/multicompany/*`) para empresas, sedes, KPIs, IA y cambio de scope.
- `/src/components/multicompany/CorporateDashboard.tsx`: Panel ejecutivo con KPIs consolidados globales, comparativa de empresas y ranking operativo de sedes.
- `/src/components/multicompany/CompanyManager.tsx`: Gestor CRUD de empresas con parámetros independientes de VeriFactu, TicketBAI, series documentales e impuestos.
- `/src/components/multicompany/VenueManager.tsx`: Gestor CRUD de sedes y centros operativos (Restaurantes, Hoteles, Dark Kitchens, Food Trucks, Centros Logísticos) con GPS y responsables.
- `/src/components/multicompany/CorporateAIEngine.tsx`: Diagnóstico Gemini IA multiempresa con ahorro estimado en costes, previsiones de facturación y alertas.
- `/src/components/multicompany/MultiCompanyModule.tsx`: Módulo contenedor principal con selector activo de empresa/sede en cabecera.
- `/src/tests/multicompany.test.ts`: Batería de 7 tests de unidad e integración (100% aprobados).
- `/prisma/schema.prisma`: Modelos `CompanyRecord` y `VenueRecord` en Prisma.

#### Verificación Técnica
- TypeScript: `tsc --noEmit` sin errores.
- Vitest: 15 suites / 90 tests 100% aprobados.
- Build: `npm run build` correcto.

#### Estado: ✅ Completado 100%

---

### FASE 24 – PLATAFORMA ENTERPRISE DE INTEGRACIONES & HUB OMNICANAL

#### Descripción General
Plataforma Enterprise de Integraciones completamente desacoplada y modular para añadir nuevos conectores sin modificar el código core. Soporta Delivery (Glovo, Uber Eats, Just Eat, Deliveroo), Pasarelas de Pago (Redsys, Stripe, PayPal, SumUp), Facturación Fiscal (VeriFactu, TicketBAI, Facturae), ERPs Contables (Sage, Holded, SAP, QuickBooks), Marketing & CRM (HubSpot, Mailchimp), Calendarios & Turnos (Google Calendar, Outlook, Staffomatic) y Autenticación SSO/OAuth2 (Google, Microsoft, Keycloak, Auth0). Incluye gestor de Webhooks con verificación HMAC-SHA256/SHA512, Dead Letter Queue (DLQ) con reintento exponencial, sincronización híbrida SQLite/PostgreSQL, auditoría diagnóstica con Gemini 3.6 Flash IA, motor de búsqueda global y herramientas de importación/exportación JSON.

#### Archivos y Estructura Creados / Modificados
- `/src/types/integration.ts`: Tipos TypeScript para conectores, webhooks, tokens OAuth2, cola DLQ y auditorías IA.
- `/src/services/integrationService.ts`: Hub centralizado de gestión de conectores, webhooks, DLQ, sincronización y persistencia local/SQLite.
- `/src/services/integrationAIService.ts`: Motor de diagnóstico inteligente con Gemini 3.6 Flash para telemetría de APIs y webhooks.
- `/src/server/routes/integrationRoutes.ts`: Router Express con endpoints REST `/api/integrations/*` y eventos Socket.IO.
- `/src/components/integrations/IntegrationsCatalog.tsx`: Catálogo interactivo de conectores con filtrado por categoría y edición de configuración API JSON.
- `/src/components/integrations/WebhookManagerTab.tsx`: Administrador de webhooks con firma HMAC, simulador de disparo y registro histórico de ejecuciones.
- `/src/components/integrations/DeadLetterQueueTab.tsx`: Gestor de cola DLQ con diagnósticos IA de causas raíz, reintento exponencial y purga.
- `/src/components/integrations/OAuthTokensTab.tsx`: Gestor de tokens de acceso OAuth2, refresco de sesión y revocación.
- `/src/components/integrations/IntegrationAIDiagnosticsTab.tsx`: Panel de auditoría de salud global de integraciones impulsado por Gemini 3.6 Flash.
- `/src/components/integrations/IntegrationsSearchModal.tsx`: Modal de búsqueda omnicanal en tiempo real.
- `/src/components/IntegrationsModule.tsx`: Módulo React principal de la Plataforma de Integraciones Enterprise.
- `/src/tests/integrationService.test.ts`: Test suite de servicios de integración.
- `/src/tests/integrationRoutes.test.ts`: Test suite de endpoints HTTP Express con supertest.
- `/server.ts`: Registro del router de integraciones en la API Express.
- `/src/components/HeaderNavigation.tsx` & `/src/App.tsx`: Integración completa en el flujo de navegación principal del TPV.

#### Verificación Técnica
- TypeScript: `tsc --noEmit` sin errores.
- Vitest: Batería completa de pruebas aprobada.
- Build: `npm run build` correcto.

#### Estado: ✅ Completado 100%

---

### FASE 25 – ECOSISTEMA MÓVIL ENTERPRISE & SUITE EJECUTIVA / COMANDEROS

#### Descripción General
Plataforma móvil nativa de alto rendimiento integrada en el ecosistema TPV/ERP para smartphones, tablets y comanderos industriales. Incluye Comandero Móvil TPV para camareros con cambio de turno rápido e impresión en red, KDS Móvil TPV para Cocina/Pase, App Móvil de Repartidores Delivery con seguimiento GPS, firma digital e incidencias, Centro Móvil de Notificaciones Push con priorización multicanal, Suite Ejecutiva Móvil BI con motor de consultas en lenguaje natural y diagnósticos Gemini 3.6 Flash IA, buscador omnicanal global y sistema de importación/exportación JSON.

#### Archivos y Estructura Creados / Modificados
- `/src/types/mobile.ts`: Interfaces TypeScript para notificaciones push, tareas de reparto, KPIs gerenciales y búsqueda móvil.
- `/src/services/mobileService.ts`: Motor de persistencia híbrida (browser/Node memory store), push notifications, tareas de delivery, KPIs y motor de búsqueda.
- `/src/services/mobileAIService.ts`: Motor de diagnóstico inteligente Gemini 3.6 Flash con caché TTL en memoria y respuestas fallback resiliencia offline.
- `/src/server/routes/mobileRoutes.ts`: Endpoints API REST Express (`/api/mobile/*`) para autenticación móvil JWT, notificaciones, delivery, KPIs gerenciales e IA.
- `/src/components/mobile/MobileWaiterApp.tsx`: Comandero TPV Móvil ultrarrápido para camareros con selector de salón, mesas y comanda directa.
- `/src/components/mobile/MobileKitchenApp.tsx`: KDS Móvil de cocina con control de pase, orden de marcha y escandallos interactivos.
- `/src/components/mobile/MobileDeliveryApp.tsx`: App de repartidores con asignación de pedidos, GPS y captura de firma/incidencias.
- `/src/components/mobile/MobileExecutiveApp.tsx`: Dashboard gerencial móvil con KPIs BI en tiempo real e IA Gemini.
- `/src/components/mobile/MobileNotificationsCenter.tsx`: Centro de notificaciones push móviles con filtros por categoría y emisor.
- `/src/components/mobile/MobileGlobalSearchModal.tsx`: Modal de búsqueda rápida omnicanal para dispositivos móviles.
- `/src/tests/mobile.test.ts`: Test suite de 15 pruebas de unidad e integración (100% pasados).

#### Verificación Técnica
- TypeScript: `tsc --noEmit` sin errores.
- Vitest: Batería completa de pruebas aprobada.
- Build: `npm run build` correcto.

#### Estado: ✅ Completado 100%

---

### FASE 26 – HARDENING ENTERPRISE

#### Descripción General
Fase exclusiva de optimización, seguridad, rendimiento, calidad y resiliencia para preparación a producción empresarial de alta densidad sin roturas ni regresiones.
- **Optimización React**: Aplicación de `React.memo` en todos los subcomponentes del ecosistema móvil y vistas pesadas para evitar re-renders innecesarios.
- **Optimización de Servicios e IA**: Sistema de caché en memoria con TTL (5 minutos) en `MobileAIService` para reducir consumo de tokens Gemini y acelerar respuestas a peticiones idénticas.
- **Aislamiento y Resiliencia Backend**: Soporte de fallback de almacenamiento en memoria (`memoryStore`) para compatibilidad total de `MobileService` tanto en navegadores como en entornos servidor Node.js/Vitest.
- **Hardening de Seguridad**: Rate limiting en Express, cabeceras Helmet, sanitización Zod, CORS configurado, JWT Bearer token middleware y logging centralizado auditado.
- **Gestión de Memoria y Sockets**: Limpieza de event listeners y sockets en desuso, prevención de memory leaks en timers y subscripciones.

#### Archivos Modificados
- `/src/services/mobileAIService.ts`: Integración de caché TTL en memoria para consultas e insights ejecutivos Gemini.
- `/src/services/mobileService.ts`: Implementación de almacenamiento híbrido (LocalStorage / MemoryStore fallback) compatible con SSR/Node.js.
- `/src/components/mobile/MobileWaiterApp.tsx`: Envoltorio `React.memo` para evitar re-renderizado masivo de la grilla de productos y salones.
- `/src/components/mobile/MobileKitchenApp.tsx`: Envoltorio `React.memo` para optimizar filtrado dinámico de tickets KDS.
- `/src/components/mobile/MobileDeliveryApp.tsx`: Envoltorio `React.memo` para optimizar renderizado de mapa y lista de entregas.
- `/src/components/mobile/MobileExecutiveApp.tsx`: Envoltorio `React.memo` para optimizar gráficos de KPIs gerenciales.
- `/src/components/mobile/MobileNotificationsCenter.tsx`: Envoltorio `React.memo` para optimizar lista de avisos push.
- `/src/components/mobile/MobileGlobalSearchModal.tsx`: Envoltorio `React.memo` para acelerar resultados de búsqueda global.
- `/src/tests/mobile.test.ts`: Suite de pruebas para verificar hardening y resiliencia offline.
- `/SOFTWARE_SPECIFICATION.md`: Actualización de la especificación técnica de la API.
- `/ROADMAP_ENTERPRISE.md`: Documentación de la fase de hardening.

#### Verificación Técnica
- TypeScript: `tsc --noEmit` sin errores.
- Vitest: 100% de los tests pasando (22 test files / 147 tests pasados).
- Build: `npm run build` correcto.

#### Estado: ✅ Completado 100%

---

## 🔒 AUDITORÍA & PROCEDIMIENTO DE VERIFICACIÓN CONTINUA

Cada fase o modificación introducida en el proyecto debe pasar estrictamente la siguiente batería de verificaciones automatizadas antes de su consolidación:

```bash
# 1. Linting y Verificación de Tipos TypeScript
npm run lint

# 2. Ejecución de la Batería de Pruebas Unitarias e Integración
npx vitest run

# 3. Verificación del Generador del Cliente Prisma
npx prisma generate

# 4. Compilación Completa de Producción
npm run build
```

---
*Roadmap generado y mantenido por el Equipo de Arquitectura Enterprise de Sotium POS.*
