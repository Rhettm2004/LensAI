/**
 * App / UI state types: workflow, screens, analysis status, reports.
 * Kept separate from domain types (Company, AnalysisOutput, etc.).
 */

import type { Company, CompanyAnalysisResponse } from './index';
import type { GeneratedReportArtifact } from './reportDocument';
import type { ReportDocument } from './report';

export type ScreenId =
  | 'select-company'
  | 'choose-analyst'
  | 'workspace'
  | 'reporting-engine'
  | 'report-viewer';

export type AnalystId = 'fundamental';

/** Single source of truth for analysis workflow; easy to map from backend job status later. */
export type AnalysisStatus =
  | 'idle'
  | 'running'
  | 'widget_1_complete'
  | 'widget_2_complete'
  | 'complete';

export type ReportTypeId = 'overview' | 'valuation' | 'industry' | 'news';

/**
 * One stored document per report type; null = not generated yet.
 * Viewer + PDF both read from here only.
 */
export type GeneratedReportByType = {
  overview: GeneratedReportArtifact | null;
  valuation: GeneratedReportArtifact | null;
  industry: GeneratedReportArtifact | null;
  news: GeneratedReportArtifact | null;
};

export type ReportingEngineState = 'engine' | 'generating';

export type AppState = {
  screen: ScreenId;
  maxStepReached: number;
  tickerInput: string;
  selectedCompany: Company | null;
  selectedAnalystId: AnalystId | null;
  analysisStatus: AnalysisStatus;
  /** Loaded from data service when user runs analysis; drives workspace and report content. */
  analysisData: CompanyAnalysisResponse | null;
  /** Set when getCompanyAnalysis fails; cleared on retry or successful load. */
  analysisLoadError: string | null;
  /** Set when report generation fails; cleared on next Generate. */
  reportGenerationError: string | null;
  /** Generated report payloads keyed by type; single source for viewer + PDF. */
  generatedReportByType: GeneratedReportByType;
  reportingEngineState: ReportingEngineState;
  generatingReportType: ReportTypeId | null;
  activeReportType: ReportTypeId | null;
  /** Report document shown in Report Workspace (overview flow). Cleared when leaving. */
  currentReportDocument: ReportDocument | null;
};
