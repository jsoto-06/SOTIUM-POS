/**
 * Enterprise Validation Utilities for Sotium POS
 */

export function isValidNifCif(nif: string): boolean {
  if (!nif) return false;
  const regex = /^[A-HJ-NP-SUVWabcdefghjklmnp-suvw0-9][0-9]{7}[A-J0-9]$/i;
  return regex.test(nif.trim());
}

export function isValidSpanishPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 9 && cleaned.length <= 11;
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}
