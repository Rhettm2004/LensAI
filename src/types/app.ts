/**
 * App / UI state types: workflow, screens, analysis status, reports.
 * Kept separate from domain types (Company, AnalysisOutput, etc.).
 */

import type { Company, CompanyAnalysisResponse, OverviewReportResult } from './index';

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

export type GeneratedReports = {
  overview: boolean;
  valuation: boolean;
  industry: boolean;
  news: boolean;
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
  /**
   * Generated overview report from report service; set only after generateOverviewReport resolves.
   * Null after RUN_ANALYSIS / flow reset so regeneration always starts clean.
   */
  overviewReport: OverviewReportResult | null;
  generatedReports: GeneratedReports;
  reportingEngineState: ReportingEngineState;
  generatingReportType: ReportTypeId | null;
  activeReportType: ReportTypeId | null;
};
