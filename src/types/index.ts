/**
 * Data model types for LensAI.
 * These mirror the structure a future backend API would return.
 */

// ---------------------------------------------------------------------------
// Company
// ---------------------------------------------------------------------------

export interface Company {
  ticker: string;
  name: string;
  exchange: string;
  marketCap: string;
  sector: string;
  industry: string;
  /** Logo URL, icon identifier, or single letter for initial (e.g. "M" for MU). */
  logo?: string;
  icon?: string;
  initial?: string;
}

// ---------------------------------------------------------------------------
// Analysis output (report / KPI data)
// ---------------------------------------------------------------------------

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiRow {
  metric: string;
  value: string;
  trend?: KpiTrend;
  /** Optional period breakdown for table display (e.g. FY21, FY22, ...). */
  periodValues?: Record<string, string>;
}

export interface ReportSection {
  title: string;
  content: string;
}

export type AnalysisStatus = 'idle' | 'running' | 'complete';

/**
 * Analysis output: data (workspace) + evaluation (report).
 * Workspace shows only data: companySummary, businessModelOverview, revenueDrivers, industryPositioning (+ kpiRows).
 * Report PDF and report generation use full narrative (data + investmentThesis, keyPositives, keyNegatives, creditAndEsg).
 */
export interface AnalysisOutput {
  companySummary: string;
  investmentThesis: string;
  businessModelOverview: string;
  revenueDrivers: string;
  industryPositioning: string;
  /** Evaluation: used in report PDF, not displayed in workspace. */
  keyPositives: string;
  keyNegatives: string;
  creditAndEsg: string;
  /** Optional caption above KPI table in Workspace + PDF KPI section. */
  kpiSnapshotCaption?: string;
  kpiRows: KpiRow[];
  /** Research Workspace: revenue / earnings table. */
  earningsRevenueSource: string;
  earningsRevenueCaption?: string;
  earningsRevenueRows: KpiRow[];
  /**
   * @deprecated Do not use for report generation. Use getNarrativeBlocks(analysis) only.
   * Kept empty in mock for backend compatibility during migration.
   */
  reportSections: ReportSection[];
  analysisStatus: AnalysisStatus;
}

// ---------------------------------------------------------------------------
// API-shaped response (company + analysis)
// ---------------------------------------------------------------------------

export interface CompanyAnalysisResponse {
  company: Company;
  analysis: AnalysisOutput;
}

// ---------------------------------------------------------------------------
// Service input/output types (API-shaped, for future backend)
// ---------------------------------------------------------------------------

/**
 * @deprecated Use GeneratedReportDocument; kept for backend alignment during migration.
 * Overview payloads are now full documents (title, company, generatedAt, …).
 */
export interface OverviewReportResult {
  reportType: 'overview';
  sections: ReportSection[];
  kpiRows: KpiRow[];
}

export type { GeneratedReportArtifact, GeneratedReportDocument, WorkspaceReportSourceSnapshot } from './reportDocument';
export { hasReportDocument } from './reportDocument';

export type {
  ReportDocument,
  ReportBlock,
  ReportNarrativeBlock,
  ReportBulletsBlock,
  ReportKpiHighlightsBlock,
  AnalysisWorkspaceDocument,
} from './report';

// Re-export app state types for convenience
export type {
  ScreenId,
  AnalystId,
  AnalysisStatus as AppAnalysisStatus,
  ReportTypeId,
  GeneratedReportByType,
  ReportingEngineState,
  AppState,
} from './app';
