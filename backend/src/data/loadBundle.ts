import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Company, CompanyAnalysisResponse } from '../types/api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Lazy-loaded full analysis responses keyed by ticker (synced from frontend mock). */
let bundle: Record<string, CompanyAnalysisResponse> | null = null;

export function getAnalysisBundle(): Record<string, CompanyAnalysisResponse> {
  if (!bundle) {
    const path = join(__dirname, 'analysisBundle.json');
    bundle = JSON.parse(readFileSync(path, 'utf-8')) as Record<string, CompanyAnalysisResponse>;
  }
  return bundle;
}

export function getTickers(): string[] {
  return Object.keys(getAnalysisBundle());
}

export function getCompanyByTicker(ticker: string): Company | null {
  const normalized = (ticker || '').trim().toUpperCase();
  if (!normalized) return null;
  const b = getAnalysisBundle();
  const entry = b[normalized];
  return entry?.company ?? null;
}

export function getCompanyAnalysisResponse(ticker: string): CompanyAnalysisResponse | null {
  const normalized = (ticker || '').trim().toUpperCase();
  if (!normalized) return null;
  const b = getAnalysisBundle();
  const entry = b[normalized];
  if (!entry) return null;
  return {
    ...entry,
    analysis: { ...entry.analysis, analysisStatus: 'complete' as const },
  };
}
