/**
 * Pattern-based analysis from revenue / earnings series (no LLM).
 */

import type { AnalysisOutput, KpiRow } from '../types';
import type { AnalysisWorkspaceDocument } from '../types/report';
import type { WorkspaceDocument, SourcedTableWorkspaceBlock } from '../types/workspace';
import { EARNINGS_REVENUE_BLOCK_ID } from './workspaceDocument';

const FYS = ['FY21', 'FY22', 'FY23', 'FY24'] as const;

function parseBillions(s: string | undefined): number {
  if (!s || typeof s !== 'string') return NaN;
  const cleaned = s.replace(/[$,]/g, '').trim();
  const n = parseFloat(cleaned);
  if (Number.isNaN(n)) return NaN;
  if (/B/i.test(s)) return n;
  if (/M/i.test(s)) return n / 1000;
  return n;
}

export function seriesForRow(row: KpiRow | undefined): number[] {
  if (!row?.periodValues) return [];
  return FYS.map((k) => parseBillions(row.periodValues![k]));
}

export type RevenuePattern = 'growth' | 'decline' | 'stable' | 'volatile';

export function classifyRevenuePattern(nums: number[]): RevenuePattern {
  if (nums.length < 4 || nums.some((n) => Number.isNaN(n))) return 'stable';
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const spread = mean > 0 ? (Math.max(...nums) - Math.min(...nums)) / mean : 0;
  let inc = 0;
  let dec = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1] * 1.008) inc++;
    else if (nums[i] < nums[i - 1] * 0.992) dec++;
  }
  if (inc >= 3) return 'growth';
  if (dec >= 3) return 'decline';
  if (spread < 0.09) return 'stable';
  const d1 = nums[1] - nums[0];
  const d2 = nums[2] - nums[1];
  const d3 = nums[3] - nums[2];
  const flip =
    (d1 > 0 && d2 < 0) ||
    (d1 < 0 && d2 > 0) ||
    (d2 > 0 && d3 < 0) ||
    (d2 < 0 && d3 > 0);
  if (flip) return 'volatile';
  return 'stable';
}

export function revenueTrendOneLiner(pattern: RevenuePattern): string {
  switch (pattern) {
    case 'growth':
      return 'Revenue has grown consistently over the period, indicating strong expansion.';
    case 'decline':
      return 'Revenue has declined over the period, suggesting weakening demand or structural pressure.';
    case 'volatile':
      return 'Revenue shows significant volatility, indicating cyclical or unstable performance.';
    default:
      return 'Revenue has remained relatively stable, indicating a mature business profile.';
  }
}

function profitabilitySentence(ni: number[]): string {
  if (ni.length < 4 || ni.some((n) => Number.isNaN(n))) {
    return 'Profitability should be read alongside revenue across the full window.';
  }
  const p = classifyRevenuePattern(ni);
  if (p === 'growth')
    return 'Net income has strengthened over the period, reflecting operating improvement.';
  if (p === 'decline')
    return 'Net income has trended lower as the top line weakens.';
  if (p === 'volatile')
    return 'Net income swings materially year to year, tracking the revenue pattern.';
  return 'Net income has been comparatively steady, supporting a predictable earnings profile.';
}

function leverageSentence(rev: number[], ni: number[]): string {
  if (
    rev.length < 4 ||
    ni.length < 4 ||
    rev.some((n) => Number.isNaN(n)) ||
    ni.some((n) => Number.isNaN(n))
  ) {
    return 'Margin behavior warrants attention as revenue evolves.';
  }
  const rCagr = rev[0] > 0 ? ((rev[3] / rev[0]) ** (1 / 3) - 1) * 100 : 0;
  const niCagr =
    ni[0] !== 0 ? ((ni[3] / Math.abs(ni[0])) ** (1 / 3) - 1) * 100 : 0;
  if (niCagr > rCagr + 3)
    return 'Earnings growth has outpaced revenue, suggesting margin expansion.';
  if (niCagr < rCagr - 3)
    return 'Earnings growth has lagged revenue, pointing to cost or mix pressure.';
  return 'Profitability has moved broadly in line with revenue, indicating fairly stable margins.';
}

export function buildFinancialSummaryNarrative(analysis: AnalysisOutput): string {
  const rows = analysis.earningsRevenueRows ?? [];
  const revRow = rows.find((x) => /revenue/i.test(x.metric));
  const niRow = rows.find((x) => /net income/i.test(x.metric));
  const epsRow = rows.find((x) => /eps/i.test(x.metric));
  const pv = (row: typeof revRow) =>
    row?.periodValues && typeof row.periodValues.FY24 === 'string'
      ? row.periodValues.FY24
      : row?.value ?? '—';
  const r = seriesForRow(revRow);
  const n = seriesForRow(niRow);
  const rp = classifyRevenuePattern(r);
  const line1 = `Latest fiscal year: Revenue ${pv(revRow)}, net income ${pv(niRow)}, diluted EPS ${pv(epsRow)}.`;
  const line2 = `${revenueTrendOneLiner(rp)} ${profitabilitySentence(n)}`;
  return `${line1}\n\n${line2}`;
}

/**
 * How the financial profile informs valuation framing (not price targets).
 */
export function buildValuationFramingNarrative(analysis: AnalysisOutput): string {
  const rows = analysis.earningsRevenueRows ?? [];
  const revRow = rows.find((x) => /revenue/i.test(x.metric));
  const niRow = rows.find((x) => /net income/i.test(x.metric));
  const r = seriesForRow(revRow);
  const n = seriesForRow(niRow);
  const rp = classifyRevenuePattern(r);
  const np = classifyRevenuePattern(n);

  const parts: string[] = [];

  switch (rp) {
    case 'growth':
      parts.push(
        'Strong expansion in revenue and earnings would generally support a richer multiple, reflecting expectations of continued growth. The emphasis in framing shifts toward forward run-rate and sustainability of the trajectory.'
      );
      break;
    case 'decline':
      parts.push(
        'Weakening revenue and earnings trends often coincide with multiple compression as growth assumptions are reset. Framing would lean on path to stabilization and balance-sheet optionality rather than trailing peak earnings.'
      );
      break;
    case 'volatile':
      parts.push(
        'Volatile results imply valuation is more meaningfully assessed across a cycle than at a single point. Normalized earnings and mid-cycle assumptions typically matter more than any one fiscal year.'
      );
      break;
    default:
      parts.push(
        'Consistency in revenue and earnings is consistent with a mature profile that often supports a stable valuation framework—one where durability of cash flow weighs more than aggressive re-rating on growth.'
      );
  }

  if (rp === 'volatile' && np === 'volatile') {
    parts.push(
      'Aligned volatility in the top and bottom lines reinforces a cycle-aware approach rather than peak-or-trough anchoring.'
    );
  } else if (rp !== 'volatile' && np === 'volatile') {
    parts.push(
      'Earnings volatility despite a steadier revenue path suggests operating or one-off noise; framing may separate structural margin from transient items.'
    );
  } else if (rp === 'growth' && np === 'decline') {
    parts.push(
      'If revenue grows while earnings lag, framing often focuses on whether margins can recover—multiples may stay constrained until profitability confirms the growth quality.'
    );
  }

  return parts.join('\n\n');
}

function earningsRevenueRowsFromResearchDocument(doc: WorkspaceDocument): KpiRow[] {
  const block = doc.blocks.find(
    (b): b is SourcedTableWorkspaceBlock =>
      b.blockType === 'sourcedTable' && b.id === EARNINGS_REVENUE_BLOCK_ID
  );
  return block?.rows?.length ? block.rows : [];
}

export function buildAnalysisWorkspaceDocument(
  researchDocument: WorkspaceDocument,
  _companyTicker?: string
): AnalysisWorkspaceDocument {
  const rows = earningsRevenueRowsFromResearchDocument(researchDocument);
  const revRow = rows.find((r) => /revenue/i.test(r.metric));
  const niRow = rows.find((r) => /net income/i.test(r.metric));
  const r = seriesForRow(revRow);
  const n = seriesForRow(niRow);

  const commentary = [
    revenueTrendOneLiner(classifyRevenuePattern(r)),
    profitabilitySentence(n),
    leverageSentence(r, n),
  ].join('\n\n');

  return {
    id: 'analysis-earnings-grounded',
    sourceWidgetId: 'earningsRevenue',
    sourceAttribution: '',
    commentary,
    generatedAt: new Date().toISOString(),
  };
}
