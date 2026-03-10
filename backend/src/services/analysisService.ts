import type { CompanyAnalysisResponse } from '../types/api.js';
import { getCompanyAnalysisResponse } from '../data/loadBundle.js';

/** Simulated delay — remove when calling real job/OpenAI. */
const MOCK_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Run analysis for ticker — today returns mock bundle; later enqueue job + poll.
 */
export async function runAnalysis(ticker: string): Promise<CompanyAnalysisResponse | null> {
  await delay(MOCK_DELAY_MS);
  return getCompanyAnalysisResponse(ticker);
}
