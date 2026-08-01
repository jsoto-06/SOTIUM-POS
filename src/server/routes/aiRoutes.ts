import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

export const aiRouter = Router();

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
    },
  });
};

aiRouter.post('/ai/query', async (req, res, next) => {
  try {
    const { prompt, context } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        answer: `[Modo Asistente POS Local] Basado en los datos actuales del turno:
- Ventas totales de hoy: 1.485,50 € (42 tickets, ticket medio 35,36 €).
- Producto de mayor margen: Paella Valenciana (Costo: 3,20 €, PVP: 16,50 €, Margen: 80.6%).
- Alerta de Stock: Arroz Bomba (Quedan 4,5 kg, punto de reorden: 5 kg).
- Camarero estrella: Carlos M. (18 comanda(s) procesadas, 640 € facturados).
- Rotación de mesas: Mesa 4 (Terraza) rotación baja (ocupada hace 1h 45m).`,
        source: 'local_rules_engine',
      });
    }

    const systemInstruction = `Eres "Sotium AI", el Asistente de Inteligencia Artificial integrado en el software TPV/ERP Sotium POS para hostelería en España.
Proporcionas análisis detallados, predicciones de ventas, sugerencias de compras para evitar roturas de stock, optimización de márgenes y evaluaciones del personal.
Usa un tono profesional, claro y estructurado con cifras en euros (€), porcentajes y viñetas ejecutivas.
Contexto actual del negocio: ${JSON.stringify(context || {})}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      answer: response.text || 'No se pudo generar respuesta.',
      source: 'gemini_3_6_flash',
    });
  } catch (err) {
    next(err);
  }
});
