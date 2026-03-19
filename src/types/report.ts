/**
 * Report document model: block-based report derived from WorkspaceDocument.
 * Used by the reporting layer; future Report Workspace and optional PDF export consume this.
 */

/** Narrative report block: title + prose content. */
export interface ReportNarrativeBlock {
  blockType: 'reportNarrative';
  id: string;
  title: string;
  content: string;
  sourceBlockIds: string[];
}

/** Bullet list report block. */
export interface ReportBulletsBlock {
  blockType: 'reportBullets';
  id: string;
  title: string;
  items: string[];
  sourceBlockIds: string[];
}

/** KPI highlights report block: metric/value rows. */
export interface ReportKpiHighlightsBlock {
  blockType: 'reportKpiHighlights';
  id: string;
  title: string;
  rows: Array<{ metric: string; value: string }>;
  sourceBlockIds: string[];
}

export type ReportBlock = ReportNarrativeBlock | ReportBulletsBlock | ReportKpiHighlightsBlock;

/** Report document: ordered blocks with source traceability. Extensible for future report types. */
export interface ReportDocument {
  id: string;
  reportType: 'overview' | 'valuation';
  sourceWorkspaceDocumentId: string;
  generatedAt: string;
  blocks: ReportBlock[];
}

/** Interpretation layer shown in Analysis Workspace; grounded in research widget. */
export interface AnalysisWorkspaceDocument {
  id: string;
  sourceWidgetId: string;
  sourceAttribution: string;
  /** Plain paragraphs; UI shows as grounded commentary on the research table. */
  commentary: string;
  generatedAt: string;
}
