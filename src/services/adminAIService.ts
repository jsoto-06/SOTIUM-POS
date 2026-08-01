import { GoogleGenAI } from '@google/genai';
import { backofficeService } from './backofficeService';
import { AIAdvisorAuditResult } from '../types/backoffice';

class AdminAIService {
  private getClient(): GoogleGenAI | null {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  public async auditConfiguration(): Promise<AIAdvisorAuditResult> {
    const company = backofficeService.getCompanyConfig();
    const hardware = backofficeService.getTPVHardwareConfig();
    const general = backofficeService.getGeneralSettings();
    const users = backofficeService.getAdminUsers();
    const policy = backofficeService.getSecurityPolicy();
    const license = backofficeService.getLicenseInfo();

    const configContext = {
      companyName: company.name,
      nif: company.nif,
      verifactuEnabled: company.verifactuEnabled,
      digitalCertStatus: company.digitalCertificateStatus,
      printersCount: hardware.printers.length,
      onlinePrinters: hardware.printers.filter((p) => p.status === 'ONLINE').length,
      pdasCount: hardware.pdaCount,
      taxesCount: general.taxes.length,
      usersCount: users.length,
      unlockedUsers: users.filter((u) => !u.isLocked).length,
      usersWithout2FA: users.filter((u) => !u.twoFactorEnabled).length,
      minPasswordLength: policy.minPasswordLength,
      sessionTimeout: policy.sessionTimeoutMinutes,
      licenseType: license.type,
      daysRemainingLicense: license.daysRemaining,
    };

    const client = this.getClient();

    if (client) {
      try {
        const prompt = `Analiza la siguiente configuración global de un ERP Hostelería Enterprise y proporciona una auditoría de seguridad, cumplimiento fiscal (VeriFactu / TicketBAI / Ley Antifraude España) y rendimiento de hardware TPV.
Contexto de configuración actual:
${JSON.stringify(configContext, null, 2)}

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la estructura:
{
  "healthScore": 92,
  "summary": "Resumen ejecutivo del estado global...",
  "securityStatus": "OPTIMAL" | "RISKS_FOUND" | "CRITICAL_VULNERABILITY",
  "taxStatus": "COMPLIANT" | "WARNING" | "NON_COMPLIANT",
  "recommendations": [
    {
      "id": "rec-01",
      "category": "SEGURIDAD" | "HARDWARE" | "FISCAL" | "RENDIMIENTO" | "ESTRUCTURA",
      "title": "Título corto",
      "severity": "CRITICAL" | "WARNING" | "INFO",
      "description": "Descripción del riesgo",
      "explanation": "Explicación detallada de por qué se recomienda este cambio",
      "suggestedAction": "Acción recomendada",
      "autoFixAvailable": true
    }
  ]
}`;

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
        const apiPromise = client.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          return {
            timestamp: new Date().toISOString(),
            healthScore: parsed.healthScore ?? 88,
            summary: parsed.summary ?? 'Auditoría completada por Gemini 3.6 Flash.',
            securityStatus: parsed.securityStatus ?? 'RISKS_FOUND',
            taxStatus: parsed.taxStatus ?? 'COMPLIANT',
            recommendations: parsed.recommendations ?? [],
          };
        }
      } catch (err) {
        console.warn('Fallo en Gemini API, utilizando motor de diagnóstico heurístico:', err);
      }
    }

    // Heuristic fallback diagnosis engine
    const recs = [];
    let score = 94;
    let secStatus: 'OPTIMAL' | 'RISKS_FOUND' | 'CRITICAL_VULNERABILITY' = 'OPTIMAL';
    let taxStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' = 'COMPLIANT';

    if (configContext.usersWithout2FA > 0) {
      score -= 8;
      secStatus = 'RISKS_FOUND';
      recs.push({
        id: 'rec-sec-01',
        category: 'SEGURIDAD' as const,
        title: 'Obligar Autenticación de Doble Factor (2FA)',
        severity: 'WARNING' as const,
        description: `Existen ${configContext.usersWithout2FA} usuarios administradores sin 2FA activado.`,
        explanation: 'Las normativas RGPD e ISO 27001 requieren doble factor de autenticación para cuentas con permisos de auditoría y configuración fiscal.',
        suggestedAction: 'Requerir 2FA obligatorio en la directiva de seguridad.',
        autoFixAvailable: true,
      });
    }

    if (policy.sessionTimeoutMinutes > 60) {
      score -= 5;
      recs.push({
        id: 'rec-sec-02',
        category: 'SEGURIDAD' as const,
        title: 'Reducir Tiempo de Inactividad de Sesión',
        severity: 'INFO' as const,
        description: `El timeout de sesión es de ${policy.sessionTimeoutMinutes} min.`,
        explanation: 'Se recomienda fijar un timeout máximo de 30 minutos para evitar accesos no autorizados en terminales TPV abiertos en sala.',
        suggestedAction: 'Ajustar el tiempo de desconexión automática a 30 minutos.',
        autoFixAvailable: true,
      });
    }

    if (!company.verifactuEnabled) {
      score -= 20;
      taxStatus = 'NON_COMPLIANT';
      recs.push({
        id: 'rec-tax-01',
        category: 'FISCAL' as const,
        title: 'Activar Certificación VeriFactu Ley 11/2021',
        severity: 'CRITICAL' as const,
        description: 'La firma y encadenamiento de facturas electrónicas VeriFactu está desactivada.',
        explanation: 'En España la Ley Antifraude impone sanciones de hasta 50.000€ por el uso de software sin trazabilidad e inalterabilidad en facturación.',
        suggestedAction: 'Habilitar VeriFactu y validación de certificado digital FNMT inmediatamente.',
        autoFixAvailable: true,
      });
    }

    if (hardware.printers.some((p) => p.status !== 'ONLINE')) {
      score -= 6;
      recs.push({
        id: 'rec-hw-01',
        category: 'HARDWARE' as const,
        title: 'Verificar Impresoras de Comanda Desconectadas',
        severity: 'WARNING' as const,
        description: 'Se han detectado impresoras ESC/POS marcadas fuera de línea.',
        explanation: 'Impresoras desconectadas causan retrasos en comanderos KDS y pérdidas de tickets de comandas en horas de mayor afluencia.',
        suggestedAction: 'Ejecutar diagnóstico de ping de red y reinicio del spooler de impresión.',
        autoFixAvailable: true,
      });
    }

    return {
      timestamp: new Date().toISOString(),
      healthScore: score,
      summary: `Auditoría global completada: Puntuación de salud del ERP ${score}/100. ${recs.length} recomendaciones encontradas.`,
      securityStatus: secStatus,
      taxStatus,
      recommendations: recs,
    };
  }
}

export const adminAIService = new AdminAIService();
