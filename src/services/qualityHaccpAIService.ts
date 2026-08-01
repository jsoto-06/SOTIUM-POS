import { GoogleGenAI } from '@google/genai';
import { QualityHaccpService } from './qualityHaccpService';

export interface QualityAIAnalysisResult {
  riskLevel: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  complianceScore: number; // 0 - 100
  summary: string;
  detectedRisks: {
    category: 'TEMPERATURAS' | 'CADUCIDAD_FEFO' | 'LIMPIEZA' | 'AUDITORIA' | 'PROVEEDORES';
    title: string;
    description: string;
    suggestedCorrectiveAction: string;
    urgency: 'INMEDIATA' | 'PREVENTIVA' | 'SEGUIMIENTO';
  }[];
  recommendations: string[];
  predictiveReadinessScore: number; // Score for official sanitary inspection
}

export class QualityHaccpAIService {
  private static getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({ apiKey });
    } catch {
      return null;
    }
  }

  static async analyzeFoodSafetyStatus(): Promise<QualityAIAnalysisResult> {
    const equipment = QualityHaccpService.getTemperatureEquipment();
    const tempLogs = QualityHaccpService.getTemperatureLogs();
    const lots = QualityHaccpService.getFoodLots();
    const fefoRecommendations = QualityHaccpService.getFEFORecommendations();
    const cleaningLogs = QualityHaccpService.getCleaningLogs();
    const audits = QualityHaccpService.getSanitaryAudits();
    const supplierCerts = QualityHaccpService.getSupplierCerts();

    const alertingEquipment = equipment.filter((e) => e.isAlerting);
    const outOfLimitLogs = tempLogs.filter((l) => !l.isWithinLimits);
    const expiringLots = fefoRecommendations.filter((l) => {
      const days = (new Date(l.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
      return days <= 5;
    });
    const nonCompliantCleanings = cleaningLogs.filter((c) => c.status === 'NO_CONFORME');
    const openNonConformities = audits.flatMap((a) => a.nonConformities).filter((nc) => nc.status !== 'VERIFICADA');
    const expiredSupplierCerts = supplierCerts.filter((sc) => new Date(sc.expiryDate).getTime() < Date.now());

    const client = this.getGeminiClient();
    if (client) {
      try {
        const prompt = `Analiza el estado de Seguridad Alimentaria y APPCC del restaurante con los siguientes datos:
- Equipos en Alerta de Temperatura: ${alertingEquipment.length} (${alertingEquipment.map((e) => e.name).join(', ')})
- Lecturas fuera de límites: ${outOfLimitLogs.length}
- Lotes próximos a caducar (FEFO): ${expiringLots.length} (${expiringLots.map((l) => `${l.productName} [${l.expiryDate}]`).join(', ')})
- Limpiezas No Conformes: ${nonCompliantCleanings.length}
- No Conformidades de Auditoría abiertas: ${openNonConformities.length}
- Certificados de proveedores caducados: ${expiredSupplierCerts.length}

Responde en formato JSON válido con las claves:
{
  "riskLevel": "BAJO" | "MEDIO" | "ALTO" | "CRITICO",
  "complianceScore": number (0-100),
  "summary": "string",
  "detectedRisks": [{"category": "TEMPERATURAS"|"CADUCIDAD_FEFO"|"LIMPIEZA"|"AUDITORIA"|"PROVEEDORES", "title": "string", "description": "string", "suggestedCorrectiveAction": "string", "urgency": "INMEDIATA"|"PREVENTIVA"|"SEGUIMIENTO"}],
  "recommendations": ["string"],
  "predictiveReadinessScore": number (0-100)
}`;

        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed as QualityAIAnalysisResult;
        }
      } catch (err) {
        console.warn('[AI Quality] Gemini API execution warning, using deterministic heuristic model:', err);
      }
    }

    // Heuristic fallback
    let score = 100;
    const detectedRisks: QualityAIAnalysisResult['detectedRisks'] = [];

    if (alertingEquipment.length > 0) {
      score -= alertingEquipment.length * 20;
      alertingEquipment.forEach((eq) => {
        detectedRisks.push({
          category: 'TEMPERATURAS',
          title: `Temperatura fuera de rango en ${eq.name}`,
          description: `Lectura actual: ${eq.lastReadingTemp}ºC (Rango permitido: ${eq.minTemp}ºC a ${eq.maxTemp}ºC).`,
          suggestedCorrectiveAction: 'Verificar cierre hermético, termostato y trasladar productos sensibles a cámara de reserva.',
          urgency: 'INMEDIATA',
        });
      });
    }

    if (expiringLots.length > 0) {
      score -= expiringLots.length * 10;
      expiringLots.forEach((lot) => {
        detectedRisks.push({
          category: 'CADUCIDAD_FEFO',
          title: `Caducidad próxima en Lote ${lot.lotNumber}`,
          description: `El lote "${lot.productName}" de ${lot.supplierName} caduca el ${lot.expiryDate}. Quedan ${lot.currentQuantity} ${lot.unit}.`,
          suggestedCorrectiveAction: 'Priorizar uso inmediato en menú del día (FEFO) o dar de baja si presenta alteración organoléptica.',
          urgency: 'PREVENTIVA',
        });
      });
    }

    if (openNonConformities.length > 0) {
      score -= openNonConformities.length * 15;
      openNonConformities.forEach((nc) => {
        detectedRisks.push({
          category: 'AUDITORIA',
          title: `No Conformidad abierta ${nc.code}`,
          description: nc.description,
          suggestedCorrectiveAction: nc.correctiveActionPlan,
          urgency: 'SEGUIMIENTO',
        });
      });
    }

    const finalScore = Math.max(10, Math.min(100, score));
    const riskLevel: QualityAIAnalysisResult['riskLevel'] =
      finalScore >= 90 ? 'BAJO' : finalScore >= 75 ? 'MEDIO' : finalScore >= 50 ? 'ALTO' : 'CRITICO';

    return {
      riskLevel,
      complianceScore: finalScore,
      summary: `Análisis de Inteligencia de Calidad: El establecimiento presenta un índice de cumplimiento del ${finalScore}%. ${
        detectedRisks.length > 0
          ? `Se han detectado ${detectedRisks.length} alertas prioritarias que requieren atención.`
          : 'Instalaciones y registros en estado óptimo para inspección sanitaria.'
      }`,
      detectedRisks,
      recommendations: [
        'Realizar calibración semestral de sondas termométricas en cámaras y hornos.',
        'Reforzar la política de etiquetado FEFO en el cuarto frío de pescados.',
        'Verificar la renovación periódica del Registro Sanitario RGSEAA de proveedores.',
      ],
      predictiveReadinessScore: Math.min(100, Math.round(finalScore * 0.95 + 5)),
    };
  }
}
