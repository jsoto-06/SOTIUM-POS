/**
 * Enterprise Currency and Tax Utilities for Sotium POS
 */

export function formatCurrency(amount: number, currencySymbol: string = '€'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `0,00 ${currencySymbol}`;
  }
  return `${amount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currencySymbol}`;
}

export function calculateVat(subtotal: number, vatRatePercent: number = 10): { net: number; vat: number; total: number } {
  const vat = subtotal * (vatRatePercent / 100);
  const total = subtotal + vat;
  return {
    net: Number(subtotal.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export function extractVatFromTotal(total: number, vatRatePercent: number = 10): { net: number; vat: number; total: number } {
  const net = total / (1 + vatRatePercent / 100);
  const vat = total - net;
  return {
    net: Number(net.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
