/**
 * Structured financial datasets per company (frontend-only; swap for API later).
 */

import type { Company, CompanyAnalysisResponse, KpiRow } from '../types';

const MOCK_COMPANIES: Record<string, Company> = {
  AAPL: {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    marketCap: '$2.72T',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    initial: 'A',
  },
  MU: {
    ticker: 'MU',
    name: 'Micron Technology, Inc.',
    exchange: 'NASDAQ',
    marketCap: '$126B',
    sector: 'Technology',
    industry: 'Semiconductors',
    initial: 'M',
  },
  MSFT: {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    marketCap: '$2.89T',
    sector: 'Technology',
    industry: 'Software & Cloud',
    initial: 'M',
  },
  NVDA: {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    marketCap: '$2.2T',
    sector: 'Technology',
    industry: 'Semiconductors & GPU',
    initial: 'N',
  },
};

function buildKpiRows(
  rows: Array<{ metric: string; periodValues: Record<string, string>; trend?: KpiRow['trend'] }>
): KpiRow[] {
  return rows.map(({ metric, periodValues, trend }) => ({
    metric,
    value: Object.values(periodValues).pop() ?? '—',
    trend,
    periodValues,
  }));
}

const KPI_CAPTION =
  'Historical KPIs summarized below; figures align with the revenue and earnings table for this company.';

/** Growth archetype (NVDA-style) */
const NVDA_ANALYSIS: Omit<CompanyAnalysisResponse['analysis'], 'analysisStatus'> = {
  companySummary:
    'NVIDIA Corporation supplies accelerated computing platforms for AI, data centre, gaming, and professional visualization, with CUDA and full-stack software as key differentiators.',
  investmentThesis:
    'Leadership in AI infrastructure and data centre GPUs supports premium positioning; scale and ecosystem depth underpin long-term returns, with cyclicality around capital spending and competition.',
  businessModelOverview:
    'Revenue mixes data centre accelerators, gaming GPUs, and software; high R&D and foundry partnerships define the operating model.',
  revenueDrivers:
    'AI training and inference demand, cloud capex cycles, gaming refresh, and automotive edge adoption.',
  industryPositioning:
    'Among the primary architects of the AI compute stack; competes on architecture, software, and supply execution.',
  keyPositives: [
    'Dominant share in AI training accelerators.',
    'Strong revenue and earnings expansion across the window.',
    'Balance sheet capacity for R&D and strategic investments.',
  ].join('\n'),
  keyNegatives: [
    'Concentration in cyclical data centre spend.',
    'Export and geopolitical constraints in key regions.',
    'Competition from custom silicon and alternative architectures.',
  ].join('\n'),
  creditAndEsg:
    'Investment-grade credit profile assumed; ESG focus on data centre energy efficiency and supply chain responsibility.',
  kpiSnapshotCaption: KPI_CAPTION,
  kpiRows: buildKpiRows([
    { metric: 'Revenue', periodValues: { FY21: '$12.0B', FY22: '$18.0B', FY23: '$26.0B', FY24: '$40.0B' }, trend: 'up' },
    { metric: 'EBITDA', periodValues: { FY21: '$5.4B', FY22: '$8.1B', FY23: '$11.7B', FY24: '$18.0B' }, trend: 'up' },
    { metric: 'Free Cash Flow', periodValues: { FY21: '$1.6B', FY22: '$2.8B', FY23: '$5.6B', FY24: '$9.6B' }, trend: 'up' },
  ]),
  earningsRevenueSource: '',
  earningsRevenueCaption: '',
  earningsRevenueRows: buildKpiRows([
    { metric: 'Revenue', periodValues: { FY21: '$12.0B', FY22: '$18.0B', FY23: '$26.0B', FY24: '$40.0B' }, trend: 'up' },
    { metric: 'Net income', periodValues: { FY21: '$2.0B', FY22: '$3.5B', FY23: '$7.0B', FY24: '$12.0B' }, trend: 'up' },
    { metric: 'Diluted EPS', periodValues: { FY21: '$1.20', FY22: '$2.10', FY23: '$4.00', FY24: '$6.50' }, trend: 'up' },
  ]),
  reportSections: [],
};

/** Stable archetype (Apple-style) */
const AAPL_ANALYSIS: Omit<CompanyAnalysisResponse['analysis'], 'analysisStatus'> = {
  companySummary:
    'Apple Inc. integrates hardware, software, and services across iPhone, Mac, iPad, and Wearables, with a large installed base driving recurring services revenue.',
  investmentThesis:
    'Ecosystem depth and brand support durable margins; cash generation funds buybacks and dividends while navigating product cycles and regulation.',
  businessModelOverview:
    'Premium devices plus high-margin services (App Store, iCloud, payments) create recurring revenue layered on hardware.',
  revenueDrivers:
    'Installed base growth, upgrade cycles, and services monetization.',
  industryPositioning:
    'Scaled leader in consumer technology with integrated hardware–software control.',
  keyPositives: [
    'Deep ecosystem and switching costs.',
    'Strong cash returns to shareholders.',
    'Services mix supporting margin resilience.',
  ].join('\n'),
  keyNegatives: [
    'iPhone concentration and replacement-cycle risk.',
    'Regulatory pressure on App Store and markets.',
    'Supply chain and geopolitical exposure.',
  ].join('\n'),
  creditAndEsg:
    'Investment-grade credit; ESG emphasis on carbon neutrality across the value chain and privacy positioning.',
  kpiSnapshotCaption: KPI_CAPTION,
  kpiRows: buildKpiRows([
    { metric: 'Revenue', periodValues: { FY21: '$365B', FY22: '$394B', FY23: '$383B', FY24: '$391B' }, trend: 'neutral' },
    { metric: 'EBITDA', periodValues: { FY21: '$120B', FY22: '$130B', FY23: '$126B', FY24: '$131B' }, trend: 'neutral' },
    { metric: 'Free Cash Flow', periodValues: { FY21: '$93B', FY22: '$111B', FY23: '$100B', FY24: '$108B' }, trend: 'up' },
  ]),
  earningsRevenueSource: '',
  earningsRevenueCaption: '',
  earningsRevenueRows: buildKpiRows([
    { metric: 'Revenue', periodValues: { FY21: '$365B', FY22: '$394B', FY23: '$383B', FY24: '$391B' }, trend: 'neutral' },
    { metric: 'Net income', periodValues: { FY21: '$94B', FY22: '$99B', FY23: '$97B', FY24: '$99B' }, trend: 'neutral' },
    { metric: 'Diluted EPS', periodValues: { FY21: '$5.60', FY22: '$6.10', FY23: '$6.10', FY24: '$6.40' }, trend: 'up' },
  ]),
  reportSections: [],
};

/** Declining archetype */
const MSFT_ANALYSIS: Omit<CompanyAnalysisResponse['analysis'], 'analysisStatus'> = {
  companySummary:
    'Microsoft Corporation delivers cloud (Azure), productivity, and business applications; enterprise penetration and recurring subscriptions anchor the model.',
  investmentThesis:
    'Azure and Office 365 provide durable recurring revenue; execution on AI services and margin discipline drive the forward case.',
  businessModelOverview:
    'Subscription and consumption cloud revenue, seat-based productivity, and gaming assets.',
  revenueDrivers:
    'Azure consumption, Microsoft 365 seats, security, and Dynamics.',
  industryPositioning:
    'Top-tier enterprise cloud and productivity platform alongside hyperscale peers.',
  keyPositives: [
    'Enterprise distribution and hybrid cloud footprint.',
    'Recurring revenue mix.',
    'Balance sheet strength.',
  ].join('\n'),
  keyNegatives: [
    'Competition in cloud from AWS and Google.',
    'Capex intensity for AI infrastructure.',
    'Antitrust scrutiny.',
  ].join('\n'),
  creditAndEsg:
    'Investment-grade; carbon negative commitment and responsible AI governance.',
  kpiSnapshotCaption: KPI_CAPTION,
  kpiRows: buildKpiRows([
    { metric: 'Revenue', periodValues: { FY21: '$220B', FY22: '$205B', FY23: '$190B', FY24: '$170B' }, trend: 'down' },
    { metric: 'EBITDA', periodValues: { FY21: '$99B', FY22: '$92B', FY23: '$85B', FY24: '$76B' }, trend: 'down' },
    { metric: 'Free Cash Flow', periodValues: { FY21: '$25B', FY22: '$19B', FY23: '$14B', FY24: '$8B' }, trend: 'down' },
  ]),
  earningsRevenueSource: '',
  earningsRevenueCaption: '',
  earningsRevenueRows: buildKpiRows([
    { metric: 'Revenue', periodValues: { FY21: '$220B', FY22: '$205B', FY23: '$190B', FY24: '$170B' }, trend: 'down' },
    { metric: 'Net income', periodValues: { FY21: '$30B', FY22: '$24B', FY23: '$18B', FY24: '$10B' }, trend: 'down' },
    { metric: 'Diluted EPS', periodValues: { FY21: '$3.20', FY22: '$2.50', FY23: '$1.80', FY24: '$0.90' }, trend: 'down' },
  ]),
  reportSections: [],
};

/** Cyclical archetype */
const MU_ANALYSIS: Omit<CompanyAnalysisResponse['analysis'], 'analysisStatus'> = {
  companySummary:
    'Micron Technology, Inc. supplies DRAM and NAND memory for data centre, mobile, and automotive end markets; earnings track memory pricing and utilization cycles.',
  investmentThesis:
    'Scale in DRAM/NAND and technology transitions (e.g. HBM) support through-cycle returns; results remain sensitive to industry supply and demand balance.',
  businessModelOverview:
    'Memory manufacturing with high fixed costs; margins swing with ASPs and loadings.',
  revenueDrivers:
    'Data centre memory content, mobile demand, and automotive/industrial adoption.',
  industryPositioning:
    'One of a concentrated set of global memory producers; competes on node leadership and cost.',
  keyPositives: [
    'Structural demand for high-bandwidth memory in AI servers.',
    'Technology roadmap and manufacturing scale.',
  ].join('\n'),
  keyNegatives: [
    'Pronounced industry cyclicality.',
    'Capex intensity through downturns.',
    'Geopolitical and trade risk.',
  ].join('\n'),
  creditAndEsg:
    'Cyclical but generally investment-grade through the cycle; ESG focus on manufacturing footprint and water/energy use.',
  kpiSnapshotCaption: KPI_CAPTION,
  kpiRows: buildKpiRows([
    { metric: 'Revenue', periodValues: { FY21: '$15.0B', FY22: '$21.0B', FY23: '$16.0B', FY24: '$23.0B' }, trend: 'up' },
    { metric: 'EBITDA', periodValues: { FY21: '$5.2B', FY22: '$7.3B', FY23: '$5.6B', FY24: '$8.0B' }, trend: 'up' },
    { metric: 'Free Cash Flow', periodValues: { FY21: '$1.2B', FY22: '$3.2B', FY23: '$0.8B', FY24: '$3.6B' }, trend: 'up' },
  ]),
  earningsRevenueSource: '',
  earningsRevenueCaption: '',
  earningsRevenueRows: buildKpiRows([
    { metric: 'Revenue', periodValues: { FY21: '$15.0B', FY22: '$21.0B', FY23: '$16.0B', FY24: '$23.0B' }, trend: 'up' },
    { metric: 'Net income', periodValues: { FY21: '$1.5B', FY22: '$4.0B', FY23: '$1.2B', FY24: '$4.5B' }, trend: 'up' },
    { metric: 'Diluted EPS', periodValues: { FY21: '$1.50', FY22: '$3.80', FY23: '$1.00', FY24: '$4.20' }, trend: 'up' },
  ]),
  reportSections: [],
};

const MOCK_ANALYSIS: Record<string, Omit<CompanyAnalysisResponse['analysis'], 'analysisStatus'>> = {
  NVDA: NVDA_ANALYSIS,
  AAPL: AAPL_ANALYSIS,
  MSFT: MSFT_ANALYSIS,
  MU: MU_ANALYSIS,
};

export const DEFAULT_TICKER = 'AAPL';

export function getMockCompany(ticker: string): Company {
  const normalized = (ticker || '').trim().toUpperCase();
  return MOCK_COMPANIES[normalized] ?? MOCK_COMPANIES[DEFAULT_TICKER];
}

export function getMockAnalysis(ticker: string): CompanyAnalysisResponse['analysis'] {
  const normalized = (ticker || '').trim().toUpperCase();
  const base = MOCK_ANALYSIS[normalized] ?? MOCK_ANALYSIS[DEFAULT_TICKER];
  return { ...base, analysisStatus: 'idle' as const };
}

export function getMockCompanyAnalysis(ticker: string): CompanyAnalysisResponse {
  const company = getMockCompany(ticker);
  const analysis = getMockAnalysis(ticker);
  return { company, analysis };
}

export const MOCK_TICKERS = Object.keys(MOCK_COMPANIES) as string[];
