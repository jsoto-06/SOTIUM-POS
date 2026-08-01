import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';

export function createReservationRouter(io: SocketIOServer): Router {
  const router = Router();

  router.get('/reservations', (_req, res) => {
    res.json({ status: 'ok', reservations: [] });
  });

  router.post('/reservations', (req, res) => {
    const newRes = req.body;
    io.emit('reservation:changed', { action: 'CREATED', reservation: newRes });
    res.status(201).json({ status: 'ok', message: 'Reserva creada con éxito', reservation: newRes });
  });

  router.put('/reservations/:id', (req, res) => {
    const { id } = req.params;
    const updated = { ...req.body, id };
    io.emit('reservation:changed', { action: 'UPDATED', reservation: updated });
    res.json({ status: 'ok', message: 'Reserva actualizada', reservation: updated });
  });

  router.patch('/reservations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    io.emit('reservation:changed', { action: 'STATUS_CHANGED', id, status });
    res.json({ success: true, message: `Estado cambiado a ${status}`, id, status });
  });

  router.post('/reservations/check-in', (req, res) => {
    const { reservationId, tableId, salonId } = req.body;
    io.emit('reservation:changed', { action: 'CHECK_IN', reservationId, tableId, salonId });
    io.emit('table:status-changed', { tableId, status: 'OCCUPIED' });
    res.json({ status: 'ok', message: 'Check-in procesado y mesa ocupada', reservationId, tableId });
  });

  router.post('/reservations/no-show', (req, res) => {
    const { reservationId, penaltyFee } = req.body;
    io.emit('reservation:changed', { action: 'NO_SHOW', reservationId, penaltyFee });
    res.json({ status: 'ok', message: 'No-Show registrado', reservationId, penaltyFee });
  });

  return router;
}
