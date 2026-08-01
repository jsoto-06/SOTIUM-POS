import { describe, it, expect } from 'vitest';
import { PrinterService, TicketPrintData } from '../services/printerService';

describe('ESC/POS Thermal Printer Service', () => {
  it('should format 80mm ESC/POS ticket correctly with VeriFactu metadata', () => {
    const printData: TicketPrintData = {
      companyName: 'RESTAURANTE EL TABERNERO S.L.',
      nif: 'B12345678',
      address: 'Calle Mayor 14, Madrid',
      ticketNumber: 'T2026/0042',
      date: '2026-07-30 14:30',
      tableName: 'Mesa 4 (Terraza)',
      serverName: 'Carlos M.',
      items: [
        { name: 'Paella Valenciana', quantity: 2, price: 16.50, total: 33.00, notes: 'Sin pimiento' },
        { name: 'Caña de Cerveza', quantity: 2, price: 2.50, total: 5.00 },
      ],
      subtotal: 34.55,
      vatAmount: 3.45,
      total: 38.00,
      paymentMethod: 'TARJETA',
      verifactuHash: 'A1B2C3D4E5F678901234567890ABCDEF',
    };

    const escposStream = PrinterService.formatEscPosTicket(printData);

    expect(escposStream).toContain('RESTAURANTE EL TABERNERO S.L.');
    expect(escposStream).toContain('TICKET: T2026/0042');
    expect(escposStream).toContain('Paella Valenciana');
    expect(escposStream).toContain('VERIFACTU - FACTURA VERIFICABLE EN AEAT');
    expect(escposStream).toContain('\x1D\x56\x42\x00'); // Paper cut command
  });

  it('should format kitchen order receipt cleanly', () => {
    const kitchenStream = PrinterService.formatKitchenOrder('108', 'Mesa 2', 'Ana R.', [
      { name: 'Solomillo al Punto', quantity: 1, price: 22.00, total: 22.00, notes: 'Muy hecho' },
    ]);

    expect(kitchenStream).toContain('=== COMANDA DE COCINA ===');
    expect(kitchenStream).toContain('ORDEN: #108 | MESA: Mesa 2');
    expect(kitchenStream).toContain('[ ] 1x SOLOMILLO AL PUNTO');
    expect(kitchenStream).toContain('>> NOTA: Muy hecho');
  });
});
