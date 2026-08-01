# Guía de Contribución a Sotium POS Enterprise

Gracias por su interés en contribuir a **Sotium POS Enterprise**. Este documento proporciona las directrices y normas de calidad necesarias para colaborar en el desarrollo de la plataforma.

---

## 📌 Principios Generales

Sotium POS es una plataforma de grado Enterprise para el sector de la hostelería. Como tal, cualquier código contribuido debe cumplir con los siguientes estándares de excelencia:

1. **Clean Architecture & SOLID:** Respetar la separación estricta entre capa de presentación (React), capa de negocio (Services), capa de transporte (Express/Sockets) y capa de persistencia (Prisma/SQLite).
2. **TypeScript Estricto:** Prohibido el uso del tipo `any`. Todos los parámetros, retornos de funciones y estados deben estar explícitamente tipados.
3. **Validación Zod:** Todas las entradas de datos en la API REST deben ser validadas mediante esquemas Zod en `src/validators/`.
4. **Pruebas Automatizadas:** Cada corrección o nueva funcionalidad debe incluir su correspondiente suite de pruebas en `src/tests/` utilizando Vitest.
5. **Formato e Identación:** Respetar la configuración de formateo del proyecto y pasar la validación `npm run lint` (`tsc --noEmit`) sin errores ni advertencias.

---

## 🛠️ Flujo de Trabajo (Git Workflow)

1. **Fork y Clonado:**
   Cree un fork del repositorio oficial e instale las dependencias locales.

2. **Creación de Rama:**
   Cree una rama descriptiva siguiendo la convención de nombres:
   - `feature/nombre-funcionalidad`
   - `fix/descripcion-error`
   - `docs/nombre-documento`
   - `refactor/modulo-afectado`

3. **Desarrollo y Commits:**
   Utilice Commits Convencionales (Conventional Commits):
   ```text
   feat(tpv): agregar soporte para cobro con Bizum en comandero
   fix(kds): corregir leak de listeners de Socket.IO en KDS
   docs(api): actualizar documentacion de endpoints de inventario
   ```

4. **Verificación Local Obligatoria:**
   Antes de enviar una Pull Request, ejecute obligatoriamente:
   ```bash
   npm run lint
   npx vitest run
   npm run build
   ```

5. **Pull Request (PR):**
   Abra una Pull Request hacia la rama `main`. Describa detalladamente los cambios realizados, la motivación del problema y adjunte capturas de pantalla o logs de ejecución si aplica.

---

## 🧪 Estructura de Tests

Los tests deben ubicarse en `src/tests/` siguiendo el patrón `[nombre_modulo].test.ts`.
Asegúrese de probar:
- Casos de éxito (Happy Path)
- Manejo de errores y excepciones
- Casos límite e inconsistencias de datos

---

## 🔒 Código de Conducta y Seguridad

Por favor consulte nuestro [Código de Conducta](./CODE_OF_CONDUCT.md) y nuestra [Política de Seguridad](./SECURITY.md) para informar sobre vulnerabilidades.
