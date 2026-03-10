import type { AnalysisOutput, OverviewReportResult, ReportSection } from '../types/api.js';

const MOCK_DELAY_MS = 1400;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export interface GenerateOverviewInput {
  ticker: string;
  analysis: AnalysisOutput;
}

/**
 * Compile overview report — today echoes sections/KPIs; later LLM/backend job.
 */
export async function generateOverviewReport(input: GenerateOverviewInput): Promise<OverviewReportResult> {
  await delay(MOCK_DELAY_MS);
  const sections: ReportSection[] = input.analysis.reportSections ?? [];
  const kpiRows = input.analysis.kpiRows ?? [];
  return { reportType: 'overview', sections, kpiRows };
}
