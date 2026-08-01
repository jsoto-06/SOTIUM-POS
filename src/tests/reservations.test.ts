import { describe, it, expect } from 'vitest';
import {
  createFullReservation,
  createQuickReservation,
  handleCheckIn,
  handleNoShow,
  addWaitingListItem,
  parseReservationsCSV,
  exportReservationsCSV,
} from '../services/reservationService';
import {
  analyzeNoShowRisk,
  recommendBestTable,
  generateOccupancyForecast,
} from '../services/reservationAIService';
import { sendOmnichannelNotification } from '../services/notificationService';
import { Reservation, Salon, WaitingListItem } from '../types/reservation';

const mockSalons: Salon[] = [
  {
    id: 'salon-1',
    name: 'Comedor Principal',
    tables: [
      { id: 'tbl-1', salonId: 'salon-1', name: 'Mesa 1', seats: 2, status: 'FREE', x: 10, y: 10, width: 80, height: 80, shape: 'square' },
      { id: 'tbl-2', salonId: 'salon-1', name: 'Mesa 2', seats: 4, status: 'FREE', x: 100, y: 10, width: 80, height: 80, shape: 'rectangle' },
    ],
  },
];

const mockReservations: Reservation[] = [
  {
    id: 'res-101',
    code: 'RES-101',
    customerName: 'Juan Perez',
    phone: '+34 600 111 222',
    pax: 2,
    kids: 0,
    babies: 0,
    highChairs: 0,
    boosterSeats: 0,
    pets: false,
    date: '2026-08-01',
    time: '14:00',
    durationMinutes: 90,
    status: 'CONFIRMADA',
    channel: 'WEB',
    tableId: 'tbl-1',
    tableName: 'Mesa 1',
    salonId: 'salon-1',
    salonName: 'Comedor Principal',
    createdAt: new Date().toISOString(),
  },
];

describe('FASE 14 - Enterprise Reservations Unit & Integration Tests', () => {
  it('should create a full reservation with automatic code generation and default values', async () => {
    const newRes = await createFullReservation(
      {
        customerName: 'Maria Garcia',
        phone: '+34 622 333 444',
        pax: 4,
        date: '2026-08-01',
        time: '21:00',
      },
      mockSalons,
      mockReservations
    );

    expect(newRes.id).toBeDefined();
    expect(newRes.code).toContain('RES-2026');
    expect(newRes.customerName).toBe('Maria Garcia');
    expect(newRes.pax).toBe(4);
    expect(newRes.status).toBe('CONFIRMADA');
    expect(newRes.noShowProbability).toBeGreaterThanOrEqual(0);
  });

  it('should create a quick reservation for TPV speed mode', () => {
    const qRes = createQuickReservation({
      customerName: 'Cliente Rapido',
      phone: '+34 699 888 777',
      pax: 2,
      tableId: 'tbl-1',
      tableName: 'Mesa 1',
      salonId: 'salon-1',
      salonName: 'Comedor Principal',
    });

    expect(qRes.customerName).toBe('Cliente Rapido');
    expect(qRes.channel).toBe('RAPIDA');
    expect(qRes.status).toBe('CONFIRMADA');
  });

  it('should process Check-In and mark table as occupied', () => {
    const res = mockReservations[0];
    const { updatedReservation, newTableId } = handleCheckIn(res, 'tbl-1', undefined, mockSalons);

    expect(updatedReservation.status).toBe('CHECK_IN');
    expect(updatedReservation.checkInTime).toBeDefined();
    expect(newTableId).toBe('tbl-1');
  });

  it('should process No-Show with penalty registration', () => {
    const res = mockReservations[0];
    const updated = handleNoShow(res, 25.0);

    expect(updated.status).toBe('NO_SHOW');
    expect(updated.depositAmount).toBe(25.0);
  });

  it('should manage Waiting List items correctly', () => {
    const initialList: WaitingListItem[] = [];
    const item = addWaitingListItem(
      { customerName: 'Carlos Walkin', phone: '+34 611 222 333', pax: 3, estimatedWaitMinutes: 15 },
      initialList
    );

    expect(item.id).toBeDefined();
    expect(item.position).toBe(1);
    expect(item.status).toBe('WAITING');
  });

  it('should import and export CSV reservations', () => {
    const csvStr = exportReservationsCSV(mockReservations);
    expect(csvStr).toContain('Juan Perez');
    expect(csvStr).toContain('+34 600 111 222');

    const parsed = parseReservationsCSV(csvStr);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].customerName).toBe('Juan Perez');
  });

  it('should analyze No-Show risk using AI heuristic engine', () => {
    const risk = analyzeNoShowRisk(
      mockReservations[0],
      mockReservations
    );

    expect(risk.noShowRiskScore).toBeGreaterThan(0);
    expect(risk.riskLevel).toBeDefined();
  });

  it('should recommend best table using AI allocation rules', () => {
    const recommendation = recommendBestTable(
      { pax: 2, date: '2026-08-01', time: '14:00' },
      mockSalons,
      mockReservations
    );

    expect(recommendation).toBeDefined();
    expect(recommendation.explanation).toBeDefined();
  });

  it('should generate hourly occupancy forecast', () => {
    const forecast = generateOccupancyForecast(mockReservations);
    expect(forecast.length).toBeGreaterThan(0);
  });

  it('should dispatch omnichannel notifications (WhatsApp, SMS, Email)', () => {
    const result = sendOmnichannelNotification({
      reservation: mockReservations[0],
      channel: 'WHATSAPP',
      type: 'CONFIRMATION',
    });

    expect(result.status).toBe('SENT');
    expect(result.trackingCode).toBeDefined();
  });
});
