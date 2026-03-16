/**
 * Workspace document model: single source of truth for workspace UI and report generation.
 * All visible workspace content and report content are derived from WorkspaceDocument.blocks.
 */

import type { KpiRow } from './index';

/** Narrative block: title + full content, optional summary for collapsed view. */
export interface NarrativeWorkspaceBlock {
  blockType: 'narrative';
  id: string;
  title: string;
  fullContent: string;
  summaryContent?: string;
}

/** KPI table block: title, optional caption, rows. */
export interface KpiTableWorkspaceBlock {
  blockType: 'kpiTable';
  id: string;
  title: string;
  caption?: string;
  rows: KpiRow[];
}

export type WorkspaceBlock = NarrativeWorkspaceBlock | KpiTableWorkspaceBlock;

/** Workspace document: ordered list of blocks. Order = display order = report section order. */
export interface WorkspaceDocument {
  blocks: WorkspaceBlock[];
}
