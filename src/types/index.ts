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

export interface AnalysisOutput {
  companySummary: string;
  businessModelOverview: string;
  revenueDrivers: string;
  industryPositioning: string;
  kpiRows: KpiRow[];
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

export interface OverviewReportResult {
  reportType: 'overview';
  sections: ReportSection[];
}

// Re-export app state types for convenience
export type {
  ScreenId,
  AnalystId,
  AnalysisStatus as AppAnalysisStatus,
  ReportTypeId,
  GeneratedReports,
  ReportingEngineState,
  AppState,
} from './app';
