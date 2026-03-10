/**
 * Report generation service.
 * Currently builds from in-memory analysis; replace with backend generation when ready.
 *
 * Future: POST /reports/generate → jobId, then GET /reports/:reportId
 */

import { REPORT_GENERATION_MOCK_MS } from '../constants/timing';
import type { AnalysisOutput, OverviewReportResult, ReportSection } from '../types';

export interface GenerateOverviewReportInput {
  /** Company ticker (for future API). */
  ticker: string;
  /** Analysis output to compile into overview report. */
  analysis: AnalysisOutput;
}

/**
 * Generate overview report from analysis output.
 * In production this would call the backend to compile/generate the report.
 */
export async function generateOverviewReport(
  input: GenerateOverviewReportInput
): Promise<OverviewReportResult> {
  await new Promise((resolve) => setTimeout(resolve, REPORT_GENERATION_MOCK_MS));
  const sections: ReportSection[] = input.analysis.reportSections ?? [];
  const kpiRows = input.analysis.kpiRows ?? [];
  return { reportType: 'overview', sections, kpiRows };
}
