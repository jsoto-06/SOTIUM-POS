import { Router, Response } from 'express';
import { AuditService } from '../../services/auditService';
import { authenticateJwt, AuthenticatedRequest } from '../../middleware/authMiddleware';

export const auditRouter = Router();

auditRouter.get('/v1/audit-logs', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const logs = AuditService.getLogs(50);
  res.json({ logs });
});
