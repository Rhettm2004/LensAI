import type { AnalysisOutput } from '../types';

/** One widget per data type a fundamental analyst would use. Expand to see full data. */
export const WORKSPACE_DATA_WIDGETS: {
  id: string;
  title: string;
  subtitle: string;
  pill: string;
  key: keyof AnalysisOutput;
}[] = [
  {
    id: 'companySummary',
    title: 'Company Summary',
    subtitle: 'What the company does, sector, and listing.',
    pill: 'Data',
    key: 'companySummary',
  },
  {
    id: 'businessModelOverview',
    title: 'Business Model Overview',
    subtitle: 'How the business operates and generates value.',
    pill: 'Data',
    key: 'businessModelOverview',
  },
  {
    id: 'revenueDrivers',
    title: 'Revenue Drivers',
    subtitle: 'Key drivers and mix of revenue.',
    pill: 'Data',
    key: 'revenueDrivers',
  },
  {
    id: 'industryPositioning',
    title: 'Industry Positioning',
    subtitle: 'Where the company sits in its industry.',
    pill: 'Data',
    key: 'industryPositioning',
  },
];

export function getWorkspaceDataWidgetContent(
  analysis: AnalysisOutput,
  key: keyof AnalysisOutput
): string {
  const raw = analysis[key];
  return typeof raw === 'string' ? raw.trim() : '';
}
