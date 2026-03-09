/**
 * Report generation service.
 * Currently builds from in-memory analysis; replace with backend generation when ready.
 *
 * Future: POST /reports/generate → jobId, then GET /reports/:reportId
 */

import type { AnalysisOutput, OverviewReportResult, ReportSection } from '../types';

export interface GenerateOverviewReportInput {
  /** Company ticker (for future API). */
  ticker: string;
  /** Analysis output to compile into overview report. */
  analysis: AnalysisOutput;
}

/** Simulated generation delay (ms). */
const MOCK_DELAY_MS = 1400;

/**
 * Generate overview report from analysis output.
 * In production this would call the backend to compile/generate the report.
 */
export async function generateOverviewReport(
  input: GenerateOverviewReportInput
): Promise<OverviewReportResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const sections: ReportSection[] = input.analysis.reportSections ?? [];
  return { reportType: 'overview', sections };
}
