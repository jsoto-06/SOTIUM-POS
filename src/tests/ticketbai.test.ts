import { describe, it, expect } from 'vitest';
import { TicketBaiService, TicketBaiSignInput } from '../services/ticketbaiService';

describe('TicketBAI Basque Cryptographic Engine', () => {
  it('should generate valid TBAI code and QR URL for Gipuzkoa', () => {
    const input: TicketBaiSignInput = {
      issuerNif: 'B20123456',
      issuerName: 'DONOSTIA RESTAURANTE S.L.',
      invoiceNumber: 'TBAI/2026/001',
      issueTimestamp: '2026-07-30T14:00:00.000Z',
      subtotal: 50.0,
      vatAmount: 5.0,
      total: 55.0,
      province: 'GIPUZKOA',
    };

    const result = TicketBaiService.signTicketBai(input);

    expect(result.tbaiCode).toContain('TBAI-');
    expect(result.province).toBe('GIPUZKOA');
    expect(result.qrUrl).toContain('ticketbai.gipuzkoa.eus');
    expect(result.xmlSigned).toContain('<IDTicketBai>');
    expect(result.xmlSigned).toContain('DONOSTIA RESTAURANTE S.L.');
  });

  it('should generate valid QR URL for Bizkaia (Batuz)', () => {
    const input: TicketBaiSignInput = {
      issuerNif: 'B48987654',
      issuerName: 'BILBAO TABERNA S.L.',
      invoiceNumber: 'BATUZ/2026/088',
      issueTimestamp: '2026-07-30T15:00:00.000Z',
      subtotal: 100.0,
      vatAmount: 10.0,
      total: 110.0,
      province: 'BIZKAIA',
    };

    const result = TicketBaiService.signTicketBai(input);
    expect(result.qrUrl).toContain('bizkaia.eus/batuz');
    expect(result.sentToHacienda).toBe(true);
  });
});
