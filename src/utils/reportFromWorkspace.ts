/**
 * Builds ReportDocument from WorkspaceDocument. Deterministic, rule-based only.
 * Same WorkspaceDocument in -> same ReportDocument shape out.
 * When AnalysisOutput is provided, Investment Thesis and Key Positives/Negatives are filled from it.
 */

import type { AnalysisOutput } from '../types';
import type { WorkspaceDocument, WorkspaceBlock } from '../types/workspace';
import type {
  ReportDocument,
  ReportBlock,
  ReportNarrativeBlock,
  ReportBulletsBlock,
  ReportKpiHighlightsBlock,
} from '../types/report';

function bulletsFromNewlineString(s: string | undefined): string[] {
  if (s == null || !s.trim()) return [];
  return s
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function findBlockById(workspaceDoc: WorkspaceDocument, id: string): WorkspaceBlock | undefined {
  return workspaceDoc.blocks.find((b) => b.id === id);
}

function deriveSourceWorkspaceDocumentId(workspaceDoc: WorkspaceDocument): string {
  return workspaceDoc.blocks.length ? `workspace-${workspaceDoc.blocks.map((b) => b.id).join('-')}` : 'workspace-empty';
}

/** First-pass overview block spec: fixed order, easy to extend later. */
const OVERVIEW_BLOCK_SPEC = [
  {
    reportId: 'overviewSummary',
    title: 'Overview Summary',
    kind: 'reportNarrative' as const,
    sourceWorkspaceBlockId: 'companySummary' as string | null,
  },
  {
    reportId: 'investmentThesis',
    title: 'Investment Thesis',
    kind: 'reportNarrative' as const,
    sourceWorkspaceBlockId: null,
  },
  {
    reportId: 'keyPositives',
    title: 'Key Positives',
    kind: 'reportBullets' as const,
    sourceWorkspaceBlockId: null,
  },
  {
    reportId: 'keyNegatives',
    title: 'Key Negatives',
    kind: 'reportBullets' as const,
    sourceWorkspaceBlockId: null,
  },
  {
    reportId: 'financialTakeaways',
    title: 'Financial Takeaways',
    kind: 'reportKpiHighlights' as const,
    sourceWorkspaceBlockId: 'kpiTable' as string | null,
  },
] as const;

function buildOverviewBlocks(workspaceDoc: WorkspaceDocument, analysis?: AnalysisOutput): ReportBlock[] {
  const blocks: ReportBlock[] = [];

  for (const spec of OVERVIEW_BLOCK_SPEC) {
    const sourceBlock = spec.sourceWorkspaceBlockId
      ? findBlockById(workspaceDoc, spec.sourceWorkspaceBlockId)
      : undefined;
    const sourceBlockIds = sourceBlock ? [sourceBlock.id] : [];

    if (spec.kind === 'reportNarrative') {
      let content =
        sourceBlock?.blockType === 'narrative' ? sourceBlock.fullContent.trim() : '';
      if (spec.reportId === 'investmentThesis' && analysis?.investmentThesis?.trim()) {
        content = analysis.investmentThesis.trim();
      }
      blocks.push({
        blockType: 'reportNarrative',
        id: spec.reportId,
        title: spec.title,
        content,
        sourceBlockIds,
      } satisfies ReportNarrativeBlock);
    } else if (spec.kind === 'reportBullets') {
      let items: string[] = [];
      if (spec.reportId === 'keyPositives' && analysis?.keyPositives != null) {
        items = bulletsFromNewlineString(analysis.keyPositives);
      } else if (spec.reportId === 'keyNegatives' && analysis?.keyNegatives != null) {
        items = bulletsFromNewlineString(analysis.keyNegatives);
      }
      blocks.push({
        blockType: 'reportBullets',
        id: spec.reportId,
        title: spec.title,
        items,
        sourceBlockIds,
      } satisfies ReportBulletsBlock);
    } else {
      const rows =
        sourceBlock?.blockType === 'kpiTable'
          ? sourceBlock.rows.map((r) => ({ metric: r.metric, value: r.value }))
          : [];
      blocks.push({
        blockType: 'reportKpiHighlights',
        id: spec.reportId,
        title: spec.title,
        rows,
        sourceBlockIds,
      } satisfies ReportKpiHighlightsBlock);
    }
  }

  return blocks;
}

/**
 * Builds an overview ReportDocument from a WorkspaceDocument.
 * When analysis is provided, Investment Thesis and Key Positives/Negatives are filled from it.
 * Deterministic: no AI, no randomness. Always emits all five overview blocks;
 * missing workspace/analysis data yields empty content/items/rows and sourceBlockIds [].
 */
export function buildOverviewReportDocument(
  workspaceDoc: WorkspaceDocument,
  analysis?: AnalysisOutput
): ReportDocument {
  const generatedAt = new Date().toISOString();
  const sourceWorkspaceDocumentId = deriveSourceWorkspaceDocumentId(workspaceDoc);
  const blocks = buildOverviewBlocks(workspaceDoc, analysis);

  return {
    id: `report-overview-${sourceWorkspaceDocumentId}-${generatedAt}`,
    reportType: 'overview',
    sourceWorkspaceDocumentId,
    generatedAt,
    blocks,
  };
}
