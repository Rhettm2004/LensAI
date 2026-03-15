/**
 * Narrative blocks: workspace shows data only; report (PDF) shows data + evaluation.
 * No reportSections / hidden pipelines — if it's not a field here, it doesn't exist.
 */

import type { AnalysisOutput } from '../types';

export type NarrativeBlock = { title: string; content: string };

/** Full order: data first, then evaluation. Used for report PDF and report generation. */
const FULL_ORDER: { key: keyof AnalysisOutput; title: string }[] = [
  { key: 'companySummary', title: 'Company Summary' },
  { key: 'investmentThesis', title: 'Investment Thesis' },
  { key: 'businessModelOverview', title: 'Business Model Overview' },
  { key: 'revenueDrivers', title: 'Revenue Drivers' },
  { key: 'industryPositioning', title: 'Industry Positioning' },
  { key: 'keyPositives', title: 'Key Positives' },
  { key: 'keyNegatives', title: 'Key Negatives' },
  { key: 'creditAndEsg', title: 'Credit & ESG' },
];

/** Workspace only: factual data. Evaluation (thesis, pros/cons) lives in the reporting engine. */
const WORKSPACE_DATA_ORDER: { key: keyof AnalysisOutput; title: string }[] = [
  { key: 'companySummary', title: 'Company Summary' },
  { key: 'businessModelOverview', title: 'Business Model Overview' },
  { key: 'revenueDrivers', title: 'Revenue Drivers' },
  { key: 'industryPositioning', title: 'Industry Positioning' },
];

function blocksFromOrder(
  analysis: AnalysisOutput,
  order: { key: keyof AnalysisOutput; title: string }[]
): NarrativeBlock[] {
  const out: NarrativeBlock[] = [];
  for (const { key, title } of order) {
    const raw = analysis[key];
    if (typeof raw !== 'string') continue;
    const content = raw.trim();
    if (!content) continue;
    out.push({ title, content });
  }
  return out;
}

/**
 * Data-only blocks for the workspace. No thesis, pros/cons, or credit & ESG here.
 */
export function getWorkspaceDataBlocks(analysis: AnalysisOutput): NarrativeBlock[] {
  return blocksFromOrder(analysis, WORKSPACE_DATA_ORDER);
}

/**
 * Full narrative (data + evaluation) for report PDF and report generation.
 */
export function getNarrativeBlocks(analysis: AnalysisOutput): NarrativeBlock[] {
  return blocksFromOrder(analysis, FULL_ORDER);
}
