export interface PrintTicketItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
}

export interface TicketPrintData {
  companyName: string;
  nif: string;
  address: string;
  ticketNumber: string;
  date: string;
  tableName?: string;
  serverName: string;
  items: PrintTicketItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  paymentMethod: string;
  verifactuHash?: string;
  qrUrl?: string;
}

export class PrinterService {
  /**
   * Generates standard ESC/POS thermal command stream (raw bytes / hex) for 80mm receipts
   */
  static formatEscPosTicket(data: TicketPrintData): string {
    const lines: string[] = [];

    // ESC/POS Reset & Center Align
    lines.push('\x1B\x40'); // ESC @ (Initialize printer)
    lines.push('\x1B\x61\x01'); // ESC a 1 (Align Center)

    // Header
    lines.push(`*** ${data.companyName.toUpperCase()} ***`);
    lines.push(`NIF: ${data.nif}`);
    lines.push(`${data.address}`);
    lines.push('------------------------------------------');

    // Align Left
    lines.push('\x1B\x61\x00');
    lines.push(`TICKET: ${data.ticketNumber}`);
    lines.push(`FECHA:  ${data.date}`);
    if (data.tableName) lines.push(`MESA:   ${data.tableName}`);
    lines.push(`ATENDIÓ: ${data.serverName}`);
    lines.push('------------------------------------------');

    // Items
    lines.push('CANT  DESCRIPCIÓN             P.UNIT   TOTAL');
    for (const item of data.items) {
      const q = String(item.quantity).padStart(4, ' ');
      const desc = item.name.padEnd(20, ' ').substring(0, 20);
      const unit = item.price.toFixed(2).padStart(6, ' ');
      const tot = item.total.toFixed(2).padStart(7, ' ');
      lines.push(`${q} ${desc} ${unit} ${tot}`);
      if (item.notes) {
        lines.push(`     * ${item.notes}`);
      }
    }

    lines.push('------------------------------------------');
    // Align Right for Totals
    lines.push('\x1B\x61\x02');
    lines.push(`SUBTOTAL (SIN IVA): ${data.subtotal.toFixed(2)} €`);
    lines.push(`IVA (10%):           ${data.vatAmount.toFixed(2)} €`);
    lines.push(`TOTAL FACTURA:      ${data.total.toFixed(2)} €`);
    lines.push(`FORMA DE PAGO:      ${data.paymentMethod}`);

    if (data.verifactuHash) {
      lines.push('\x1B\x61\x01');
      lines.push('------------------------------------------');
      lines.push('VERIFACTU - FACTURA VERIFICABLE EN AEAT');
      lines.push(`HASH: ${data.verifactuHash.substring(0, 24)}...`);
    }

    // Cut Paper (GS V 66 0)
    lines.push('\x1D\x56\x42\x00');

    return lines.join('\n');
  }

  /**
   * Generates Kitchen KDS Ticket (Comanda de Cocina) ESC/POS stream
   */
  static formatKitchenOrder(orderNumber: string, tableName: string, serverName: string, items: PrintTicketItem[]): string {
    const lines: string[] = [];
    lines.push('\x1B\x40'); // ESC @
    lines.push('\x1B\x61\x01'); // Center
    lines.push('=== COMANDA DE COCINA ===');
    lines.push(`ORDEN: #${orderNumber} | MESA: ${tableName}`);
    lines.push(`CAMARERO: ${serverName}`);
    lines.push(`HORA: ${new Date().toLocaleTimeString('es-ES')}`);
    lines.push('------------------------------------------');
    lines.push('\x1B\x61\x00'); // Left

    for (const item of items) {
      lines.push(`[ ] ${item.quantity}x ${item.name.toUpperCase()}`);
      if (item.notes) {
        lines.push(`    >> NOTA: ${item.notes}`);
      }
    }

    lines.push('------------------------------------------');
    lines.push('\x1D\x56\x42\x00'); // Cut
    return lines.join('\n');
  }

  /**
   * Generates Bar & Beverage Ticket ESC/POS stream
   */
  static formatBarOrder(orderNumber: string, tableName: string, serverName: string, items: PrintTicketItem[]): string {
    const lines: string[] = [];
    lines.push('\x1B\x40');
    lines.push('\x1B\x61\x01');
    lines.push('=== COMANDA DE BARRA / BEBIDAS ===');
    lines.push(`ORDEN: #${orderNumber} | MESA: ${tableName}`);
    lines.push(`CAMARERO: ${serverName}`);
    lines.push(`HORA: ${new Date().toLocaleTimeString('es-ES')}`);
    lines.push('------------------------------------------');
    lines.push('\x1B\x61\x00');

    for (const item of items) {
      lines.push(`[ ] ${item.quantity}x ${item.name.toUpperCase()}`);
      if (item.notes) {
        lines.push(`    >> NOTA: ${item.notes}`);
      }
    }

    lines.push('------------------------------------------');
    lines.push('\x1D\x56\x42\x00');
    return lines.join('\n');
  }

  /**
   * Generates Duplicate/Reprint Ticket ESC/POS stream
   */
  static formatReprintTicket(orderNumber: string, tableName: string, serverName: string, items: PrintTicketItem[], targetStation: string): string {
    const lines: string[] = [];
    lines.push('\x1B\x40');
    lines.push('\x1B\x61\x01');
    lines.push(`*** REIMPRESIÓN COMANDA [${targetStation.toUpperCase()}] ***`);
    lines.push(`ORDEN: #${orderNumber} | MESA: ${tableName}`);
    lines.push(`SOLICITADO POR: ${serverName}`);
    lines.push(`FECHA: ${new Date().toLocaleString('es-ES')}`);
    lines.push('------------------------------------------');
    lines.push('\x1B\x61\x00');

    for (const item of items) {
      lines.push(`[ ] ${item.quantity}x ${item.name.toUpperCase()}`);
      if (item.notes) {
        lines.push(`    >> NOTA: ${item.notes}`);
      }
    }

    lines.push('------------------------------------------');
    lines.push('\x1D\x56\x42\x00');
    return lines.join('\n');
  }
}
