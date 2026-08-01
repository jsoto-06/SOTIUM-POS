import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'hostelerp_enterprise_jwt_secret_key_2026_production';
const JWT_EXPIRES_IN = '12h';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  name: string;
}

export class AuthService {
  /**
   * Hashes a raw password securely using bcrypt with 10 rounds
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a raw password against an encrypted bcrypt hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates a signed JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Verifies and decodes a JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
      throw new Error('TOKEN_INVALID_OR_EXPIRED');
    }
  }
}
