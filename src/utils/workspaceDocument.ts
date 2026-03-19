/**
 * Converts AnalysisOutput into a WorkspaceDocument.
 * Single sourced earnings / revenue table block.
 */

import type { AnalysisOutput } from '../types';
import type {
  WorkspaceDocument,
  SourcedTableWorkspaceBlock,
  NarrativeWorkspaceBlock,
} from '../types/workspace';

const EARNINGS_REVENUE_BLOCK_ID = 'earningsRevenue';

/**
 * Research Workspace: one widget — revenue & earnings table.
 */
export function analysisOutputToWorkspaceDocument(analysis: AnalysisOutput): WorkspaceDocument {
  const block: SourcedTableWorkspaceBlock = {
    blockType: 'sourcedTable',
    id: EARNINGS_REVENUE_BLOCK_ID,
    title: 'Revenue & earnings',
    sourceAttribution: analysis.earningsRevenueSource?.trim() ?? 'Source not specified.',
    caption: analysis.earningsRevenueCaption?.trim(),
    rows: analysis.earningsRevenueRows?.length ? analysis.earningsRevenueRows : [],
  };
  return { blocks: [block] };
}

export const WORKSPACE_BLOCK_IDS_IN_ORDER = [EARNINGS_REVENUE_BLOCK_ID];

export function getBlockDisplayConfig(blockId: string): { title: string; subtitle: string; pill: string } | undefined {
  if (blockId === EARNINGS_REVENUE_BLOCK_ID) {
    return {
      title: 'Revenue & earnings',
      subtitle: 'Financial metrics by fiscal year.',
      pill: 'Research',
    };
  }
  return undefined;
}

export function getNarrativeSectionsFromWorkspace(workspace: WorkspaceDocument): { title: string; content: string }[] {
  return workspace.blocks
    .filter((b): b is NarrativeWorkspaceBlock => b.blockType === 'narrative')
    .map((b) => ({ title: b.title, content: b.fullContent }));
}
