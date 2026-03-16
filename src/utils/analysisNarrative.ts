/**
 * Full narrative (data + evaluation) for report preview / ProductReportBody when dataOnly is false.
 * Workspace and Overview PDF use WorkspaceDocument from workspaceDocument.ts only.
 */

import type { AnalysisOutput } from '../types';

export type NarrativeBlock = { title: string; content: string };

/** Full order: data first, then evaluation. Used only for full-narrative preview (e.g. ProductReportBody dataOnly=false). */
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
 * Full narrative (data + evaluation). Used for report preview when dataOnly is false; not for workspace or PDF.
 */
export function getNarrativeBlocks(analysis: AnalysisOutput): NarrativeBlock[] {
  return blocksFromOrder(analysis, FULL_ORDER);
}
