import React, { useCallback, useReducer } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScreenId =
  | 'select-company'
  | 'choose-analyst'
  | 'workspace'
  | 'reporting-engine'
  | 'report-viewer';

export type Company = {
  name: string;
  ticker: string;
  exchange: string;
  marketCap: string;
  sector: string;
  industry: string;
};

export type AnalystId = 'fundamental';

export type AnalysisStatus = 'idle' | 'running' | 'complete';

export type ReportTypeId = 'overview' | 'valuation' | 'industry' | 'news';

export type GeneratedReports = {
  overview: boolean;
  valuation: boolean;
  industry: boolean;
  news: boolean;
};

export type ReportingEngineState = 'engine' | 'generating';

export type AppState = {
  screen: ScreenId;
  maxStepReached: number;
  tickerInput: string;
  selectedCompany: Company | null;
  selectedAnalystId: AnalystId | null;
  analysisStatus: AnalysisStatus;
  widgetProductReportReady: boolean;
  widgetKpiTableReady: boolean;
  generatedReports: GeneratedReports;
  reportingEngineState: ReportingEngineState;
  activeReportType: ReportTypeId | null;
};

// ---------------------------------------------------------------------------
// Screen order (for back navigation)
// ---------------------------------------------------------------------------

const SCREEN_ORDER: ScreenId[] = [
  'select-company',
  'choose-analyst',
  'workspace',
  'reporting-engine',
  'report-viewer',
];

const WORKFLOW_STEPS: { id: ScreenId; label: string }[] = [
  { id: 'select-company', label: 'Company Selection' },
  { id: 'choose-analyst', label: 'Analysis Setup' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'reporting-engine', label: 'Reporting Engine' },
  { id: 'report-viewer', label: 'Report Viewer' },
];

const INITIAL_GENERATED_REPORTS: GeneratedReports = {
  overview: false,
  valuation: false,
  industry: false,
  news: false,
};

function hasAnyReportGenerated(g: GeneratedReports): boolean {
  return g.overview || g.valuation || g.industry || g.news;
}

function getPreviousScreen(screen: ScreenId): ScreenId | null {
  const i = SCREEN_ORDER.indexOf(screen);
  return i <= 0 ? null : SCREEN_ORDER[i - 1];
}

function getCurrentStepIndex(screen: ScreenId): number {
  return SCREEN_ORDER.indexOf(screen);
}

// ---------------------------------------------------------------------------
// Reducer actions
// ---------------------------------------------------------------------------

type AppAction =
  | { type: 'GO_TO_SCREEN'; payload: ScreenId }
  | { type: 'GO_BACK' }
  | { type: 'SET_TICKER_INPUT'; payload: string }
  | { type: 'SELECT_COMPANY'; payload: Company }
  | { type: 'SELECT_ANALYST'; payload: AnalystId }
  | { type: 'RUN_ANALYSIS' }
  | { type: 'SET_WIDGET_PRODUCT_REPORT_READY' }
  | { type: 'SET_WIDGET_KPI_TABLE_READY' }
  | { type: 'RESET_FLOW' }
  | { type: 'CHANGE_COMPANY' }
  | { type: 'CHANGE_ANALYST' }
  | { type: 'START_GENERATE_REPORT'; payload: ReportTypeId }
  | { type: 'COMPLETE_GENERATE_REPORT'; payload: ReportTypeId }
  | { type: 'OPEN_REPORT_VIEWER'; payload: ReportTypeId }
  | { type: 'BACK_TO_REPORTING_ENGINE' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'GO_TO_SCREEN': {
      const newIndex = SCREEN_ORDER.indexOf(action.payload);
      const nextMax = Math.max(state.maxStepReached, newIndex);
      return { ...state, screen: action.payload, maxStepReached: nextMax };
    }

    case 'GO_BACK': {
      const prev = getPreviousScreen(state.screen);
      return prev ? { ...state, screen: prev } : state;
    }

    case 'SET_TICKER_INPUT':
      return { ...state, tickerInput: action.payload };

    case 'SELECT_COMPANY':
      return {
        ...state,
        selectedCompany: action.payload,
        tickerInput: action.payload.ticker,
        screen: 'choose-analyst',
        maxStepReached: Math.max(state.maxStepReached, 1),
      };

    case 'SELECT_ANALYST':
      return { ...state, selectedAnalystId: action.payload };

    case 'RUN_ANALYSIS':
      return {
        ...state,
        screen: 'workspace',
        maxStepReached: Math.max(state.maxStepReached, 2),
        analysisStatus: 'running',
        widgetProductReportReady: false,
        widgetKpiTableReady: false,
        generatedReports: INITIAL_GENERATED_REPORTS,
        reportingEngineState: 'engine',
        activeReportType: null,
      };

    case 'SET_WIDGET_PRODUCT_REPORT_READY':
      return { ...state, widgetProductReportReady: true };

    case 'SET_WIDGET_KPI_TABLE_READY': {
      const next = {
        ...state,
        widgetKpiTableReady: true,
      };
      const bothReady = next.widgetProductReportReady && next.widgetKpiTableReady;
      return bothReady ? { ...next, analysisStatus: 'complete' } : next;
    }

    case 'RESET_FLOW':
      return getInitialAppState();

    case 'CHANGE_COMPANY':
      return {
        ...getInitialAppState(),
        screen: 'select-company',
      };

    case 'CHANGE_ANALYST':
      return {
        ...state,
        screen: 'choose-analyst',
        analysisStatus: 'idle',
        widgetProductReportReady: false,
        widgetKpiTableReady: false,
        generatedReports: INITIAL_GENERATED_REPORTS,
        reportingEngineState: 'engine',
        activeReportType: null,
      };

    case 'START_GENERATE_REPORT':
      return { ...state, reportingEngineState: 'generating' };

    case 'COMPLETE_GENERATE_REPORT': {
      const next = { ...state, reportingEngineState: 'engine' as const };
      if (action.payload === 'overview') next.generatedReports = { ...state.generatedReports, overview: true };
      if (action.payload === 'valuation') next.generatedReports = { ...state.generatedReports, valuation: true };
      if (action.payload === 'industry') next.generatedReports = { ...state.generatedReports, industry: true };
      if (action.payload === 'news') next.generatedReports = { ...state.generatedReports, news: true };
      return next;
    }

    case 'OPEN_REPORT_VIEWER':
      return {
        ...state,
        screen: 'report-viewer',
        activeReportType: action.payload,
        maxStepReached: Math.max(state.maxStepReached, 4),
      };

    case 'BACK_TO_REPORTING_ENGINE':
      return { ...state, screen: 'reporting-engine', activeReportType: null };

    default:
      return state;
  }
}

function getInitialAppState(): AppState {
  return {
    screen: 'select-company',
    maxStepReached: 0,
    tickerInput: '',
    selectedCompany: null,
    selectedAnalystId: null,
    analysisStatus: 'idle',
    widgetProductReportReady: false,
    widgetKpiTableReady: false,
    generatedReports: INITIAL_GENERATED_REPORTS,
    reportingEngineState: 'engine',
    activeReportType: null,
  };
}

// ---------------------------------------------------------------------------
// Data (placeholder)
// ---------------------------------------------------------------------------

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

function getCompanyFromTicker(ticker: string): Company {
  const normalized = (ticker || '').trim().toUpperCase();
  return normalized ? (SAMPLE_COMPANIES[normalized] ?? DEFAULT_COMPANY) : DEFAULT_COMPANY;
}

// ---------------------------------------------------------------------------
// Workflow Stepper
// ---------------------------------------------------------------------------

type WorkflowStepperProps = {
  currentScreen: ScreenId;
  maxStepReached: number;
  hasAnyReportGenerated: boolean;
  onStepClick: (screen: ScreenId) => void;
};

const REPORT_VIEWER_STEP_INDEX = 4;

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentScreen,
  maxStepReached,
  hasAnyReportGenerated,
  onStepClick,
}) => {
  const currentIndex = getCurrentStepIndex(currentScreen);

  return (
    <nav className="workflow-stepper" aria-label="Analysis workflow">
      {WORKFLOW_STEPS.map((step, index) => {
        const isCurrent = step.id === currentScreen;
        const isCompleted = index < currentIndex;
        const stepUnlockedByProgress = index <= maxStepReached;
        const step5RequiresReport = index === REPORT_VIEWER_STEP_INDEX ? hasAnyReportGenerated : true;
        const isClickable = stepUnlockedByProgress && step5RequiresReport;
        const isUnlockedFuture = index > currentIndex && isClickable;
        const isLocked = !isClickable;

        const stepClass = [
          'workflow-stepper-step',
          isCurrent && 'current',
          isCompleted && 'completed',
          isUnlockedFuture && 'unlocked-future',
          isLocked && 'locked',
          isClickable && 'clickable',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={step.id} className={stepClass}>
            <button
              type="button"
              className="workflow-step-trigger"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`${step.label}${isCurrent ? ' (current)' : isCompleted ? ' (completed)' : isUnlockedFuture ? ' (go to step)' : ''}`}
            >
              <span className="workflow-step-circle">
                <span className="workflow-step-number">{index + 1}</span>
                <span className="workflow-step-check" aria-hidden>✓</span>
              </span>
              <span className="workflow-step-label">{step.label}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialAppState);

  const goToScreen = useCallback((screen: ScreenId) => dispatch({ type: 'GO_TO_SCREEN', payload: screen }), []);
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const resetFlow = useCallback(() => dispatch({ type: 'RESET_FLOW' }), []);
  const changeCompany = useCallback(() => dispatch({ type: 'CHANGE_COMPANY' }), []);
  const changeAnalyst = useCallback(() => dispatch({ type: 'CHANGE_ANALYST' }), []);

  const setTickerInput = useCallback((value: string) => dispatch({ type: 'SET_TICKER_INPUT', payload: value }), []);
  const selectCompany = useCallback((company: Company) => dispatch({ type: 'SELECT_COMPANY', payload: company }), []);
  const runAnalysis = useCallback(() => dispatch({ type: 'RUN_ANALYSIS' }), []);
  const setWidgetProductReportReady = useCallback(() => dispatch({ type: 'SET_WIDGET_PRODUCT_REPORT_READY' }), []);
  const setWidgetKpiTableReady = useCallback(() => dispatch({ type: 'SET_WIDGET_KPI_TABLE_READY' }), []);
  const startGenerateReport = useCallback((reportType: ReportTypeId) => dispatch({ type: 'START_GENERATE_REPORT', payload: reportType }), []);
  const completeGenerateReport = useCallback((reportType: ReportTypeId) => dispatch({ type: 'COMPLETE_GENERATE_REPORT', payload: reportType }), []);
  const openReportViewer = useCallback((reportType: ReportTypeId) => dispatch({ type: 'OPEN_REPORT_VIEWER', payload: reportType }), []);
  const backToReportingEngine = useCallback(() => dispatch({ type: 'BACK_TO_REPORTING_ENGINE' }), []);

  const effectiveCompany = state.selectedCompany ?? getCompanyFromTicker(state.tickerInput);
  const canGoBack = getPreviousScreen(state.screen) !== null;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {canGoBack && (
              <button type="button" className="button-ghost" onClick={goBack}>
                Back
              </button>
            )}
            <button type="button" className="button-ghost" onClick={resetFlow}>
              Start new analysis
            </button>
            <div className="app-pill">V0 · Concept Prototype</div>
          </div>
        </header>

        <main className="app-main-card">
          <WorkflowStepper
            currentScreen={state.screen}
            maxStepReached={state.maxStepReached}
            hasAnyReportGenerated={hasAnyReportGenerated(state.generatedReports)}
            onStepClick={goToScreen}
          />
          {state.screen === 'select-company' && (
            <SelectCompanyScreen
              tickerInput={state.tickerInput}
              onTickerChange={setTickerInput}
              company={effectiveCompany}
              onCompanySelect={selectCompany}
            />
          )}
          {state.screen === 'choose-analyst' && (
            <ChooseAnalystScreen
              company={effectiveCompany}
              onRunAnalysis={runAnalysis}
              onChangeCompany={changeCompany}
            />
          )}
          {state.screen === 'workspace' && (
            <WorkspaceScreen
              company={effectiveCompany}
              kpis={SAMPLE_KPIS}
              analysisStatus={state.analysisStatus}
              widgetProductReportReady={state.widgetProductReportReady}
              widgetKpiTableReady={state.widgetKpiTableReady}
              onWidgetProductReportReady={setWidgetProductReportReady}
              onWidgetKpiTableReady={setWidgetKpiTableReady}
              onOpenReportingEngine={() => goToScreen('reporting-engine')}
              onChangeAnalyst={changeAnalyst}
              onBack={goBack}
            />
          )}
          {state.screen === 'reporting-engine' && (
            <ReportingEngineScreen
              company={effectiveCompany}
              generatedReports={state.generatedReports}
              reportingEngineState={state.reportingEngineState}
              onStartGenerateReport={startGenerateReport}
              onCompleteGenerateReport={completeGenerateReport}
              onOpenReportViewer={openReportViewer}
              onBackToWorkspace={() => goToScreen('workspace')}
              onRestart={resetFlow}
              onChangeAnalyst={changeAnalyst}
            />
          )}
          {state.screen === 'report-viewer' && (
            <ReportViewerScreen
              company={effectiveCompany}
              kpis={SAMPLE_KPIS}
              activeReportType={state.activeReportType}
              onBackToReportingEngine={backToReportingEngine}
              onBackToWorkspace={() => goToScreen('workspace')}
              onRestart={resetFlow}
              onChangeAnalyst={changeAnalyst}
            />
          )}
        </main>

        <footer className="app-footer">
          <span>
            <strong>LensAI V0</strong> · AI analyst workflow prototype
          </span>
        </footer>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Screen 1 — Select Company
// ---------------------------------------------------------------------------

type SelectCompanyProps = {
  tickerInput: string;
  onTickerChange: (value: string) => void;
  company: Company;
  onCompanySelect: (company: Company) => void;
};

const SelectCompanyScreen: React.FC<SelectCompanyProps> = ({
  tickerInput,
  onTickerChange,
  company,
  onCompanySelect,
}) => {
  const handleCardClick = () => onCompanySelect(company);

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
        <button type="button" className="company-card" onClick={handleCardClick}>
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

// ---------------------------------------------------------------------------
// Screen 2 — Choose AI Analyst
// ---------------------------------------------------------------------------

type ChooseAnalystProps = {
  company: Company;
  onRunAnalysis: () => void;
  onChangeCompany: () => void;
};

const ChooseAnalystScreen: React.FC<ChooseAnalystProps> = ({
  company,
  onRunAnalysis,
  onChangeCompany,
}) => {
  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Screen 2 · Analysis Setup</div>
        <div className="app-section-title">Choose Analysis Setup</div>
        <div className="app-section-subtitle">
          Select an AI analyst to run structured research on <strong>{company.name}</strong>.
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
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="button-secondary" onClick={onChangeCompany}>
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

// ---------------------------------------------------------------------------
// Screen 3 — Processed Outputs (Workspace)
// ---------------------------------------------------------------------------

type WorkspaceProps = {
  company: Company;
  kpis: KpiRow[];
  analysisStatus: AnalysisStatus;
  widgetProductReportReady: boolean;
  widgetKpiTableReady: boolean;
  onWidgetProductReportReady: () => void;
  onWidgetKpiTableReady: () => void;
  onOpenReportingEngine: () => void;
  onChangeAnalyst: () => void;
  onBack: () => void;
};

const WorkspaceScreen: React.FC<WorkspaceProps> = ({
  company,
  kpis,
  analysisStatus,
  widgetProductReportReady,
  widgetKpiTableReady,
  onWidgetProductReportReady,
  onWidgetKpiTableReady,
  onOpenReportingEngine,
  onChangeAnalyst,
  onBack,
}) => {
  React.useEffect(() => {
    if (analysisStatus !== 'running') return;
    const t1 = setTimeout(onWidgetProductReportReady, 1100);
    const t2 = setTimeout(onWidgetKpiTableReady, 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [analysisStatus, onWidgetProductReportReady, onWidgetKpiTableReady]);

  const completedCount = Number(widgetProductReportReady) + Number(widgetKpiTableReady);
  const allComplete = analysisStatus === 'complete';

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

      <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="button-secondary" onClick={onBack}>
          Back to setup
        </button>
        <button type="button" className="button-ghost" onClick={onChangeAnalyst}>
          Change analyst
        </button>
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
            {!widgetProductReportReady ? (
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
            {!widgetKpiTableReady ? (
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
          {!allComplete ? 'Running structured analysis…' : 'Analysis complete'}
        </span>
        <div className="progress-bar-outer">
          <div
            className="progress-bar-inner"
            style={{ width: `${(completedCount / 2) * 100}%` }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
            Use the completed analysis to generate structured report outputs in the next step.
          </p>
          <button
            type="button"
            className={`button-primary ${!allComplete ? 'button-disabled' : ''}`}
            disabled={!allComplete}
            onClick={onOpenReportingEngine}
          >
            Open Reporting Engine
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Screen 4 — Reporting Engine
// ---------------------------------------------------------------------------

type ReportingEngineScreenProps = {
  company: Company;
  generatedReports: GeneratedReports;
  reportingEngineState: ReportingEngineState;
  onStartGenerateReport: (reportType: ReportTypeId) => void;
  onCompleteGenerateReport: (reportType: ReportTypeId) => void;
  onOpenReportViewer: (reportType: ReportTypeId) => void;
  onBackToWorkspace: () => void;
  onRestart: () => void;
  onChangeAnalyst: () => void;
};

const ReportingEngineScreen: React.FC<ReportingEngineScreenProps> = ({
  company,
  generatedReports,
  reportingEngineState,
  onStartGenerateReport,
  onCompleteGenerateReport,
  onOpenReportViewer,
  onBackToWorkspace,
  onRestart,
  onChangeAnalyst,
}) => {
  React.useEffect(() => {
    if (reportingEngineState !== 'generating') return;
    const t = setTimeout(() => onCompleteGenerateReport('overview'), 1400);
    return () => clearTimeout(t);
  }, [reportingEngineState, onCompleteGenerateReport]);

  const handleOverviewAction = () => {
    if (generatedReports.overview) {
      onOpenReportViewer('overview');
    } else {
      onStartGenerateReport('overview');
    }
  };

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 4 · Reporting Engine</div>
        <div className="app-section-title">Evaluation &amp; Reporting Engine</div>
        <div className="app-section-subtitle">
          {reportingEngineState === 'engine'
            ? 'Generate report outputs from your completed analysis. Choose a report type below and click Generate or View.'
            : 'Generating your report from the structured analysis outputs…'}
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: '#a3a7c2' }}>
        <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
      </div>

      {reportingEngineState === 'engine' && (
        <div className="screen-grid" style={{ marginBottom: 20 }}>
          <div className="analyst-card">
            <div className="analyst-title-row">
              <div className="analyst-title">Overview Report</div>
              <span className="analyst-chip">V0 Active</span>
            </div>
            <div className="analyst-desc">
              Professional initiation report with company summary, investment thesis, financials, key
              positives/negatives, and credit/ESG notes.
            </div>
            <div style={{ marginTop: 12 }}>
              {generatedReports.overview ? (
                <button type="button" className="button-primary" onClick={() => onOpenReportViewer('overview')}>
                  View
                </button>
              ) : (
                <button type="button" className="button-primary" onClick={handleOverviewAction}>
                  Generate
                </button>
              )}
            </div>
          </div>
          <div className="analyst-card analyst-card-muted">
            <div className="analyst-title-row">
              <div className="analyst-title">Valuation Analysis</div>
            </div>
            <div className="analyst-desc">
              DCF, comparable multiples, and sum-of-the-parts analysis.
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button type="button" className="button-secondary button-disabled" disabled>
                Coming soon
              </button>
            </div>
          </div>
          <div className="analyst-card analyst-card-muted">
            <div className="analyst-title-row">
              <div className="analyst-title">Industry Comparison</div>
            </div>
            <div className="analyst-desc">
              Peer comparison and relative positioning within the sector.
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button type="button" className="button-secondary button-disabled" disabled>
                Coming soon
              </button>
            </div>
          </div>
          <div className="analyst-card analyst-card-muted">
            <div className="analyst-title-row">
              <div className="analyst-title">News Impact</div>
            </div>
            <div className="analyst-desc">
              Recent news and events affecting the investment case.
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button type="button" className="button-secondary button-disabled" disabled>
                Coming soon
              </button>
            </div>
          </div>
        </div>
      )}

      {reportingEngineState === 'generating' && (
        <div className="report-generating-state">
          <div className="widget-loading" style={{ minHeight: 200 }}>
            <div className="spinner-dot-row">
              <span className="spinner-dot" />
              <span className="spinner-dot" />
              <span className="spinner-dot" />
            </div>
            <div style={{ fontSize: 13 }}>Compiling overview report from workspace outputs…</div>
            <div style={{ fontSize: 11, color: '#7075a0' }}>Processing…</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="button-ghost" onClick={onRestart}>
            Start new analysis
          </button>
          <button type="button" className="button-ghost" onClick={onChangeAnalyst}>
            Change analyst
          </button>
        </div>
        <button type="button" className="button-secondary" onClick={onBackToWorkspace}>
          Back to workspace
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Screen 5 — Report Viewer
// ---------------------------------------------------------------------------

type ReportViewerScreenProps = {
  company: Company;
  kpis: KpiRow[];
  activeReportType: ReportTypeId | null;
  onBackToReportingEngine: () => void;
  onBackToWorkspace: () => void;
  onRestart: () => void;
  onChangeAnalyst: () => void;
};

const ReportViewerScreen: React.FC<ReportViewerScreenProps> = ({
  company,
  kpis,
  activeReportType,
  onBackToReportingEngine,
  onBackToWorkspace,
  onRestart,
  onChangeAnalyst,
}) => {
  const reportTitle = activeReportType === 'overview' ? 'Overview Report' : activeReportType === 'valuation' ? 'Valuation Analysis' : activeReportType === 'industry' ? 'Industry Comparison' : activeReportType === 'news' ? 'News Impact' : 'Report';

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 5 · Report Viewer</div>
        <div className="app-section-title">{reportTitle}</div>
        <div className="app-section-subtitle">
          Generated from the structured outputs produced by the Fundamental Analyst AI.
        </div>
      </div>

      <div style={{ marginBottom: 14, fontSize: 13 }}>
        <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
      </div>

      {activeReportType === 'overview' && (
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
      )}

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="button-primary" onClick={onBackToReportingEngine}>
            Back to Reporting Engine
          </button>
          <button type="button" className="button-ghost" onClick={onRestart}>
            Start new analysis
          </button>
          <button type="button" className="button-ghost" onClick={onChangeAnalyst}>
            Change analyst
          </button>
        </div>
        <button type="button" className="button-secondary" onClick={onBackToWorkspace}>
          Back to workspace
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Shared UI components
// ---------------------------------------------------------------------------

const WidgetLoading: React.FC<{ label: string }> = ({ label }) => (
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

const KpiTable: React.FC<{ rows: KpiRow[] }> = ({ rows }) => (
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

const ProductReportBody: React.FC<{ company: Company }> = ({ company }) => (
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
