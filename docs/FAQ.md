# Preguntas Frecuentes (FAQ) - Sotium POS Enterprise

---

## 📌 Preguntas Generales

### **1. ¿Qué es Sotium POS Enterprise?**
Sotium POS Enterprise es un software de gestión hostelera y punto de venta integral diseñado para restaurantes, cafeterías, discotecas, colectividades y cadenas de franquicias.

### **2. ¿Sotium POS funciona sin conexión a Internet (Offline)?**
**Sí, totalmente.** Sotium POS implementa una arquitectura Offline-First impulsada por un motor SQLite embebido (`better-sqlite3`). Permite seguir abriendo mesas, tomando comandas en barra/comedor, cobrando tiques e imprimiendo en cocina sin interrupciones. En cuanto se restablece la conexión, las ventas se sincronizan automáticamente con el servidor central de PostgreSQL.

---

## 🛠️ Hardware e Impresoras

### **3. ¿Qué impresoras de tiques y comandas son compatibles?**
Sotium POS soporta impresoras de tiques térmicas ESC/POS de 80mm y 58mm conectadas mediante:
* **Ethernet / Wi-Fi (IP Fija o DHCP):** Recomendado para cocina y barra (Puerto por defecto 9100).
* **USB:** Mediante controladores del sistema operativo.
* **Serie / RS232:** Para balanzas e impresoras de caja.

### **4. ¿Es compatible con cajones portamonedas automáticos?**
Sí, soporta la apertura automática de cajones inteligentes mediante pulso RJ11 desde la impresora de tiques principal o comunicación directa RS232/USB.

---

## 🧾 Normativa Fiscal (Veri*Factu / TicketBAI)

### **5. ¿Cumple Sotium POS con la Ley Antifraude y Veri*Factu de la AEAT?**
**Sí.** Sotium POS genera el encadenamiento inmutable de facturas/tiques mediante algoritmos criptográficos SHA-256, incluyendo el registro previo, el código QR regulatorio y el registro de eventos no alterables.

### **6. ¿Es compatible con TicketBAI para el País Vasco?**
**Sí.** Sotium POS genera las entregas XML firmadas electrónicamente para las Haciendas Forales de Gipuzkoa, Bizkaia y Álava, incluyendo la generación del identificador TBAI y código QR en el tique impreso.

---

## 🧠 Inteligencia Artificial Gemini

### **7. ¿Qué funciones realiza la IA Gemini 2.5 Flash en el sistema?**
La IA de Google Gemini integrada en Sotium POS realiza:
* **Predicción de Ventas:** Estima la demanda de platos por tramos horarios y meteorología.
* **Optimización de Compras:** Analiza variaciones de precios de proveedores y sugiere cantidades de pedido.
* **Control de Costes y Mermas:** Identifica desviaciones entre escandallos teóricos y consumo real.
* **Asistente Conversacional:** Responde a preguntas directas de dirección (ej: "¿Cuál fue el plato más rentable del fin de semana?").

---

## 💻 Compatibilidad de Dispositivos

### **8. ¿Qué dispositivos pueden utilizarse como comanderos móviles?**
Cualquier smartphone o tablet con navegador web moderno (iOS Safari, Android Chrome/Edge) puede conectarse a la red local del restaurante y funcionar como comandero táctil de mesa.

---

## 🔒 Seguridad y Usuarios

### **9. ¿Cómo se gestionan los permisos de los empleados?**
El sistema implementa Control de Acceso Basado en Roles (RBAC) con roles predefinidos (Camarero, Cocina, Repartidor, Encargado, Gerente, Administrador) y permite definir permisos personalizados por empleado.
