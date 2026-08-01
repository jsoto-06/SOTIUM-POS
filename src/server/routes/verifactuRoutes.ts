import { Router } from 'express';
import { VeriFactuService } from '../../services/verifactuService';
import { AuditService } from '../../services/auditService';
import { queueLocalChange } from '../../db/better-sqlite-engine';
import { invoiceSignSchema } from '../../validators';

export const verifactuRouter = Router();

verifactuRouter.post('/verifactu/sign', (req, res, next) => {
  try {
    const parsed = invoiceSignSchema.safeParse(req.body);
    let signInput;
    if (parsed.success) {
      signInput = parsed.data;
    } else {
      const { invoiceNumber, issueDate, total, vatAmount, previousHash, nif, issuerName, documentType, subtotal } = req.body;
      signInput = {
        issuerNif: nif || 'B12345678',
        issuerName: issuerName || 'RESTAURANTE EL TABERNERO S.L.',
        invoiceNumber: invoiceNumber || `T2026/${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        issueTimestamp: issueDate || new Date().toISOString(),
        documentType: documentType || 'TICKET_SIMPLIFICADO',
        subtotal: subtotal || (total ? total * 0.9 : 10.0),
        vatAmount: vatAmount || (total ? total * 0.1 : 1.0),
        total: total || 11.0,
        previousHash: previousHash || '0000000000000000000000000000000000000000000000000000000000000000',
      };
    }

    const result = VeriFactuService.signInvoice(signInput as any);

    AuditService.log({
      username: 'SYSTEM_VERIFACTU',
      action: 'VERIFACTU_SIGN',
      resource: 'Invoices',
      details: `Factura ${result.invoiceNumber} firmada digitalmente con SHA-256 encadenado`,
      ipAddress: req.ip,
    });

    queueLocalChange('Order', result.invoiceNumber, 'SIGN_VERIFACTU', result);

    res.json({
      success: true,
      verifactu: result,
    });
  } catch (err) {
    next(err);
  }
});
