import { describe, it, expect } from 'vitest';
import { VeriFactuService, InvoiceSignInput } from '../services/verifactuService';

describe('VeriFactu Cryptographic SHA-256 Engine', () => {
  it('should generate deterministic chained SHA-256 hash according to AEAT specs', () => {
    const invoiceInput: InvoiceSignInput = {
      issuerNif: 'B12345678',
      issuerName: 'RESTAURANTE SOTIUM POS S.L.',
      invoiceNumber: 'T2026/0001',
      issueTimestamp: '2026-07-30T12:00:00.000Z',
      documentType: 'TICKET_SIMPLIFICADO',
      subtotal: 100.0,
      vatAmount: 10.0,
      total: 110.0,
      previousHash: 'VF00000000000000000000000000000000000000000000000000000000000000',
    };

    const hash1 = VeriFactuService.generateChainedHash(invoiceInput);
    const hash2 = VeriFactuService.generateChainedHash(invoiceInput);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should generate valid QR Verification URL', () => {
    const invoiceInput: InvoiceSignInput = {
      issuerNif: 'B12345678',
      issuerName: 'RESTAURANTE SOTIUM POS S.L.',
      invoiceNumber: 'T2026/0001',
      issueTimestamp: '2026-07-30T12:00:00.000Z',
      documentType: 'TICKET_SIMPLIFICADO',
      subtotal: 100.0,
      vatAmount: 10.0,
      total: 110.0,
      previousHash: 'VF00000000000000000000000000000000000000000000000000000000000000',
    };

    const signResult = VeriFactuService.signInvoice(invoiceInput);
    expect(signResult.qrCodeUrl).toContain('agenciatributaria.gob.es');
    expect(signResult.qrCodeUrl).toContain('nif=B12345678');
    expect(signResult.qrCodeUrl).toContain('importe=110.00');
  });
});
