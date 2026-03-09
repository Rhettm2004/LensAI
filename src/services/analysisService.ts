/**
 * Data service for company and analysis data.
 * Currently uses mock data; replace with real API calls when backend is ready.
 *
 * Future: GET /analysis/{ticker} → CompanyAnalysisResponse
 */

import type { CompanyAnalysisResponse } from '../types';
import { getMockCompanyAnalysis } from '../mock/data';

/** Simulated network delay (ms). */
const MOCK_DELAY_MS = 300;

/**
 * Fetches company and analysis data for a given ticker.
 * In production this would call: GET /analysis/{ticker}
 */
export async function getCompanyAnalysis(ticker: string): Promise<CompanyAnalysisResponse> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return getMockCompanyAnalysis(ticker);
}
