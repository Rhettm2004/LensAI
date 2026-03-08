import React, { useMemo, useState } from 'react';

type ScreenId = 'select-company' | 'choose-analyst' | 'workspace' | 'report';

type Company = {
  name: string;
  ticker: string;
  exchange: string;
  marketCap: string;
  sector: string;
  industry: string;
};

const SAMPLE_COMPANIES: Record<string, Company> = {
  AAPL: {
    name: 'Apple Inc.',
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    marketCap: '$2.72T',
    sector: 'Technology',
    industry: 'Consumer Electronics',
  },
  MU: {
    name: 'Micron Technology, Inc.',
    ticker: 'MU',
    exchange: 'NASDAQ',
    marketCap: '$126B',
    sector: 'Technology',
    industry: 'Semiconductors',
  },
};

const DEFAULT_COMPANY: Company = SAMPLE_COMPANIES.MU;

type KpiRow = {
  label: string;
  fy21: string;
  fy22: string;
  fy23: string;
  fy24: string;
};

const SAMPLE_KPIS: KpiRow[] = [
  { label: 'Revenue', fy21: '$120m', fy22: '$145m', fy23: '$171m', fy24: '$210m' },
  { label: 'EBITDA', fy21: '$18m', fy22: '$23m', fy23: '$30m', fy24: '$42m' },
  { label: 'Free Cash Flow', fy21: '$12m', fy22: '$15m', fy23: '$21m', fy24: '$29m' },
];

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenId>('select-company');
  const [tickerInput, setTickerInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [analysisTriggered, setAnalysisTriggered] = useState(false);

  const effectiveCompany = selectedCompany ?? (() => {
    const normalized = (tickerInput || '').trim().toUpperCase();
    return normalized ? (SAMPLE_COMPANIES[normalized] ?? DEFAULT_COMPANY) : DEFAULT_COMPANY;
  })();

  const handleCompanyCardClick = () => {
    setSelectedCompany(effectiveCompany);
    setScreen('choose-analyst');
  };

  const handleRunAnalysis = () => {
    setAnalysisTriggered(true);
    setScreen('workspace');
  };

  const handleGoToReport = () => {
    setScreen('report');
  };

  const handleReset = () => {
    setScreen('select-company');
    setSelectedCompany(null);
    setAnalysisTriggered(false);
  };

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div className="app-logo">
            <div className="app-logo-mark">L</div>
            <div className="app-logo-text">
              <span className="app-logo-title">LensAI</span>
              <span className="app-logo-subtitle">AI-Driven Market Analysis</span>
            </div>
          </div>
          <div className="app-pill">V0 · Concept Prototype</div>
        </header>

        <main className="app-main-card">
          {screen === 'select-company' && (
            <SelectCompanyScreen
              tickerInput={tickerInput}
              onTickerChange={setTickerInput}
              company={effectiveCompany}
              onCompanyClick={handleCompanyCardClick}
            />
          )}
          {screen === 'choose-analyst' && (
            <ChooseAnalystScreen
              company={effectiveCompany}
              onRunAnalysis={handleRunAnalysis}
              onBack={handleReset}
            />
          )}
          {screen === 'workspace' && (
            <WorkspaceScreen
              company={effectiveCompany}
              kpis={SAMPLE_KPIS}
              onGoToReport={handleGoToReport}
            />
          )}
          {screen === 'report' && (
            <ReportScreen
              company={effectiveCompany}
              kpis={SAMPLE_KPIS}
              onBackToWorkspace={() => setScreen('workspace')}
              onRestart={handleReset}
            />
          )}
        </main>

        <footer className="app-footer">
          <span>
            <strong>LensAI V0</strong> · AI analyst workflow prototype
          </span>
          <span>Scope: company selection · analyst selection · widgets · overview report</span>
        </footer>
      </div>
    </div>
  );
};

type SelectCompanyProps = {
  tickerInput: string;
  onTickerChange: (value: string) => void;
  company: Company;
  onCompanyClick: () => void;
};

const SelectCompanyScreen: React.FC<SelectCompanyProps> = ({
  tickerInput,
  onTickerChange,
  company,
  onCompanyClick,
}) => {
  return (
    <div className="screen-centered">
      <div className="app-section-header">
        <div className="app-section-eyebrow">Screen 1 · Company Selection</div>
        <div className="app-section-title">Select Company</div>
        <div className="app-section-subtitle">
          Enter a ticker to preview a company card. V0 uses curated placeholder data.
        </div>
      </div>

      <input
        className="input-underline"
        placeholder="Enter ticker (e.g. AAPL, MU)"
        value={tickerInput}
        maxLength={8}
        onChange={(e) => onTickerChange(e.target.value)}
      />

      {!!tickerInput.trim() && (
        <button type="button" className="company-card" onClick={onCompanyClick}>
          <div className="company-logo">{company.ticker?.[0] ?? '?'}</div>
          <div className="company-main">
            <div className="company-name">{company.name}</div>
            <div className="company-ticker">{company.ticker}</div>
            <div className="company-meta">
              {company.exchange} · {company.marketCap} · {company.sector} · {company.industry}
            </div>
          </div>
          <div className="pill-tag">Continue</div>
        </button>
      )}
    </div>
  );
};

type ChooseAnalystProps = {
  company: Company;
  onRunAnalysis: () => void;
  onBack: () => void;
};

const ChooseAnalystScreen: React.FC<ChooseAnalystProps> = ({
  company,
  onRunAnalysis,
  onBack,
}) => {
  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Screen 2 · Analysis Setup</div>
        <div className="app-section-title">Choose Analysis Setup</div>
        <div className="app-section-subtitle">
          Select an AI analyst to run structured research on{' '}
          <strong>{company.name}</strong>.
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: '#a3a7c2' }}>
        Company: <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} ·{' '}
        {company.marketCap}
      </div>

      <div className="screen-grid">
        <div className="analyst-card">
          <div className="analyst-title-row">
            <div className="analyst-title">Fundamental Analyst (Active)</div>
            <span className="analyst-chip">V0 Analyst</span>
          </div>
          <div className="analyst-desc">
            Performs structured fundamental analysis focused on business model, performance trends,
            and investment-relevant KPIs.
          </div>
          <div className="analyst-list">
            <div>Scope includes:</div>
            <ul>
              <li>Business model analysis</li>
              <li>Financial performance</li>
              <li>KPI trend reconstruction</li>
              <li>Investment-relevant metrics</li>
            </ul>
          </div>
          <div className="analyst-list" style={{ marginTop: 8 }}>
            <div>Outputs:</div>
            <ul>
              <li>Product Report</li>
              <li>KPI Table</li>
            </ul>
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" className="button-secondary" onClick={onBack}>
              Change company
            </button>
            <button type="button" className="button-primary" onClick={onRunAnalysis}>
              Run analysis
            </button>
          </div>
        </div>

        <div className="analyst-card analyst-card-muted">
          <div className="analyst-title-row">
            <div className="analyst-title">Additional Analysts (Coming Soon)</div>
          </div>
          <div className="analyst-desc">
            Future LensAI versions will introduce specialised analyst perspectives that can be
            composed into multi-lens research workflows.
          </div>
          <div className="analyst-list">
            <div>Examples:</div>
            <ul>
              <li>Valuation Analyst</li>
              <li>Industry Analyst</li>
              <li>Risk Analyst</li>
              <li>News Impact Analyst</li>
            </ul>
          </div>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button type="button" className="button-secondary button-disabled" disabled>
              Coming soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type WorkspaceProps = {
  company: Company;
  kpis: KpiRow[];
  onGoToReport: () => void;
};

const WorkspaceScreen: React.FC<WorkspaceProps> = ({ company, kpis, onGoToReport }) => {
  const [reportLoaded, setReportLoaded] = useState(false);
  const [kpiLoaded, setKpiLoaded] = useState(false);

  React.useEffect(() => {
    const reportTimer = setTimeout(() => setReportLoaded(true), 1100);
    const kpiTimer = setTimeout(() => setKpiLoaded(true), 1700);
    return () => {
      clearTimeout(reportTimer);
      clearTimeout(kpiTimer);
    };
  }, []);

  const completedCount = Number(reportLoaded) + Number(kpiLoaded);

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Screen 3 · Workspace</div>
        <div className="app-section-title">Processed Outputs</div>
        <div className="app-section-subtitle">
          Structured AI outputs for the selected company, presented as modular widgets.
        </div>
      </div>

      <div className="workspace-header">
        <div className="workspace-company">
          <strong>
            {company.name} — {company.exchange} — {company.marketCap} Market Cap
          </strong>
          <div className="workspace-meta">
            Ticker {company.ticker} · Sector {company.sector} · {company.industry}
          </div>
        </div>
        <div className="workspace-analyst">
          Analysis by <strong>Fundamental Analyst AI</strong>
        </div>
      </div>

      <div className="workspace-layout">
        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-title">Product Report</div>
              <div className="widget-subtitle">
                Concise business model and positioning overview.
              </div>
            </div>
            <span className="widget-pill">Narrative Analysis</span>
          </div>
          <div className="widget-body">
            {!reportLoaded ? (
              <WidgetLoading label="Reconstructing business model and narrative..." />
            ) : (
              <ProductReportBody company={company} />
            )}
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-title">KPI Table</div>
              <div className="widget-subtitle">
                Reconstructed performance trends across key financial metrics.
              </div>
            </div>
            <span className="widget-pill">KPI Trends</span>
          </div>
          <div className="widget-body">
            {!kpiLoaded ? (
              <WidgetLoading label="Aligning financial series and KPI trends..." />
            ) : (
              <KpiTable rows={kpis} />
            )}
          </div>
        </div>
      </div>

      <div className="progress-indicator">
        <span>
          {completedCount} of 2 widgets complete ·{' '}
          {completedCount < 2 ? 'Running structured analysis…' : 'Analysis complete'}
        </span>
        <div className="progress-bar-outer">
          <div
            className="progress-bar-inner"
            style={{ width: `${(completedCount / 2) * 100}%` }}
          />
        </div>
        <button
          type="button"
          className={`button-secondary ${completedCount < 2 ? 'button-disabled' : ''}`}
          disabled={completedCount < 2}
          onClick={onGoToReport}
        >
          Generate overview report
        </button>
      </div>
    </div>
  );
};

type WidgetLoadingProps = {
  label: string;
};

const WidgetLoading: React.FC<WidgetLoadingProps> = ({ label }) => {
  return (
    <div className="widget-loading">
      <div className="spinner-dot-row">
        <span className="spinner-dot" />
        <span className="spinner-dot" />
        <span className="spinner-dot" />
      </div>
      <div style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#7075a0' }}>Processing…</div>
    </div>
  );
};

type KpiTableProps = {
  rows: KpiRow[];
};

const KpiTable: React.FC<KpiTableProps> = ({ rows }) => {
  return (
    <table className="kpi-table">
      <thead>
        <tr>
          <th>KPI</th>
          <th>FY21</th>
          <th>FY22</th>
          <th>FY23</th>
          <th>FY24</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>{row.fy21}</td>
            <td>{row.fy22}</td>
            <td>{row.fy23}</td>
            <td>{row.fy24}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

type ReportProps = {
  company: Company;
  kpis: KpiRow[];
  onBackToWorkspace: () => void;
  onRestart: () => void;
};

const ReportScreen: React.FC<ReportProps> = ({
  company,
  kpis,
  onBackToWorkspace,
  onRestart,
}) => {
  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Screen 4 · Evaluation & Reporting</div>
        <div className="app-section-title">Evaluation &amp; Reporting Engine</div>
        <div className="app-section-subtitle">
          Overview report generated from the structured outputs produced by the Fundamental Analyst
          AI.
        </div>
      </div>

      <div
        style={{
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 13 }}>
          <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} ·{' '}
          {company.marketCap}
        </div>
        <div className="tabs">
          <button type="button" className="tab-pill tab-pill-active">
            Overview Report
          </button>
          <button type="button" className="tab-pill tab-pill-muted" disabled>
            Valuation Analysis
          </button>
          <button type="button" className="tab-pill tab-pill-muted" disabled>
            Industry Comparison
          </button>
          <button type="button" className="tab-pill tab-pill-muted" disabled>
            News Impact
          </button>
        </div>
      </div>

      <div className="report-layout">
        <div>
          <div className="report-section">
            <div className="report-section-title">Company Summary</div>
            <div className="report-body">
              {company.name} is a leading {company.industry.toLowerCase()} company within the{' '}
              {company.sector.toLowerCase()} sector, listed on the {company.exchange}. The business
              generates revenue primarily through a scaled, globally distributed franchise with a
              mix of hardware, software, and services exposure depending on the underlying business
              model. LensAI&apos;s V0 analysis focuses on reconstructing a simplified but coherent
              view of the company&apos;s economic engine and market positioning.
            </div>
          </div>

          <div className="report-section" style={{ marginTop: 10 }}>
            <div className="report-section-title">Investment Thesis</div>
            <div className="report-body">
              The core investment case for {company.name} is anchored in durable competitive
              advantages, a resilient balance sheet, and an ability to compound free cash flow over
              time. Near-term earnings may remain sensitive to macro conditions and industry
              cyclicality, but the company&apos;s strategic position, scale, and product depth
              provide a platform for continued value creation. We see the risk / reward profile as
              balanced around execution on product roadmap, capital allocation discipline, and
              maintaining pricing power in key segments.
            </div>
          </div>

          <div className="report-section" style={{ marginTop: 10 }}>
            <div className="report-section-title">Key Positives</div>
            <div className="report-body">
              <ul className="bullet-list">
                <li>Scaled, globally recognised franchise in a structurally attractive market.</li>
                <li>Strong historical revenue and EBITDA trajectory with improving cash generation.</li>
                <li>Robust balance sheet flexibility to fund R&amp;D, capex, and shareholder returns.</li>
                <li>Differentiated technology stack and product ecosystem supporting switching costs.</li>
              </ul>
            </div>
          </div>

          <div className="report-section" style={{ marginTop: 10 }}>
            <div className="report-section-title">Key Negatives</div>
            <div className="report-body">
              <ul className="bullet-list">
                <li>Exposure to macro and industry cycles can drive earnings volatility.</li>
                <li>Competitive intensity from peers and new entrants in core profit pools.</li>
                <li>Ongoing capex and R&amp;D requirements to sustain technology leadership.</li>
                <li>Regulatory, geopolitical, and supply chain risks across key regions.</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div className="report-section">
            <div className="report-section-title">Financials (KPI Snapshot)</div>
            <div className="report-body">
              The table below summarises simplified historical KPIs reconstructed for illustration.
              Values are placeholders designed to demonstrate LensAI&apos;s structured output
              format rather than formal financial guidance.
            </div>
            <div style={{ marginTop: 8 }}>
              <KpiTable rows={kpis} />
            </div>
          </div>

          <div className="report-section" style={{ marginTop: 10 }}>
            <div className="report-section-title">Credit &amp; ESG</div>
            <div className="report-body">
              Credit quality is assumed to be investment grade, underpinned by scale, cash flow
              visibility, and access to diversified funding markets. From an ESG perspective, the
              company&apos;s profile reflects both the opportunities and responsibilities associated
              with operating a large, global technology platform, including data privacy, workforce
              practices, and environmental footprint across the supply chain.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <button type="button" className="button-ghost" onClick={onRestart}>
          Start new analysis
        </button>
        <button type="button" className="button-secondary" onClick={onBackToWorkspace}>
          Back to workspace
        </button>
      </div>
    </div>
  );
};

type ProductReportBodyProps = {
  company: Company;
};

const ProductReportBody: React.FC<ProductReportBodyProps> = ({ company }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 13, color: '#f5f6fa' }}>
        <strong>Business model overview</strong>
      </div>
      <div style={{ fontSize: 13 }}>
        {company.name} operates a diversified business model anchored in high-value technology
        products and services. Revenue is driven by a mix of core platform offerings, adjacent
        product lines, and recurring software and services, with a focus on scaling unit
        economics rather than purely maximising volume.
      </div>
      <div style={{ fontSize: 13, marginTop: 4 }}>
        <strong>Revenue drivers</strong>
      </div>
      <div style={{ fontSize: 13 }}>
        Key revenue drivers include installed base growth, product refresh cycles, and
        monetisation of value-added services layered on top of core hardware and infrastructure.
        Over time, mix is expected to tilt toward higher-margin, recurring streams as the
        franchise matures.
      </div>
      <div style={{ fontSize: 13, marginTop: 4 }}>
        <strong>Industry positioning</strong>
      </div>
      <div style={{ fontSize: 13 }}>
        Within the broader {company.sector.toLowerCase()} landscape, {company.name} is positioned
        as a scaled leader with meaningful share in its target categories. Competitive advantages
        are driven by ecosystem depth, technology capabilities, and the ability to invest through
        cycles, supporting a defensible long-term return profile.
      </div>
    </div>
  );
};

