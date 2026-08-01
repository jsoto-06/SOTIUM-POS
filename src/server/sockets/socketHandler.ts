import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../../services/loggerService';

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket) => {
    logger.info(`[Socket.io Realtime] Client connected: ${socket.id}`);

    socket.on('kds:order-update', (data) => {
      io.emit('kds:order-changed', data);
    });

    socket.on('kds:item-status-update', (data) => {
      io.emit('kds:item-status-changed', data);
    });

    socket.on('kds:station-update', (data) => {
      io.emit('kds:station-changed', data);
    });

    socket.on('table:status-update', (data) => {
      io.emit('table:status-changed', data);
    });

    socket.on('table:position-update', (data) => {
      socket.broadcast.emit('table:position-changed', data);
    });

    socket.on('table:joined', (data) => {
      io.emit('table:joined-changed', data);
    });

    socket.on('salon:update', (data) => {
      io.emit('salon:changed', data);
    });

    socket.on('reservation:update', (data) => {
      io.emit('reservation:changed', data);
    });

    socket.on('waiting_list:update', (data) => {
      io.emit('waiting_list:changed', data);
    });

    socket.on('hr:time-log-update', (data) => {
      io.emit('hr:time_log_updated', data);
    });

    socket.on('hr:shift-update', (data) => {
      io.emit('hr:shift_changed', data);
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.io Realtime] Client disconnected: ${socket.id}`);
    });
  });
}
