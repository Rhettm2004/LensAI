/**
 * Company lookup and search.
 * Currently uses mock data; replace with real API calls when backend is ready.
 *
 * Future: GET /companies/search?q=... → Company[]
 * Future: GET /companies/by-ticker/:ticker → Company | 404
 */

import type { Company } from '../types';
import { getMockCompany, MOCK_TICKERS, DEFAULT_TICKER } from '../mock/data';

/** Simulated network delay (ms). */
const MOCK_DELAY_MS = 100;

/**
 * Search companies by query (ticker or name).
 * In production this would call: GET /companies/search?q=...
 */
export async function searchCompanies(query: string): Promise<Company[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const q = (query || '').trim().toUpperCase();
  if (q.length === 0) return [];
  const matches = MOCK_TICKERS.filter(
    (t) => t.includes(q) || t === q
  );
  return matches.map((ticker) => getMockCompany(ticker));
}

/**
 * Get company by ticker. Returns null if not found.
 * In production this would call: GET /companies/by-ticker/:ticker
 */
export async function getCompanyByTicker(ticker: string): Promise<Company | null> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const company = getCompanyByTickerSync(ticker);
  return company;
}

/**
 * Synchronous lookup for use when mock list is known (e.g. validation).
 * Prefer getCompanyByTicker for API-shaped usage.
 */
export function getCompanyByTickerSync(ticker: string): Company | null {
  const normalized = (ticker || '').trim().toUpperCase();
  if (normalized.length === 0) return null;
  if (!MOCK_TICKERS.includes(normalized)) return null;
  return getMockCompany(normalized);
}

/** List of tickers currently available (mock). Replace with API when backend exists. */
export function getAvailableTickers(): string[] {
  return [...MOCK_TICKERS];
}

/**
 * Resolve a company for display when no selection exists (e.g. fallback on choose-analyst).
 * Returns mock company for ticker or default. Prefer getCompanyByTicker for "lookup" semantics.
 */
export function getCompanyForDisplay(ticker: string): Company {
  return getMockCompany(ticker || DEFAULT_TICKER);
}
