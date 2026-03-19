/**
 * Report generation: branded PDF from ReportDocument.
 */

import { REPORT_GENERATION_MOCK_MS } from '../constants/timing';
import type { AnalysisOutput, Company } from '../types';
import type { GeneratedReportArtifact } from '../types/reportDocument';
import type { ReportDocument } from '../types/report';
import type { AnalysisWorkspaceDocument } from '../types/report';
import { valuationReportTitle } from '../utils/buildValuationReportDocument';
import { buildValuationReportDocument } from '../utils/buildValuationReportDocument';
import { buildBrandedPdfFromReport } from './reportPdfFromReport';

export interface GenerateValuationReportInput {
  ticker: string;
  company: Company;
  analysis: AnalysisOutput;
  analysisDoc: AnalysisWorkspaceDocument;
}

export async function generateValuationReport(
  input: GenerateValuationReportInput
): Promise<{ artifact: GeneratedReportArtifact; reportDocument: ReportDocument }> {
  await new Promise((resolve) => setTimeout(resolve, REPORT_GENERATION_MOCK_MS));

  const reportDoc = buildValuationReportDocument(
    input.analysis,
    input.analysisDoc,
    input.company
  );
  const generatedAt = reportDoc.generatedAt;
  const docTitle = valuationReportTitle(input.company);

  const pdfBytes = await buildBrandedPdfFromReport({
    reportDocument: reportDoc,
    company: input.company,
    reportTypeId: 'valuation',
    title: docTitle,
    generatedAtIso: generatedAt,
  });

  const artifact: GeneratedReportArtifact = {
    reportTypeId: 'valuation',
    title: docTitle,
    company: input.company,
    generatedAt,
    workspaceSource: {
      narrativeBlockTitles: reportDoc.blocks
        .filter((b) => b.blockType === 'reportNarrative')
        .map((b) => b.title),
      kpiRowCount: reportDoc.blocks.find((b) => b.blockType === 'reportKpiHighlights')?.rows.length ?? 0,
      hasKpiCaption: false,
    },
    pdfBytes,
  };

  return { artifact, reportDocument: reportDoc };
}

export function buildValuationReportArtifactFromReport(
  reportDoc: ReportDocument,
  company: Company,
  pdfBytes: Uint8Array
): GeneratedReportArtifact {
  const title = valuationReportTitle(company);
  const narrativeBlocks = reportDoc.blocks.filter((b) => b.blockType === 'reportNarrative');
  const kpiBlock = reportDoc.blocks.find((b) => b.blockType === 'reportKpiHighlights');
  return {
    reportTypeId: 'valuation',
    title,
    company,
    generatedAt: reportDoc.generatedAt,
    workspaceSource: {
      narrativeBlockTitles: narrativeBlocks.map((b) => b.title),
      kpiRowCount: kpiBlock?.blockType === 'reportKpiHighlights' ? kpiBlock.rows.length : 0,
      hasKpiCaption: false,
    },
    pdfBytes,
  };
}

/** @deprecated Legacy overview path — kept for any stray imports during migration. */
export async function generateOverviewReport(): Promise<never> {
  throw new Error('Overview report is not available; use generateValuationReport.');
}
