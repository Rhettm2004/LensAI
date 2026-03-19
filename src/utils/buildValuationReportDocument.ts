/**
 * Valuation report: interpretation + simple earnings-multiple band vs market cap.
 */

import type { Company } from '../types';
import type { AnalysisWorkspaceDocument, ReportDocument, ReportBlock } from '../types/report';
import type { AnalysisOutput } from '../types';
import {
  buildFinancialSummaryNarrative,
  buildValuationFramingNarrative,
} from './buildAnalysisFromResearch';
import { buildValuationConclusionContent, buildValuationSectionContent } from './buildSimpleValuation';

export function buildValuationReportDocument(
  analysis: AnalysisOutput,
  analysisDoc: AnalysisWorkspaceDocument,
  company: Company
): ReportDocument {
  const blocks: ReportBlock[] = [
    {
      blockType: 'reportNarrative',
      id: 'valuationFinancialSummary',
      title: 'Financial Summary',
      content: buildFinancialSummaryNarrative(analysis),
      sourceBlockIds: ['earningsRevenue'],
    },
    {
      blockType: 'reportNarrative',
      id: 'valuationFinancialInterpretation',
      title: 'Financial Interpretation',
      content: analysisDoc.commentary.trim(),
      sourceBlockIds: ['earningsRevenue'],
    },
    {
      blockType: 'reportNarrative',
      id: 'valuationFraming',
      title: 'Valuation Framing',
      content: buildValuationFramingNarrative(analysis),
      sourceBlockIds: ['earningsRevenue'],
    },
    {
      blockType: 'reportNarrative',
      id: 'valuationEstimate',
      title: 'Valuation',
      content: buildValuationSectionContent(company, analysis),
      sourceBlockIds: ['earningsRevenue'],
    },
    {
      blockType: 'reportNarrative',
      id: 'valuationClosing',
      title: 'Conclusion',
      content: buildValuationConclusionContent(company, analysis),
      sourceBlockIds: ['earningsRevenue'],
    },
  ];

  return {
    id: `valuation-${analysisDoc.generatedAt}`,
    reportType: 'valuation',
    sourceWorkspaceDocumentId: 'earningsRevenue',
    generatedAt: new Date().toISOString(),
    blocks,
  };
}

export function valuationReportTitle(company: Company): string {
  return `${company.name} (${company.ticker}) — Valuation Report`;
}
