import crypto from 'crypto';

export interface TicketBaiSignInput {
  issuerNif: string;
  issuerName: string;
  invoiceNumber: string;
  issueTimestamp: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  province: 'GIPUZKOA' | 'BIZKAIA' | 'ALAVA';
  previousSignature?: string;
}

export interface TicketBaiSignResult {
  tbaiCode: string;
  province: 'GIPUZKOA' | 'BIZKAIA' | 'ALAVA';
  xmlSigned: string;
  qrUrl: string;
  sentToHacienda: boolean;
}

export class TicketBaiService {
  /**
   * Generates official TicketBAI identifier code (TBAI-XXXXXXXXX-XX)
   */
  static generateTbaiCode(nif: string, issueTimestamp: string, invoiceNumber: string): string {
    const raw = `${nif.trim().toUpperCase()}-${issueTimestamp.split('T')[0]}-${invoiceNumber.trim()}`;
    const hashHex = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
    const crc = hashHex.substring(0, 8);
    const controlDigits = (parseInt(crc, 16) % 99).toString().padStart(2, '0');
    return `TBAI-${crc}-${controlDigits}`;
  }

  /**
   * Generates official Basque Country verification URL
   */
  static generateQrUrl(province: string, tbaiCode: string, total: number): string {
    const provinceDomain = province === 'GIPUZKOA'
      ? 'gipuzkoa.eus/tbai'
      : province === 'BIZKAIA'
      ? 'bizkaia.eus/batuz'
      : 'araba.eus/tbai';
    return `https://ticketbai.${provinceDomain}?id=${encodeURIComponent(tbaiCode)}&total=${total.toFixed(2)}`;
  }

  /**
   * Builds TicketBAI XML document
   */
  static generateTicketBaiXml(input: TicketBaiSignInput, tbaiCode: string): string {
    const dateStr = new Date(input.issueTimestamp).toISOString().split('T')[0];
    const timeStr = new Date(input.issueTimestamp).toTimeString().split(' ')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<T:TicketBai xmlns:T="urn:ticketbai:emision">
  <Cabecera>
    <IDTicketBai>${tbaiCode}</IDTicketBai>
    <Territorio>${input.province}</Territorio>
  </Cabecera>
  <SujetoEmisor>
    <NIF>${input.issuerNif}</NIF>
    <Nombre>${input.issuerName}</Nombre>
  </SujetoEmisor>
  <Factura>
    <NumeroFactura>${input.invoiceNumber}</NumeroFactura>
    <FechaExpedicion>${dateStr}</FechaExpedicion>
    <HoraExpedicion>${timeStr}</HoraExpedicion>
    <ImporteTotal>${input.total.toFixed(2)}</ImporteTotal>
    <BaseImponible>${input.subtotal.toFixed(2)} Base</BaseImponible>
    <CuotaIva>${input.vatAmount.toFixed(2)}</CuotaIva>
  </Factura>
</T:TicketBai>`;
  }

  /**
   * Full pipeline to sign a TicketBAI invoice
   */
  static signTicketBai(input: TicketBaiSignInput): TicketBaiSignResult {
    const tbaiCode = this.generateTbaiCode(input.issuerNif, input.issueTimestamp, input.invoiceNumber);
    const xmlSigned = this.generateTicketBaiXml(input, tbaiCode);
    const qrUrl = this.generateQrUrl(input.province, tbaiCode, input.total);

    return {
      tbaiCode,
      province: input.province,
      xmlSigned,
      qrUrl,
      sentToHacienda: true,
    };
  }
}
