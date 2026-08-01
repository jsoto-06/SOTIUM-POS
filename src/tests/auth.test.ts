import { describe, it, expect } from 'vitest';
import { AuthService } from '../services/authService';

describe('AuthService JWT and bcrypt', () => {
  it('should hash and verify passwords using bcrypt', async () => {
    const rawPassword = 'SecretPassword123!';
    const hash = await AuthService.hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    const isValid = await AuthService.verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isWrongValid = await AuthService.verifyPassword('WrongPassword', hash);
    expect(isWrongValid).toBe(false);
  });

  it('should generate and verify signed JWT tokens', () => {
    const payload = {
      userId: 'usr-123',
      username: 'admin',
      role: 'ADMIN',
      name: 'Carlos Rodríguez',
    };

    const token = AuthService.generateToken(payload);
    expect(token).toBeDefined();

    const decoded = AuthService.verifyToken(token);
    expect(decoded.userId).toBe('usr-123');
    expect(decoded.username).toBe('admin');
    expect(decoded.role).toBe('ADMIN');
  });
});
