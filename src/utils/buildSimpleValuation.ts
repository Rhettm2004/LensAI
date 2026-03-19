/**
 * Crude earnings-multiple band vs market cap. MVP only—not a valuation model.
 */

import type { Company } from '../types';
import type { AnalysisOutput } from '../types';
import { classifyRevenuePattern, seriesForRow } from './buildAnalysisFromResearch';

export type ValuationVerdict = 'undervalued' | 'fairly_valued' | 'overvalued';

const MULTIPLES: Record<'growth' | 'stable' | 'cyclical' | 'declining', [number, number]> = {
  growth: [25, 35],
  stable: [20, 26],
  cyclical: [12, 18],
  declining: [8, 12],
};

/** Market cap string e.g. $2.72T, $126B → billions USD */
export function parseMarketCapBillions(marketCap: string): number | null {
  const m = (marketCap || '').trim().match(/\$?\s*([\d.]+)\s*([TtBb])/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  const u = m[2].toUpperCase();
  if (u === 'T') return n * 1000;
  return n;
}

function valuationProfileFromRevenuePattern(
  pattern: ReturnType<typeof classifyRevenuePattern>
): keyof typeof MULTIPLES {
  if (pattern === 'volatile') return 'cyclical';
  if (pattern === 'decline') return 'declining';
  if (pattern === 'growth') return 'growth';
  return 'stable';
}

function profileLabel(key: keyof typeof MULTIPLES): string {
  switch (key) {
    case 'growth':
      return 'growth-oriented';
    case 'declining':
      return 'declining';
    case 'cyclical':
      return 'cyclical';
    default:
      return 'stable';
  }
}

function formatBillions(b: number): string {
  if (b >= 1000) return `$${(b / 1000).toFixed(2)}T`;
  if (b >= 1) return `$${b.toFixed(1)}B`;
  return `$${(b * 1000).toFixed(0)}M`;
}

export function computeSimpleValuation(
  company: Company,
  analysis: AnalysisOutput
): {
  verdict: ValuationVerdict | null;
  mcapB: number | null;
  niB: number | null;
  lowM: number;
  highM: number;
  lowV: number;
  highV: number;
  profile: keyof typeof MULTIPLES;
} | null {
  const mcapB = parseMarketCapBillions(company.marketCap);
  const rows = analysis.earningsRevenueRows ?? [];
  const revRow = rows.find((r) => /revenue/i.test(r.metric));
  const niRow = rows.find((r) => /net income/i.test(r.metric));
  if (!revRow || !niRow) return null;
  const niSeries = seriesForRow(niRow);
  const niB = niSeries[3];
  if (mcapB == null || niB == null || Number.isNaN(niB) || niB <= 0) return null;

  const profile = valuationProfileFromRevenuePattern(classifyRevenuePattern(seriesForRow(revRow)));
  const [lowM, highM] = MULTIPLES[profile];
  const lowV = niB * lowM;
  const highV = niB * highM;

  let verdict: ValuationVerdict;
  if (mcapB > highV) verdict = 'overvalued';
  else if (mcapB < lowV) verdict = 'undervalued';
  else verdict = 'fairly_valued';

  return { verdict, mcapB, niB, lowM, highM, lowV, highV, profile };
}

export function buildValuationSectionContent(company: Company, analysis: AnalysisOutput): string {
  const r = computeSimpleValuation(company, analysis);
  if (!r) {
    return [
      'A simple earnings-multiple check could not be completed with the available figures (e.g. market cap or net income not usable here).',
      'No undervalued / fairly valued / overvalued call is made in that case.',
    ].join('\n\n');
  }

  const { mcapB, niB, lowM, highM, lowV, highV, profile, verdict } = r;
  const niDisplay =
    analysis.earningsRevenueRows?.find((x) => /net income/i.test(x.metric))?.periodValues?.FY24 ??
    formatBillions(niB);

  const compare =
    verdict === 'overvalued'
      ? `Market capitalization sits above the upper end of this band (${formatBillions(highV)}), which suggests the market may be pricing the shares richer than this crude trailing-earnings lens implies.`
      : verdict === 'undervalued'
        ? `Market capitalization falls below the lower end of the band (${formatBillions(lowV)}), which suggests the shares may appear comparatively modest versus this simple framework.`
        : `Market capitalization falls between ${formatBillions(lowV)} and ${formatBillions(highV)}, which suggests alignment—within this rough band—with trailing earnings at the chosen multiples.`;

  return [
    `Current market cap: ${company.marketCap} (about ${formatBillions(mcapB)} in billion-dollar terms for comparison).`,
    `Net income used (latest fiscal year in the dataset): ${niDisplay} (about ${formatBillions(niB)}).`,
    `Earnings pattern treated as **${profileLabel(profile)}**; a tentative trailing P/E range of **${lowM}×–${highM}×** net income is applied. This is a stylized band for MVP illustration, not a peer-derived or optimized multiple.`,
    `Implied valuation range (net income × band): roughly **${formatBillions(lowV)}–${formatBillions(highV)}**.`,
    compare,
  ].join('\n\n');
}

export function buildValuationConclusionContent(company: Company, analysis: AnalysisOutput): string {
  const r = computeSimpleValuation(company, analysis);
  if (!r) {
    return 'Based on this simple earnings-based framework, no clear undervalued / fairly valued / overvalued call is offered—inputs were insufficient for the comparison.';
  }
  const word =
    r.verdict === 'overvalued'
      ? 'overvalued'
      : r.verdict === 'undervalued'
        ? 'undervalued'
        : 'fairly valued';
  return [
    `Based on this simple earnings-based framework, the stock appears **${word}** relative to trailing net income and the stated multiple range.`,
    'This suggests a directional read only; it does not imply precision and should not be read as a price target. It uses only revenue, net income, EPS context, and market cap as surfaced in this workflow.',
  ].join('\n\n');
}
