/**
 * Enterprise Date & Timestamp Utilities for Sotium POS
 */

export function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatSpanishDate(isoDateStr: string): string {
  if (!isoDateStr) return '';
  const dateObj = new Date(isoDateStr);
  if (isNaN(dateObj.getTime())) return isoDateStr;
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatSpanishDateTime(isoDateTimeStr: string): string {
  if (!isoDateTimeStr) return '';
  const dateObj = new Date(isoDateTimeStr);
  if (isNaN(dateObj.getTime())) return isoDateTimeStr;
  return dateObj.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getTimeSlotFromIso(isoDateTimeStr: string): string {
  if (!isoDateTimeStr) return '00:00';
  const parts = isoDateTimeStr.split('T');
  if (parts.length > 1) {
    return parts[1].slice(0, 5);
  }
  return isoDateTimeStr.slice(0, 5);
}
