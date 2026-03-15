import type { Company } from '../types/api.js';
import { getAnalysisBundle, getCompanyByTicker } from '../data/loadBundle.js';

/**
 * Search companies by partial ticker or name (case-insensitive).
 * Replace with DB/OpenSearch later.
 */
export function searchCompanies(query: string): Company[] {
  const raw = (query || '').trim();
  if (!raw.length) return [];
  const q = raw.toLowerCase();
  const bundle = getAnalysisBundle();
  const seen = new Set<string>();
  const out: Company[] = [];
  for (const entry of Object.values(bundle)) {
    const c = entry.company;
    if (seen.has(c.ticker)) continue;
    if (c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) {
      seen.add(c.ticker);
      out.push(c);
    }
  }
  return out;
}

export { getCompanyByTicker };
