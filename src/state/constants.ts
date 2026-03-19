/**
 * Workflow and report constants used by app state and UI.
 */

import type { GeneratedReportArtifact, GeneratedReportByType, ReportTypeId, ScreenId } from '../types';

export const SCREEN_ORDER: ScreenId[] = [
  'select-company',
  'select-analyst',
  'research',
  'analysis-workspace',
  'reporting',
  'report-viewer',
];

export const WORKFLOW_STEPS: { id: ScreenId; label: string }[] = [
  { id: 'select-company', label: 'Select Company' },
  { id: 'select-analyst', label: 'Select Analyst' },
  { id: 'research', label: 'Research Workspace' },
  { id: 'analysis-workspace', label: 'Analysis Workspace' },
  { id: 'reporting', label: 'Reporting Engine' },
  { id: 'report-viewer', label: 'Report & Export' },
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
  {
    id: 'valuation',
    label: 'Valuation Report',
    description:
      'Financial interpretation plus a simple earnings-multiple band versus market cap (illustrative; not a full valuation model).',
    availableInV0: true,
  },
];

export function hasAnyReportGenerated(docs: GeneratedReportByType): boolean {
  const v = docs.valuation;
  return v != null && v.pdfBytes != null && v.pdfBytes.length > 0;
}

export function getReportTypeLabel(id: ReportTypeId): string {
  if (id === 'valuation') return 'Valuation Report';
  return REPORT_TYPE_CONFIG.find((r) => r.id === id)?.label ?? id;
}

export function getPreviousScreen(screen: ScreenId): ScreenId | null {
  const i = SCREEN_ORDER.indexOf(screen);
  return i <= 0 ? null : SCREEN_ORDER[i - 1]!;
}

export function getCurrentStepIndex(screen: ScreenId): number {
  return SCREEN_ORDER.indexOf(screen);
}
