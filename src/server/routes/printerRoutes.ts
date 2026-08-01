import { Router } from 'express';
import { PrinterService } from '../../services/printerService';
import { logger } from '../../services/loggerService';

export const printerRouter = Router();

printerRouter.post('/v1/printer/ticket', (req, res, next) => {
  try {
    const ticketData = req.body;
    const rawEscPos = PrinterService.formatEscPosTicket(ticketData);
    logger.info(`[PRINTER SERVICE] Ticket ESC/POS generado para ${ticketData.ticketNumber || 'TICKET'}`);
    res.json({ success: true, format: 'ESC/POS', rawData: Buffer.from(rawEscPos).toString('base64'), textPreview: rawEscPos });
  } catch (err) {
    next(err);
  }
});

printerRouter.post('/v1/printer/kitchen', (req, res, next) => {
  try {
    const { orderNumber, tableName, serverName, items } = req.body;
    const kitchenEscPos = PrinterService.formatKitchenOrder(orderNumber, tableName, serverName, items || []);
    logger.info(`[PRINTER SERVICE] Comanda Cocina ESC/POS generada para Mesa ${tableName}`);
    res.json({ success: true, format: 'ESC/POS', rawData: Buffer.from(kitchenEscPos).toString('base64'), textPreview: kitchenEscPos });
  } catch (err) {
    next(err);
  }
});
