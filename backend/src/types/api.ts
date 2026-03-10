/**
 * Mirrors frontend src/types — API contract only.
 * Keep in sync when frontend models change.
 */

export interface Company {
  ticker: string;
  name: string;
  exchange: string;
  marketCap: string;
  sector: string;
  industry: string;
  logo?: string;
  icon?: string;
  initial?: string;
}

export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiRow {
  metric: string;
  value: string;
  trend?: KpiTrend;
  periodValues?: Record<string, string>;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface AnalysisOutput {
  companySummary: string;
  businessModelOverview: string;
  revenueDrivers: string;
  industryPositioning: string;
  kpiRows: KpiRow[];
  reportSections: ReportSection[];
  analysisStatus: 'idle' | 'running' | 'complete';
}

export interface CompanyAnalysisResponse {
  company: Company;
  analysis: AnalysisOutput;
}

export interface OverviewReportResult {
  reportType: 'overview';
  sections: ReportSection[];
  kpiRows: KpiRow[];
}
