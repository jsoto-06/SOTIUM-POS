# Especificación de Inteligencia Artificial Gemini - Sotium POS Enterprise

---

## 📌 Índice
1. [Visión General de la Integración con Gemini AI](#1-visión-general)
2. [Modelos y SDK de Google Gemini (`@google/genai`)](#2-modelos-y-sdk)
3. [Casos de Uso Implementados](#3-casos-de-uso-implementados)
   - [3.1 Predicción de Demanda de Ventas (BI)](#31-predicción-de-demanda-de-ventas)
   - [3.2 Asistente Analítico de Compras y Precios](#32-asistente-analítico-de-compras-y-precios)
   - [3.3 Asistente Conversacional de RRHH](#33-asistente-conversacional-de-rrhh)
   - [3.4 Auditoría de Calidad APPCC e Higiene](#34-auditoría-de-calidad-appcc)
   - [3.5 Asistente Técnico de Mantenimiento y SAT](#35-asistente-técnico-de-mantenimiento)
4. [Motor de Reglas Deterministas (Fallback & Resiliencia)](#4-motor-de-reglas-deterministas)
5. [Seguridad, Privacidad de Datos y Control de Tokens](#5-seguridad-y-privacidad)

---

## 1. Visión General

**Sotium POS Enterprise** incorpora la tecnología de inteligencia artificial generativa de **Google Gemini 2.5 Flash** mediante el SDK oficial `@google/genai`.

A diferencia de aplicaciones convencionales que se limitan a mostrar tableros estáticos, Sotium POS actúa como un **copiloto analítico activo** para gerentes y propietarios de restaurantes, transformando datos brutos de ventas, compras, escandallos y personal en decisiones estratégicas accionables.

---

## 2. Modelos y SDK

* **SDK Oficial:** `@google/genai` (v2.4.0)
* **Modelo Primario:** `gemini-2.5-flash` (Optimizado para latencia ultrabaja y costo-eficiencia en respuestas estructuradas JSON).
* **Ejecución Server-Side:** Todas las llamadas a la API de Gemini se ejecutan exclusivamente en el backend Node.js (`src/services/` y `src/server/routes/aiRoutes.ts`), evitando la exposición de la API Key en el navegador del usuario.

---

## 3. Casos de Uso Implementados

### 3.1 Predicción de Demanda de Ventas (BI)
* **Servicio:** `BIAIService` (`src/services/biAIService.ts`)
* **Función:** Analiza el historial de facturación por tramos horarios, categoría de platos y día de la semana para predecir la afluencia de comensales y recomendar la preparación de mise en place en cocina.

### 3.2 Asistente Analítico de Compras y Precios
* **Servicio:** `PurchasesService` & `AIPurchasesAssistant`
* **Función:** Detecta incrementos de precio inusuales en materia prima enviados por proveedores en albaranes y sugiere renegociaciones o sustitutos.

### 3.3 Asistente Conversacional de RRHH
* **Servicio:** `HRAIAssistant` (`src/components/hr/HRAIAssistant.tsx`)
* **Función:** Evalúa la productividad por camarero, identifica desviaciones en horas extra y sugiere la redistribución óptima de turnos de trabajo.

### 3.4 Auditoría de Calidad APPCC e Higiene
* **Servicio:** `QualityHaccpAIService`
* **Función:** Analiza desviaciones en los registros de temperatura de cámaras frigoríficas y genera recomendaciones de acción correctora.

---

## 4. Motor de Reglas Deterministas (Fallback & Resiliencia)

Para garantizar que el sistema funcione al 100% incluso en ausencia de clave de API de Gemini (`GEMINI_API_KEY`), cuotas agotadas o desconexión a Internet, todos los servicios de IA incluyen un **Motor de Reglas Deterministas Local**:

```typescript
// Ejemplo de estrategia Fallback en BIAIService
public async predictSalesDemand(data: SalesSummary): Promise<AIPredictionItem[]> {
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return this.parseGeminiResponse(response);
    } catch (err) {
      logger.warn('[BIAIService] Gemini API fallback to deterministic engine');
    }
  }
  return this.getLocalFallbackPredictions(data);
}
```

---

## 5. Seguridad, Privacidad de Datos y Control de Tokens

1. **Anonimización:** Ningún dato personal identificable de clientes (nombres, NIF, correos) ni datos bancarios es enviado a los modelos de IA. Únicamente se procesan agregados numéricos y de categorías.
2. **Caché Local de Consultas:** Para minimizar el consumo de tokens y acelerar las respuestas, las analíticas de Gemini se almacenan en caché local por intervalos de 15 minutos.
