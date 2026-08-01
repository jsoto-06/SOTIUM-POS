import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
