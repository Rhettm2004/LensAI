/**
 * Single mapping from AnalysisOutput → ordered narrative blocks.
 * Report PDF and expanded Product Report widget both use this list only.
 * No reportSections / hidden pipelines — if it's not a field here, it doesn't exist.
 */

import type { AnalysisOutput } from '../types';

export type NarrativeBlock = { title: string; content: string };

const ORDER: { key: keyof AnalysisOutput; title: string }[] = [
  { key: 'companySummary', title: 'Company Summary' },
  { key: 'investmentThesis', title: 'Investment Thesis' },
  { key: 'businessModelOverview', title: 'Business Model Overview' },
  { key: 'revenueDrivers', title: 'Revenue Drivers' },
  { key: 'industryPositioning', title: 'Industry Positioning' },
  { key: 'keyPositives', title: 'Key Positives' },
  { key: 'keyNegatives', title: 'Key Negatives' },
  { key: 'creditAndEsg', title: 'Credit & ESG' },
];

/**
 * Returns only blocks with non-empty trimmed content — same set drives PDF + widget expand.
 */
export function getNarrativeBlocks(analysis: AnalysisOutput): NarrativeBlock[] {
  const out: NarrativeBlock[] = [];
  for (const { key, title } of ORDER) {
    const raw = analysis[key];
    if (typeof raw !== 'string') continue;
    const content = raw.trim();
    if (!content) continue;
    out.push({ title, content });
  }
  return out;
}
