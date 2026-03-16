/**
 * Converts AnalysisOutput into a WorkspaceDocument.
 * Single canonical block order: defined here only. Used by workspace UI and report generation.
 */

import type { AnalysisOutput } from '../types';
import type {
  WorkspaceDocument,
  WorkspaceBlock,
  NarrativeWorkspaceBlock,
  KpiTableWorkspaceBlock,
} from '../types/workspace';

/** Block definitions for the current workspace (data only; no evaluation blocks yet). Order = display = report. */
const WORKSPACE_BLOCK_DEFS: {
  id: string;
  title: string;
  subtitle: string;
  pill: string;
  analysisKey?: keyof AnalysisOutput;
}[] = [
  {
    id: 'companySummary',
    title: 'Company Summary',
    subtitle: 'What the company does, sector, and listing.',
    pill: 'Data',
    analysisKey: 'companySummary',
  },
  {
    id: 'businessModelOverview',
    title: 'Business Model Overview',
    subtitle: 'How the business operates and generates value.',
    pill: 'Data',
    analysisKey: 'businessModelOverview',
  },
  {
    id: 'revenueDrivers',
    title: 'Revenue Drivers',
    subtitle: 'Key drivers and mix of revenue.',
    pill: 'Data',
    analysisKey: 'revenueDrivers',
  },
  {
    id: 'industryPositioning',
    title: 'Industry Positioning',
    subtitle: 'Where the company sits in its industry.',
    pill: 'Data',
    analysisKey: 'industryPositioning',
  },
  {
    id: 'kpiTable',
    title: 'KPI Table',
    subtitle: 'Reconstructed performance trends across key financial metrics.',
    pill: 'KPI Trends',
  },
];

/**
 * Converts AnalysisOutput to WorkspaceDocument with only the blocks currently visible in the workspace.
 * Block order is defined by WORKSPACE_BLOCK_DEFS only.
 */
export function analysisOutputToWorkspaceDocument(analysis: AnalysisOutput): WorkspaceDocument {
  const blocks: WorkspaceBlock[] = [];

  for (const def of WORKSPACE_BLOCK_DEFS) {
    if (def.analysisKey != null) {
      const raw = analysis[def.analysisKey];
      const fullContent = typeof raw === 'string' ? raw.trim() : '';
      blocks.push({
        blockType: 'narrative',
        id: def.id,
        title: def.title,
        fullContent,
      } satisfies NarrativeWorkspaceBlock);
    } else {
      blocks.push({
        blockType: 'kpiTable',
        id: def.id,
        title: def.title,
        caption: analysis.kpiSnapshotCaption?.trim(),
        rows: analysis.kpiRows ?? [],
      } satisfies KpiTableWorkspaceBlock);
    }
  }

  return { blocks };
}

/** Block ids in display/report order. Use when workspace is null (e.g. loading state). */
export const WORKSPACE_BLOCK_IDS_IN_ORDER = WORKSPACE_BLOCK_DEFS.map((d) => d.id);

/** Display config for workspace blocks (title, subtitle, pill). Keyed by block id. */
export function getBlockDisplayConfig(blockId: string): { title: string; subtitle: string; pill: string } | undefined {
  return WORKSPACE_BLOCK_DEFS.find((d) => d.id === blockId);
}

/**
 * Returns narrative sections (title + content) from a workspace, in block order.
 * Used for report compilation and for components that need a flat list of narrative sections.
 */
export function getNarrativeSectionsFromWorkspace(workspace: WorkspaceDocument): { title: string; content: string }[] {
  return workspace.blocks
    .filter((b): b is NarrativeWorkspaceBlock => b.blockType === 'narrative')
    .map((b) => ({ title: b.title, content: b.fullContent }));
}
