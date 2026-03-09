/**
 * Ticker input normalization and validation.
 */

export function normalizeTicker(ticker: string): string {
  return (ticker || '').trim().toUpperCase();
}

export function isTickerAvailable(
  ticker: string,
  availableTickers: string[]
): boolean {
  const n = normalizeTicker(ticker);
  return n.length > 0 && availableTickers.includes(n);
}
