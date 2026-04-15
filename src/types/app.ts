/**
 * App / UI state types: workflow, screens, analysis status, reports.
 * Kept separate from domain types (Company, AnalysisOutput, etc.).
 */

import type { Company, CompanyAnalysisResponse } from './index';
import type { GeneratedReportArtifact } from './reportDocument';
import type { ReportDocument, AnalysisWorkspaceDocument } from './report';
import type { WorkspaceDocument } from './workspace';

export type ScreenId =
  | 'select-company'
  | 'select-analyst'
  | 'research'
  | 'analysis-workspace'
  | 'reporting'
  | 'report-viewer';

export type AnalystId = 'fundamental';

export type AnalysisStatus = 'idle' | 'running' | 'complete';

export type ReportTypeId = 'overview' | 'valuation' | 'industry' | 'news';

/**
 * One stored document per report type; null = not generated yet.
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
  analysisData: CompanyAnalysisResponse | null;
  /** Research Workspace: canonical workspace document built when analysis loads. */
  currentResearchDocument: WorkspaceDocument | null;
  analysisLoadError: string | null;
  reportGenerationError: string | null;
  generatedReportByType: GeneratedReportByType;
  reportingEngineState: ReportingEngineState;
  generatingReportType: ReportTypeId | null;
  activeReportType: ReportTypeId | null;
  /** Valuation report document for preview / PDF on Reporting step. */
  currentReportDocument: ReportDocument | null;
  /** Analysis Workspace: interpretation grounded in research earnings table. */
  currentAnalysisDocument: AnalysisWorkspaceDocument | null;
  /** After reveal animation; `${ticker}|${generatedAt}` — instant return when unchanged. */
  analysisWorkspaceRevealCompleteKey: string | null;
};
