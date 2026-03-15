/**
 * Company lookup and search.
 * Currently uses mock data; replace with real API calls when backend is ready.
 *
 * Future: GET /companies/search?q=... → Company[]
 * Future: GET /companies/by-ticker/:ticker → Company | 404
 */

import type { Company } from '../types';
import { getMockCompany, MOCK_TICKERS } from '../mock/data';

/** Simulated network delay (ms). */
const MOCK_DELAY_MS = 100;

/**
 * Search companies by query (partial ticker and/or partial name, case-insensitive).
 * In production this would call: GET /companies/search?q=...
 * Mock scans the in-memory list; backend would return ranked results.
 */
export async function searchCompanies(query: string): Promise<Company[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const raw = (query || '').trim();
  if (raw.length === 0) return [];

  const q = raw.toLowerCase();
  const seen = new Set<string>();
  const out: Company[] = [];

  for (const ticker of MOCK_TICKERS) {
    const company = getMockCompany(ticker);
    const tickerLower = company.ticker.toLowerCase();
    const nameLower = company.name.toLowerCase();
    if (tickerLower.includes(q) || nameLower.includes(q)) {
      if (!seen.has(company.ticker)) {
        seen.add(company.ticker);
        out.push(company);
      }
    }
  }

  return out;
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
/**
 * Resolve a company for display when no selection exists (defensive fallback).
 * Avoids silently defaulting to a single demo ticker when input is empty—uses first
 * known mock ticker instead. Unknown non-empty tickers still flow through getMockCompany
 * (mock layer may fall back for analysis shape only).
 */
export function getCompanyForDisplay(ticker: string): Company {
  const normalized = (ticker || '').trim().toUpperCase();
  if (normalized.length === 0) {
    return getMockCompany(MOCK_TICKERS[0]);
  }
  return getMockCompany(normalized);
}
