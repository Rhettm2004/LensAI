/**
 * Workflow and report constants used by app state and UI.
 */

import type { GeneratedReportArtifact, GeneratedReportByType, ReportTypeId, ScreenId } from '../types';

export const SCREEN_ORDER: ScreenId[] = [
  'select-company',
  'choose-analyst',
  'workspace',
  'reporting-engine',
  'report-viewer',
];

export const WORKFLOW_STEPS: { id: ScreenId; label: string }[] = [
  { id: 'select-company', label: 'Company Selection' },
  { id: 'choose-analyst', label: 'Analysis Setup' },
  { id: 'workspace', label: 'Research Workspace' },
  { id: 'reporting-engine', label: 'Reporting Engine' },
  { id: 'report-viewer', label: 'Report Workspace' },
];

export const INITIAL_GENERATED_REPORT_BY_TYPE: GeneratedReportByType = {
  overview: null,
  valuation: null,
  industry: null,
  news: null,
};

export const REPORT_TYPE_CONFIG: {
  id: ReportTypeId;
  label: string;
  description: string;
  availableInV0: boolean;
}[] = [
  { id: 'overview', label: 'Overview Report', description: 'Professional initiation report with company summary, investment thesis, financials, key positives/negatives, and credit/ESG notes.', availableInV0: true },
  { id: 'valuation', label: 'Valuation Analysis', description: 'DCF, comparable multiples, and sum-of-the-parts analysis.', availableInV0: false },
  { id: 'industry', label: 'Industry Comparison', description: 'Peer comparison and relative positioning within the sector.', availableInV0: false },
  { id: 'news', label: 'News Impact', description: 'Recent news and events affecting the investment case.', availableInV0: false },
];

export function hasAnyReportGenerated(docs: GeneratedReportByType): boolean {
  const has = (a: GeneratedReportArtifact | null) =>
    a != null && a.pdfBytes != null && a.pdfBytes.length > 0;
  return has(docs.overview) || has(docs.valuation) || has(docs.industry) || has(docs.news);
}

export function getReportTypeLabel(id: ReportTypeId): string {
  return REPORT_TYPE_CONFIG.find((r) => r.id === id)?.label ?? id;
}

export function getPreviousScreen(screen: ScreenId): ScreenId | null {
  const i = SCREEN_ORDER.indexOf(screen);
  return i <= 0 ? null : SCREEN_ORDER[i - 1];
}

export function getCurrentStepIndex(screen: ScreenId): number {
  return SCREEN_ORDER.indexOf(screen);
}
