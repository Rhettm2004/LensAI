/**
 * Report generation: one branded PDF from Workspace analysis only.
 * Future: POST /reports/generate returns same artifact (PDF bytes + metadata).
 */

import { REPORT_GENERATION_MOCK_MS } from '../constants/timing';
import type { AnalysisOutput, Company } from '../types';
import type { GeneratedReportArtifact } from '../types/reportDocument';
import { getReportTypeLabel } from '../state/constants';
import { analysisOutputToWorkspaceDocument } from '../utils/workspaceDocument';
import { buildBrandedPdfFromWorkspace } from './reportPdfFromWorkspace';

export interface GenerateOverviewReportInput {
  ticker: string;
  company: Company;
  /** Workspace output — PDF built from derived WorkspaceDocument only. */
  analysis: AnalysisOutput;
}

/**
 * Generate overview artifact: PDF built strictly from workspace document (derived from analysis).
 */
export async function generateOverviewReport(
  input: GenerateOverviewReportInput
): Promise<GeneratedReportArtifact> {
  await new Promise((resolve) => setTimeout(resolve, REPORT_GENERATION_MOCK_MS));

  const workspace = analysisOutputToWorkspaceDocument(input.analysis);
  const generatedAt = new Date().toISOString();
  const title = getReportTypeLabel('overview');

  const pdfBytes = await buildBrandedPdfFromWorkspace({
    workspace,
    company: input.company,
    reportTypeId: 'overview',
    title,
    generatedAtIso: generatedAt,
  });

  const narrativeBlocks = workspace.blocks.filter((b) => b.blockType === 'narrative');
  const kpiBlock = workspace.blocks.find((b) => b.blockType === 'kpiTable');
  const kpiRowCount = kpiBlock?.blockType === 'kpiTable' ? kpiBlock.rows.length : 0;
  const hasKpiCaption = kpiBlock?.blockType === 'kpiTable' && Boolean(kpiBlock.caption?.trim());

  return {
    reportTypeId: 'overview',
    title,
    company: input.company,
    generatedAt,
    workspaceSource: {
      narrativeBlockTitles: narrativeBlocks.map((b) => b.title),
      kpiRowCount,
      hasKpiCaption,
    },
    pdfBytes,
  };
}
