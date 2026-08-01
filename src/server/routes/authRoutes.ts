import { Router, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../../services/authService';
import { AuditService } from '../../services/auditService';
import { loginSchema } from '../../validators';
import { authenticateJwt, AuthenticatedRequest } from '../../middleware/authMiddleware';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'TOO_MANY_LOGIN_ATTEMPTS', message: 'Demasiados intentos de acceso. Bloqueado temporalmente.' },
});

authRouter.post('/v1/auth/login', authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'INVALID_INPUT', errors: parsed.error.format() });
    }

    const { email, password, pin } = parsed.data;
    const username = email || 'carlos@sotiumpos.es';

    let isValid = false;
    if (pin === '1234') {
      isValid = true;
    } else if (password) {
      const dummyHash = await AuthService.hashPassword('hostelerp123');
      isValid = await AuthService.verifyPassword(password, dummyHash);
    }

    if (isValid) {
      const token = AuthService.generateToken({
        userId: 'emp-1',
        username,
        role: 'ADMIN',
        name: 'Carlos Mendoza',
      });

      AuditService.log({
        username,
        action: 'LOGIN_SUCCESS',
        resource: 'Auth',
        details: 'Inicio de sesión completado correctamente con JWT',
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: 'emp-1',
          name: 'Carlos Mendoza',
          email: username,
          role: 'ADMIN',
          permissions: ['ALL_PERMISSIONS'],
        },
      });
    }

    AuditService.log({
      username,
      action: 'LOGIN_FAILURE',
      resource: 'Auth',
      details: 'Intento de inicio de sesión fallido con credenciales inválidas',
      ipAddress: req.ip,
    });

    res.status(401).json({ success: false, error: 'Credenciales o PIN inválidos.' });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/v1/auth/me', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
    company: 'Restaurante El Tabernero S.L.',
  });
});
