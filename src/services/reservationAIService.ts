import { GoogleGenAI } from '@google/genai';
import {
  Reservation,
  AINoShowPrediction,
  AITableRecommendation,
  AIOccupancyForecast,
} from '../types/reservation';
import { Salon, Table, Employee } from '../types/pos';
import { logger } from './loggerService';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    try {
      aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      logger.warn('[GEMINI AI] Could not initialize GoogleGenAI client, falling back to heuristic engine.');
    }
  }
  return aiInstance;
}

/**
 * Predicts the No-Show risk score (%) and reasons for a given reservation using Gemini or heuristic AI rules.
 */
export async function predictNoShowRisk(
  reservation: Reservation,
  customerHistory?: { noShowCount: number; totalReservations: number; totalSpent?: number }
): Promise<AINoShowPrediction> {
  const ai = getAIClient();

  // Basic heuristic score calculation
  let riskScore = 10;
  const reasons: string[] = [];

  if (customerHistory) {
    if (customerHistory.noShowCount > 0) {
      riskScore += customerHistory.noShowCount * 30;
      reasons.push(`El cliente tiene ${customerHistory.noShowCount} No-Show previos registrados.`);
    }
    if (customerHistory.totalReservations > 5 && customerHistory.noShowCount === 0) {
      riskScore = Math.max(5, riskScore - 15);
      reasons.push('Cliente habitual sin historial de faltas (fidelizado).');
    }
  }

  // Large groups without deposit
  if (reservation.pax >= 6 && (!reservation.depositAmount || !reservation.depositPaid)) {
    riskScore += 25;
    reasons.push('Grupo grande (>=6 pax) sin fianza confirmada.');
  }

  // Reservation made far in advance or same-day peak
  if (reservation.channel === 'WEB' || reservation.channel === 'ONLINE') {
    riskScore += 10;
    reasons.push('Reserva realizada por canal online automatizado.');
  }

  // Weekend peak hours
  const resTimeHour = parseInt(reservation.time.split(':')[0] || '14', 10);
  if ((resTimeHour >= 14 && resTimeHour <= 15) || (resTimeHour >= 21 && resTimeHour <= 22)) {
    riskScore += 10;
    reasons.push('Franja horaria de máxima demanda concurrente.');
  }

  // Cap risk score between 5% and 95%
  riskScore = Math.min(95, Math.max(5, riskScore));

  let category: AINoShowPrediction['riskCategory'] = 'BAJO';
  let action = 'Reserva estándar. Enviar recordatorio automático 2h antes.';

  if (riskScore >= 75) {
    category = 'CRITICO';
    action = 'Llamar directamente por teléfono 3h antes o solicitar fianza/tarjeta de garantía.';
  } else if (riskScore >= 50) {
    category = 'ALTO';
    action = 'Enviar recordatorio por WhatsApp con botón de confirmación de 1 clic.';
  } else if (riskScore >= 30) {
    category = 'MEDIO';
    action = 'Enviar recordatorio interactivo SMS/WhatsApp 4h antes.';
  }

  if (reasons.length === 0) {
    reasons.push('Comportamiento de reserva estándar sin factores de riesgo detectados.');
  }

  // Try calling Gemini API if key is present for advanced analysis
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analiza este riesgo de No-Show para una reserva de restaurante:
Cliente: ${reservation.customerName}, Pax: ${reservation.pax}, Hora: ${reservation.time}, Canal: ${reservation.channel}, Evento: ${reservation.eventType || 'Ninguno'}, Depósito: ${reservation.depositPaid ? 'SÍ' : 'NO'}.
Historial cliente: ${customerHistory ? JSON.stringify(customerHistory) : 'Primeriza'}.
Devuelve JSON con {"riskScorePercent": number, "category": "BAJO"|"MEDIO"|"ALTO"|"CRITICO", "reasons": string[], "recommendedAction": string}`,
      });
      if (response.text) {
        const parsed = JSON.parse(response.text.replace(/```json|```/g, '').trim());
        if (parsed.riskScorePercent !== undefined) {
          return {
            reservationId: reservation.id,
            riskScorePercent: parsed.riskScorePercent,
            riskCategory: parsed.category || category,
            reasons: parsed.reasons || reasons,
            recommendedAction: parsed.recommendedAction || action,
          };
        }
      }
    } catch (e) {
      logger.warn('[GEMINI AI] Failed to parse AI output, returning statistical engine fallback.');
    }
  }

  return {
    reservationId: reservation.id,
    riskScorePercent: riskScore,
    riskCategory: category,
    reasons,
    recommendedAction: action,
  };
}

/**
 * Recommends the optimal table in the restaurant given pax, kids, tronas, event type, and existing reservations.
 */
export function recommendOptimalTable(
  pax: number,
  eventType: string | undefined,
  kids: number | undefined,
  salons: Salon[],
  existingReservations: Reservation[]
): AITableRecommendation[] {
  const recommendations: AITableRecommendation[] = [];

  const reservedTableIds = new Set(
    existingReservations
      .filter((r) => r.status !== 'CANCELADA' && r.status !== 'FINALIZADA' && r.status !== 'NO_SHOW')
      .map((r) => r.tableId)
  );

  salons.forEach((salon) => {
    salon.tables.forEach((table) => {
      if (reservedTableIds.has(table.id) || table.status === 'OCCUPIED' || table.status === 'OUT_OF_SERVICE') {
        return; // Table is not free
      }

      // Check capacity suitability
      if (table.seats < pax) return; // Cannot fit

      let score = 100;
      const reasons: string[] = [];

      // Waste of seats penalty (e.g., 2 pax sitting on an 8-seater)
      const emptySeats = table.seats - pax;
      if (emptySeats === 0) {
        score += 20;
        reasons.push('Aprovechamiento perfecto del 100% de la capacidad de la mesa.');
      } else if (emptySeats <= 2) {
        score += 10;
        reasons.push(`Ajuste óptimo (${pax} pax en mesa de ${table.seats}).`);
      } else {
        score -= emptySeats * 12;
        reasons.push(`Exceso de capacidad (${emptySeats} sillas vacías desperdiciadas).`);
      }

      // Kids / Tronas recommendation
      if (kids && kids > 0) {
        if (salon.type === 'TERRAZA' || salon.type === 'COMEDOR') {
          score += 15;
          reasons.push('Espacio adecuado para carros infantiles y tronas en este salón.');
        }
      }

      // VIP / Business Events
      if (eventType === 'EMPRESA' || eventType === 'PRIVADO') {
        if (salon.type === 'RESERVADOS' || table.isLocked) {
          score += 25;
          reasons.push('Zona privada aislada acústicamente, ideal para reuniones corporativas.');
        }
      } else if (eventType === 'CUMPLEAÑOS' || eventType === 'BANQUETE') {
        if (table.shape === 'round' || table.shape === 'rectangle') {
          score += 15;
          reasons.push('Disposición amplia propicia para interacción de grupo.');
        }
      }

      recommendations.push({
        tableId: table.id,
        tableName: table.name,
        salonId: salon.id,
        salonName: salon.name,
        suitabilityScore: Math.min(100, Math.max(10, score)),
        reasons,
      });
    });
  });

  return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

/**
 * Predicts peak hours, occupancy forecasts, safe overbooking %, and recommended staffing.
 */
export function predictPeakHoursAndOverbooking(
  date: string,
  reservations: Reservation[],
  salons: Salon[]
): AIOccupancyForecast {
  const dateReservations = reservations.filter((r) => r.date === date && r.status !== 'CANCELADA');
  
  const totalSeatsInRestaurant = salons.reduce(
    (acc, s) => acc + s.tables.reduce((tAcc, t) => tAcc + t.seats, 0),
    0
  );

  const hourPaxMap: Record<string, number> = {};
  let totalPax = 0;

  dateReservations.forEach((r) => {
    const hour = r.time.split(':')[0] + ':00';
    hourPaxMap[hour] = (hourPaxMap[hour] || 0) + r.pax;
    totalPax += r.pax;
  });

  const peakHours = Object.entries(hourPaxMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h, count]) => `${h} (${count} pax)`);

  // Safe overbooking percentage calculation based on historical 8% No-Show rate
  const suggestedOverbookingPercentage = dateReservations.length >= 10 ? 12 : 8;

  const waitersNeeded = Math.max(2, Math.ceil(totalPax / 25));
  const kitchenStaffNeeded = Math.max(2, Math.ceil(totalPax / 30));

  return {
    date,
    peakHours: peakHours.length > 0 ? peakHours : ['14:00 (Previsión)', '21:30 (Previsión)'],
    expectedTotalPax: totalPax,
    suggestedOverbookingPercentage,
    recommendedStaffing: [
      { role: 'Camareros de Sala', recommendedCount: waitersNeeded },
      { role: 'Cocineros KDS', recommendedCount: kitchenStaffNeeded },
      { role: 'Recepcionista Host/ess', recommendedCount: totalPax > 40 ? 1 : 0 },
    ],
    insights: [
      `Capacidad total del establecimiento: ${totalSeatsInRestaurant} plazas distribuídas en ${salons.length} salones.`,
      `Ocupación prevista para el día ${date}: ${Math.round((totalPax / (totalSeatsInRestaurant * 2 || 1)) * 100)}% de rotación doble.`,
      `Se recomienda autorizar un ${suggestedOverbookingPercentage}% de sobrerreserva para amortiguar el No-Show estadístico.`,
    ],
  };
}

/**
 * Recommends waiter load balancing across salons.
 */
export function recommendWaiterAssignment(
  reservations: Reservation[],
  employees: Employee[]
): { salonName: string; assignedWaiters: string[]; paxLoad: number }[] {
  const waiters = employees.filter((e) => e.role === 'CAMARERO' || e.role === 'MANAGER');
  
  const salonLoad: Record<string, number> = {};
  reservations.forEach((r) => {
    if (r.status !== 'CANCELADA' && r.status !== 'FINALIZADA') {
      salonLoad[r.salonName] = (salonLoad[r.salonName] || 0) + r.pax;
    }
  });

  const salonNames = Array.from(new Set(reservations.map((r) => r.salonName).concat(['Comedor Principal', 'Terraza Paseo'])));

  return salonNames.map((sName, idx) => {
    const paxLoad = salonLoad[sName] || 0;
    const assignedWaiters = waiters.length > 0
      ? [waiters[idx % waiters.length].name]
      : ['Camarero Asignado'];

    return {
      salonName: sName,
      assignedWaiters,
      paxLoad,
    };
  });
}

// Function aliases for component compatibility
export function analyzeNoShowRisk(
  reservation: Reservation,
  allReservations?: Reservation[]
): { noShowRiskScore: number; riskLevel: string; explanation: string } {
  const result = { noShowRiskScore: 10, riskLevel: 'BAJO', explanation: 'Reserva estándar con bajo riesgo de inasistencia.' };
  if (reservation.pax > 6) {
    result.noShowRiskScore += 20;
    result.explanation = 'Grupo grande de comensales.';
  }
  if (!reservation.depositPaid && reservation.depositAmount > 0) {
    result.noShowRiskScore += 30;
    result.riskLevel = 'MEDIO';
    result.explanation = 'Fianza pendiente de cobro.';
  }
  return result;
}

export function recommendBestTable(
  query: { pax: number; date: string; time: string; kids?: number; babies?: number; pets?: boolean },
  salons: Salon[],
  existingReservations: Reservation[]
) {
  const recs = recommendOptimalTable(query.pax, undefined, query.kids, salons, existingReservations);
  if (recs.length > 0) {
    const best = recs[0];
    const recommendedSalon = salons.find((s) => s.id === best.salonId);
    const recommendedTable = recommendedSalon?.tables.find((t) => t.id === best.tableId);
    return {
      recommendedTable,
      recommendedSalon,
      explanation: best.reasons.join(' '),
    };
  }
  return {
    recommendedTable: undefined,
    recommendedSalon: undefined,
    explanation: 'Sin mesas disponibles',
  };
}

export function generateOccupancyForecast(reservations: Reservation[]) {
  const timeSlots = ['12:00', '13:00', '14:00', '15:00', '20:00', '21:00', '22:00'];
  return timeSlots.map((timeSlot) => {
    const slotRes = reservations.filter((r) => r.time.startsWith(timeSlot.slice(0, 3)));
    const totalPax = slotRes.reduce((sum, r) => sum + r.pax, 0);
    const occupancyPercentage = Math.min(100, Math.round((totalPax / 40) * 100));
    return {
      timeSlot,
      totalPax,
      reservationsCount: slotRes.length,
      occupancyPercentage,
    };
  });
}
