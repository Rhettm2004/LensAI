/**
 * Report generation: one branded PDF from Workspace analysis only.
 * Future: POST /reports/generate returns same artifact (PDF bytes + metadata).
 */

import { REPORT_GENERATION_MOCK_MS } from '../constants/timing';
import type { AnalysisOutput, Company } from '../types';
import type { GeneratedReportArtifact } from '../types/reportDocument';
import { getReportTypeLabel } from '../state/constants';
import { getWorkspaceDataBlocks } from '../utils/analysisNarrative';
import { buildBrandedPdfFromWorkspace } from './reportPdfFromWorkspace';

export interface GenerateOverviewReportInput {
  ticker: string;
  company: Company;
  /** Workspace output — PDF built only from narrative fields + kpiRows (+ optional caption). */
  analysis: AnalysisOutput;
}

/**
 * Generate overview artifact: PDF built strictly from analysis (workspace) data.
 */
export async function generateOverviewReport(
  input: GenerateOverviewReportInput
): Promise<GeneratedReportArtifact> {
  await new Promise((resolve) => setTimeout(resolve, REPORT_GENERATION_MOCK_MS));

  const narrativeBlocks = getWorkspaceDataBlocks(input.analysis);
  const kpiRows = input.analysis.kpiRows ?? [];
  const generatedAt = new Date().toISOString();
  const title = getReportTypeLabel('overview');

  const pdfBytes = await buildBrandedPdfFromWorkspace({
    analysis: input.analysis,
    company: input.company,
    reportTypeId: 'overview',
    title,
    generatedAtIso: generatedAt,
  });

  return {
    reportTypeId: 'overview',
    title,
    company: input.company,
    generatedAt,
    workspaceSource: {
      narrativeBlockTitles: narrativeBlocks.map((b) => b.title),
      kpiRowCount: kpiRows.length,
      hasKpiCaption: Boolean(input.analysis.kpiSnapshotCaption?.trim()),
    },
    pdfBytes,
  };
}
