/**
 * Loads pre-built analysis responses (synced from frontend mock via script).
 * Replace with DB/API when ready.
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { CompanyAnalysisResponse } from '../types/api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bundlePath = join(__dirname, 'analysisBundle.json');

let bundle: Record<string, CompanyAnalysisResponse> | null = null;

function loadBundle(): Record<string, CompanyAnalysisResponse> {
  if (bundle) return bundle;
  const raw = readFileSync(bundlePath, 'utf-8');
  bundle = JSON.parse(raw) as Record<string, CompanyAnalysisResponse>;
  return bundle;
}

export function getAnalysisResponse(ticker: string): CompanyAnalysisResponse | null {
  const normalized = (ticker || '').trim().toUpperCase();
  if (!normalized) return null;
  const b = loadBundle();
  return b[normalized] ?? null;
}

export function listCompaniesFromBundle(): CompanyAnalysisResponse[] {
  return Object.values(loadBundle());
}
