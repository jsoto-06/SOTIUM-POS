# Política de Seguridad - Sotium POS Enterprise

En **Sotium POS Enterprise**, la seguridad de los datos financieros, fiscales, personales y transaccionales de nuestros clientes es una prioridad crítica.

---

## 🛡️ Versiones Soportadas

| Versión | Soportada para Actualizaciones de Seguridad |
| :--- | :---: |
| `1.0.x-enterprise` | ✅ Sí |
| `< 1.0.0` | ❌ No |

---

## 🔍 Notificación de Vulnerabilidades

Si descubre una vulnerabilidad de seguridad en Sotium POS Enterprise, **NO abra una Issue pública en GitHub**.

En su lugar, notifique el hallazgo al equipo de respuesta de seguridad enviando un correo electrónico a:

📧 **security@sotium.com**

Por favor incluya en el reporte:
1. Una descripción detallada del problema y la superficie de ataque.
2. Pasos reproducibles o una prueba de concepto (PoC).
3. El potencial impacto de la vulnerabilidad en entornos de producción.

---

## ⏱️ Compromiso de Respuesta

* **Recepción e Inicialización:** Responderemos a su informe dentro de las 24 horas hábiles confirmando la recepción.
* **Evaluación y Triaje:** Evaluaremos la severidad (CVSS v3) en un plazo no superior a 72 horas.
* **Solución y Parche:** Emitiremos un parche de seguridad y actualización dentro de un periodo acordado según la criticidad (vulnerabilidades críticas < 7 días).

---

## 🔒 Mecanismos de Seguridad Implementados

1. **Autenticación & Autorización:**
   - Tokens JWT firmados con algoritmos HMAC-SHA256 y expiración configurable.
   - Hashing de contraseñas mediante **Bcrypt** con costo de cálculo adecuado.
   - Control de Acceso Basado en Roles (RBAC) estricto en cada endpoint API.

2. **Protección en Capa de Red y Aplicación:**
   - **Helmet:** Encabezados de seguridad HTTP (CSP, HSTS, X-Content-Type-Options, Frameguard).
   - **CORS:** Configuración restrictiva de orígenes permitidos.
   - **Rate Limiting:** Limitación de tasa mediante `express-rate-limit` para prevenir ataques de fuerza bruta y DoS.

3. **Validación e Inyección:**
   - Sanitización y validación tipada de todas las entradas REST mediante esquemas **Zod**.
   - Consultas parametrizadas por defecto a través de **Prisma ORM** y **Better-SQLite3**, eliminando cualquier riesgo de Inyección SQL (SQLi).

4. **Auditoría e Inmutabilidad Fiscal:**
   - Registro inmutable de eventos críticos (Veri*Factu, TicketBAI, cierres de caja) con encadenamiento hash SHA-256 e historial de auditoría de usuario.
