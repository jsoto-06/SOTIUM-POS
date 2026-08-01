/**
 * Enterprise String & Code Generator Utilities for Sotium POS
 */

export function generateRandomCode(prefix: string, length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

export function generateDateBasedCode(prefix: string): string {
  const fullYear = new Date().getFullYear();
  const monthDay = new Date().toISOString().slice(5, 10).replace(/-/g, '');
  const randNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${fullYear}${monthDay}-${randNum}`;
}
