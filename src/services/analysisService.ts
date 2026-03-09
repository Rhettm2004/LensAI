/**
 * Analysis execution service.
 * Currently uses mock data; replace with real API / job execution when backend is ready.
 *
 * Future: POST /analysis/run → jobId, then poll GET /analysis/status/:jobId
 */

import type { CompanyAnalysisResponse } from '../types';
import { getMockCompanyAnalysis } from '../mock/data';

/** Simulated network delay (ms). */
const MOCK_DELAY_MS = 300;

export interface RunFundamentalAnalysisInput {
  ticker: string;
}

/**
 * Run fundamental analysis for a company.
 * In production this would submit a job and return/poll for results.
 */
export async function runFundamentalAnalysis(
  input: RunFundamentalAnalysisInput
): Promise<CompanyAnalysisResponse> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return getMockCompanyAnalysis(input.ticker);
}

/**
 * Fetches company and analysis data for a given ticker.
 * Convenience wrapper around runFundamentalAnalysis for compatibility.
 * In production: GET /analysis/{ticker} or poll job result.
 */
export async function getCompanyAnalysis(ticker: string): Promise<CompanyAnalysisResponse> {
  return runFundamentalAnalysis({ ticker });
}
