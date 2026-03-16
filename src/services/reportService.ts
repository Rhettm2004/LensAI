/**
 * Report generation: one branded PDF from ReportDocument.
 * Pipeline: analysis → WorkspaceDocument → buildOverviewReportDocument → ReportDocument → buildBrandedPdfFromReport.
 * Future: POST /reports/generate returns same artifact (PDF bytes + metadata).
 */

import { REPORT_GENERATION_MOCK_MS } from '../constants/timing';
import type { AnalysisOutput, Company } from '../types';
import type { GeneratedReportArtifact } from '../types/reportDocument';
import type { ReportDocument } from '../types/report';
import { getReportTypeLabel } from '../state/constants';
import { analysisOutputToWorkspaceDocument } from '../utils/workspaceDocument';
import { buildOverviewReportDocument } from '../utils/reportFromWorkspace';
import { buildBrandedPdfFromReport } from './reportPdfFromReport';

export interface GenerateOverviewReportInput {
  ticker: string;
  company: Company;
  /** Analysis output — PDF built via WorkspaceDocument → ReportDocument. */
  analysis: AnalysisOutput;
}

/**
 * Generate overview artifact: PDF built from ReportDocument (workspace + analysis → reportDoc → PDF).
 */
export async function generateOverviewReport(
  input: GenerateOverviewReportInput
): Promise<GeneratedReportArtifact> {
  await new Promise((resolve) => setTimeout(resolve, REPORT_GENERATION_MOCK_MS));

  const workspace = analysisOutputToWorkspaceDocument(input.analysis);
  const reportDoc = buildOverviewReportDocument(workspace, input.analysis);
  const generatedAt = reportDoc.generatedAt;
  const title = getReportTypeLabel('overview');

  const pdfBytes = await buildBrandedPdfFromReport({
    reportDocument: reportDoc,
    company: input.company,
    reportTypeId: 'overview',
    title,
    generatedAtIso: generatedAt,
  });

  const narrativeBlocks = reportDoc.blocks.filter((b) => b.blockType === 'reportNarrative');
  const kpiBlock = reportDoc.blocks.find((b) => b.blockType === 'reportKpiHighlights');
  const kpiRowCount =
    kpiBlock?.blockType === 'reportKpiHighlights' ? kpiBlock.rows.length : 0;
  const hasKpiCaption = false;

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

/**
 * Build a download artifact from an existing ReportDocument and PDF bytes.
 * Used when exporting from Report Workspace so the PDF matches the current report.
 */
export function buildOverviewReportArtifactFromReport(
  reportDoc: ReportDocument,
  company: Company,
  pdfBytes: Uint8Array
): GeneratedReportArtifact {
  const title = getReportTypeLabel('overview');
  const narrativeBlocks = reportDoc.blocks.filter((b) => b.blockType === 'reportNarrative');
  const kpiBlock = reportDoc.blocks.find((b) => b.blockType === 'reportKpiHighlights');
  const kpiRowCount =
    kpiBlock?.blockType === 'reportKpiHighlights' ? kpiBlock.rows.length : 0;
  return {
    reportTypeId: 'overview',
    title,
    company,
    generatedAt: reportDoc.generatedAt,
    workspaceSource: {
      narrativeBlockTitles: narrativeBlocks.map((b) => b.title),
      kpiRowCount,
      hasKpiCaption: false,
    },
    pdfBytes,
  };
}
