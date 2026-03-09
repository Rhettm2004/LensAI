import React, { useCallback, useEffect, useReducer } from 'react';
import type { AnalysisOutput, Company, CompanyAnalysisResponse, KpiRow } from './types';
import { DEFAULT_TICKER, getMockCompany, MOCK_TICKERS } from './mock/data';

function normalizeTicker(ticker: string): string {
  return (ticker || '').trim().toUpperCase();
}

function isTickerAvailable(ticker: string): boolean {
  const n = normalizeTicker(ticker);
  return n.length > 0 && MOCK_TICKERS.includes(n);
}
import { getCompanyAnalysis } from './services/analysisService';

// ---------------------------------------------------------------------------
// Types (app / UI state)
// ---------------------------------------------------------------------------

export type ScreenId =
  | 'select-company'
  | 'choose-analyst'
  | 'workspace'
  | 'reporting-engine'
  | 'report-viewer';

export type { Company };

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
  /** Loaded from data service when user runs analysis; drives workspace and report content. */
  analysisData: CompanyAnalysisResponse | null;
  widgetProductReportReady: boolean;
  widgetKpiTableReady: boolean;
  generatedReports: GeneratedReports;
  reportingEngineState: ReportingEngineState;
  generatingReportType: ReportTypeId | null;
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

const REPORT_TYPE_CONFIG: {
  id: ReportTypeId;
  label: string;
  description: string;
  availableInV0: boolean;
}[] = [
  { id: 'overview', label: 'Overview Report', description: 'Professional initiation report with company summary, investment thesis, financials, key positives/negatives, and credit/ESG notes.', availableInV0: true },
  { id: 'valuation', label: 'Valuation Analysis', description: 'DCF, comparable multiples, and sum-of-the-parts analysis.', availableInV0: false },
  { id: 'industry', label: 'Industry Comparison', description: 'Peer comparison and relative positioning within the sector.', availableInV0: false },
  { id: 'news', label: 'News Impact', description: 'Recent news and events affecting the investment case.', availableInV0: false },
];

function hasAnyReportGenerated(g: GeneratedReports): boolean {
  return g.overview || g.valuation || g.industry || g.news;
}

function getReportTypeLabel(id: ReportTypeId): string {
  return REPORT_TYPE_CONFIG.find((r) => r.id === id)?.label ?? id;
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
  | { type: 'SET_ANALYSIS_DATA'; payload: CompanyAnalysisResponse }
  | { type: 'SET_WIDGET_PRODUCT_REPORT_READY' }
  | { type: 'SET_WIDGET_KPI_TABLE_READY' }
  | { type: 'RESET_FLOW' }
  | { type: 'CHANGE_COMPANY' }
  | { type: 'CHANGE_ANALYST' }
  | { type: 'START_GENERATE_REPORT'; payload: ReportTypeId }
  | { type: 'COMPLETE_GENERATE_REPORT'; payload: ReportTypeId }
  | { type: 'OPEN_REPORT_VIEWER'; payload: ReportTypeId }
  | { type: 'SELECT_REPORT_TO_VIEW'; payload: ReportTypeId }
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
        analysisData: null,
        widgetProductReportReady: false,
        widgetKpiTableReady: false,
        generatedReports: INITIAL_GENERATED_REPORTS,
        reportingEngineState: 'engine',
        generatingReportType: null,
        activeReportType: null,
      };

    case 'SET_ANALYSIS_DATA':
      return { ...state, analysisData: action.payload };

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
        analysisData: null,
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
        generatingReportType: null,
        activeReportType: null,
      };

    case 'START_GENERATE_REPORT':
      return { ...state, reportingEngineState: 'generating', generatingReportType: action.payload };

    case 'COMPLETE_GENERATE_REPORT': {
      const next = { ...state, reportingEngineState: 'engine' as const, generatingReportType: null };
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

    case 'SELECT_REPORT_TO_VIEW':
      return { ...state, activeReportType: action.payload };

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
    analysisData: null,
    widgetProductReportReady: false,
    widgetKpiTableReady: false,
    generatedReports: INITIAL_GENERATED_REPORTS,
    reportingEngineState: 'engine',
    generatingReportType: null,
    activeReportType: null,
  };
}

// ---------------------------------------------------------------------------
// Company resolution (for select screen; uses mock; later can use API)
// ---------------------------------------------------------------------------

function getCompanyFromTicker(ticker: string): Company {
  return getMockCompany(ticker || DEFAULT_TICKER);
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

  const setTickerInput = useCallback((value: string) => dispatch({ type: 'SET_TICKER_INPUT', payload: value }), []);
  const selectCompany = useCallback((company: Company) => dispatch({ type: 'SELECT_COMPANY', payload: company }), []);
  const runAnalysis = useCallback(() => dispatch({ type: 'RUN_ANALYSIS' }), []);
  const setWidgetProductReportReady = useCallback(() => dispatch({ type: 'SET_WIDGET_PRODUCT_REPORT_READY' }), []);
  const setWidgetKpiTableReady = useCallback(() => dispatch({ type: 'SET_WIDGET_KPI_TABLE_READY' }), []);
  const startGenerateReport = useCallback((reportType: ReportTypeId) => dispatch({ type: 'START_GENERATE_REPORT', payload: reportType }), []);
  const completeGenerateReport = useCallback((reportType: ReportTypeId) => dispatch({ type: 'COMPLETE_GENERATE_REPORT', payload: reportType }), []);
  const openReportViewer = useCallback((reportType: ReportTypeId) => dispatch({ type: 'OPEN_REPORT_VIEWER', payload: reportType }), []);
  const selectReportToView = useCallback((reportType: ReportTypeId) => dispatch({ type: 'SELECT_REPORT_TO_VIEW', payload: reportType }), []);

  const effectiveCompany = state.selectedCompany ?? getCompanyFromTicker(state.tickerInput);
  const canGoBack = getPreviousScreen(state.screen) !== null;

  const normalizedInputTicker = normalizeTicker(state.tickerInput);
  const tickerAvailable = isTickerAvailable(state.tickerInput);
  const tickerUnavailable = normalizedInputTicker.length > 0 && !tickerAvailable;
  const previewCompany = tickerAvailable ? getMockCompany(state.tickerInput) : null;
  const analysis = state.analysisData?.analysis ?? null;

  const screensNeedingAnalysis: ScreenId[] = ['workspace', 'reporting-engine', 'report-viewer'];
  const needsAnalysisData = screensNeedingAnalysis.includes(state.screen) && state.selectedCompany;
  const hasStaleOrNoAnalysis =
    !state.analysisData || state.analysisData.company.ticker !== state.selectedCompany?.ticker;

  // Fetch company + analysis when on a screen that needs it and data is missing or for a different company.
  useEffect(() => {
    if (!needsAnalysisData || !hasStaleOrNoAnalysis) return;
    getCompanyAnalysis(state.selectedCompany!.ticker).then((data) =>
      dispatch({ type: 'SET_ANALYSIS_DATA', payload: data })
    );
  }, [state.screen, state.selectedCompany?.ticker, state.analysisData, needsAnalysisData, hasStaleOrNoAnalysis]);

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
            {state.screen !== 'select-company' && (
              <button type="button" className="button-ghost" onClick={resetFlow}>
                Start again with new ticker
              </button>
            )}
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
              previewCompany={previewCompany}
              tickerUnavailable={tickerUnavailable}
              normalizedTicker={normalizedInputTicker}
              onCompanySelect={selectCompany}
            />
          )}
          {state.screen === 'choose-analyst' && (
            <ChooseAnalystScreen
              company={effectiveCompany}
              onRunAnalysis={runAnalysis}
            />
          )}
          {state.screen === 'workspace' && (
            <WorkspaceScreen
              company={effectiveCompany}
              analysis={analysis}
              analysisStatus={state.analysisStatus}
              widgetProductReportReady={state.widgetProductReportReady}
              widgetKpiTableReady={state.widgetKpiTableReady}
              onWidgetProductReportReady={setWidgetProductReportReady}
              onWidgetKpiTableReady={setWidgetKpiTableReady}
              onOpenReportingEngine={() => goToScreen('reporting-engine')}
            />
          )}
          {state.screen === 'reporting-engine' && (
            <ReportingEngineScreen
              company={effectiveCompany}
              generatedReports={state.generatedReports}
              reportingEngineState={state.reportingEngineState}
              generatingReportType={state.generatingReportType}
              onStartGenerateReport={startGenerateReport}
              onCompleteGenerateReport={completeGenerateReport}
              onOpenReportViewer={openReportViewer}
            />
          )}
          {state.screen === 'report-viewer' && (
            <ReportViewerScreen
              company={effectiveCompany}
              analysis={analysis}
              generatedReports={state.generatedReports}
              activeReportType={state.activeReportType}
              onSelectReport={selectReportToView}
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
  previewCompany: Company | null;
  tickerUnavailable: boolean;
  normalizedTicker: string;
  onCompanySelect: (company: Company) => void;
};

const SelectCompanyScreen: React.FC<SelectCompanyProps> = ({
  tickerInput,
  onTickerChange,
  previewCompany,
  tickerUnavailable,
  normalizedTicker,
  onCompanySelect,
}) => {
  const handleCardClick = () => previewCompany && onCompanySelect(previewCompany);

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
        placeholder="Enter ticker (e.g. AAPL, MU, MSFT, NVDA)"
        value={tickerInput}
        maxLength={8}
        onChange={(e) => onTickerChange(e.target.value)}
      />

      {tickerUnavailable && (
        <div
          role="alert"
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 8,
            background: 'rgba(220, 80, 80, 0.12)',
            border: '1px solid rgba(220, 80, 80, 0.35)',
            color: '#e8a0a0',
            fontSize: 13,
          }}
        >
          Ticker &quot;{normalizedTicker}&quot; is not available. Available tickers: {MOCK_TICKERS.join(', ')}.
        </div>
      )}

      {previewCompany && (
        <button type="button" className="company-card" onClick={handleCardClick}>
          <div className="company-logo">{previewCompany.initial ?? previewCompany.ticker?.[0] ?? '?'}</div>
          <div className="company-main">
            <div className="company-name">{previewCompany.name}</div>
            <div className="company-ticker">{previewCompany.ticker}</div>
            <div className="company-meta">
              {previewCompany.exchange} · {previewCompany.marketCap} · {previewCompany.sector} · {previewCompany.industry}
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
};

const ChooseAnalystScreen: React.FC<ChooseAnalystProps> = ({
  company,
  onRunAnalysis,
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
          <div style={{ marginTop: 12 }}>
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
  analysis: AnalysisOutput | null;
  analysisStatus: AnalysisStatus;
  widgetProductReportReady: boolean;
  widgetKpiTableReady: boolean;
  onWidgetProductReportReady: () => void;
  onWidgetKpiTableReady: () => void;
  onOpenReportingEngine: () => void;
};

const WorkspaceScreen: React.FC<WorkspaceProps> = ({
  company,
  analysis,
  analysisStatus,
  widgetProductReportReady,
  widgetKpiTableReady,
  onWidgetProductReportReady,
  onWidgetKpiTableReady,
  onOpenReportingEngine,
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
            {!widgetProductReportReady || !analysis ? (
              <WidgetLoading label="Reconstructing business model and narrative..." />
            ) : (
              <ProductReportBody analysis={analysis} />
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
            {!widgetKpiTableReady || !analysis ? (
              <WidgetLoading label="Aligning financial series and KPI trends..." />
            ) : (
              <KpiTable rows={analysis.kpiRows} />
            )}
          </div>
        </div>
      </div>

      <div className="progress-indicator progress-indicator-stacked">
        <div className="progress-indicator-row">
          <span className="progress-indicator-label">
            {completedCount} of 2 widgets complete ·{' '}
            {!allComplete ? 'Running structured analysis…' : 'Analysis complete'}
          </span>
          <div className="progress-bar-outer">
            <div
              className="progress-bar-inner"
              style={{ width: `${(completedCount / 2) * 100}%` }}
            />
          </div>
        </div>
        <div className="progress-indicator-cta">
          <p className="progress-indicator-microcopy">
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
  generatingReportType: ReportTypeId | null;
  onStartGenerateReport: (reportType: ReportTypeId) => void;
  onCompleteGenerateReport: (reportType: ReportTypeId) => void;
  onOpenReportViewer: (reportType: ReportTypeId) => void;
};

const ReportingEngineScreen: React.FC<ReportingEngineScreenProps> = ({
  company,
  generatedReports,
  reportingEngineState,
  generatingReportType,
  onStartGenerateReport,
  onCompleteGenerateReport,
  onOpenReportViewer,
}) => {
  const reportTypeBeingGenerated = generatingReportType ?? 'overview';

  React.useEffect(() => {
    if (reportingEngineState !== 'generating' || !generatingReportType) return;
    const t = setTimeout(() => onCompleteGenerateReport(generatingReportType), 1400);
    return () => clearTimeout(t);
  }, [reportingEngineState, generatingReportType, onCompleteGenerateReport]);

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 4 · Reporting Engine</div>
        <div className="app-section-title">Evaluation &amp; Reporting Engine</div>
        <div className="app-section-subtitle">
          {reportingEngineState === 'engine'
            ? 'Generate report outputs from your completed analysis. Choose a report type below and click Generate or View.'
            : `Generating ${getReportTypeLabel(reportTypeBeingGenerated).toLowerCase()} from workspace outputs…`}
        </div>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: '#a3a7c2' }}>
        <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
      </div>

      {reportingEngineState === 'engine' && (
        <div className="screen-grid" style={{ marginBottom: 20 }}>
          {REPORT_TYPE_CONFIG.map((config) => {
            const isGenerated = generatedReports[config.id];
            const isAvailable = config.availableInV0;
            const isMuted = !isAvailable;

            return (
              <div
                key={config.id}
                className={isMuted ? 'analyst-card analyst-card-muted' : 'analyst-card'}
              >
                <div className="analyst-title-row">
                  <div className="analyst-title">{config.label}</div>
                  {isAvailable && <span className="analyst-chip">V0 Active</span>}
                </div>
                <div className="analyst-desc">{config.description}</div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: isMuted ? 'flex-end' : 'flex-start' }}>
                  {isAvailable ? (
                    isGenerated ? (
                      <button
                        type="button"
                        className="button-primary"
                        onClick={() => onOpenReportViewer(config.id)}
                      >
                        View
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button-primary"
                        onClick={() => onStartGenerateReport(config.id)}
                      >
                        Generate
                      </button>
                    )
                  ) : (
                    <button type="button" className="button-secondary button-disabled" disabled>
                      Coming soon
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
            <div style={{ fontSize: 13 }}>
              Compiling {getReportTypeLabel(reportTypeBeingGenerated).toLowerCase()} from workspace outputs…
            </div>
            <div style={{ fontSize: 11, color: '#7075a0' }}>Processing…</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Screen 5 — Report Viewer
// ---------------------------------------------------------------------------

type ReportViewerScreenProps = {
  company: Company;
  analysis: AnalysisOutput | null;
  generatedReports: GeneratedReports;
  activeReportType: ReportTypeId | null;
  onSelectReport: (reportType: ReportTypeId) => void;
};

const LIST_SECTION_TITLES = ['Key Positives', 'Key Negatives'];
const KPI_SECTION_TITLE = 'Financials (KPI Snapshot)';

const ReportViewerScreen: React.FC<ReportViewerScreenProps> = ({
  company,
  analysis,
  generatedReports,
  activeReportType,
  onSelectReport,
}) => {
  const generatedList = (['overview', 'valuation', 'industry', 'news'] as const).filter(
    (id) => generatedReports[id]
  );
  const effectiveReportType = activeReportType && generatedReports[activeReportType]
    ? activeReportType
    : generatedList[0] ?? null;

  React.useEffect(() => {
    if (generatedList.length > 0 && !activeReportType) {
      onSelectReport(generatedList[0]);
    }
  }, [generatedList.length, activeReportType, onSelectReport]);

  const reportTitle = effectiveReportType ? getReportTypeLabel(effectiveReportType) : 'Report';
  const reportSections = analysis?.reportSections ?? [];
  const kpiRows = analysis?.kpiRows ?? [];

  return (
    <div>
      <div className="app-section-header">
        <div className="app-section-eyebrow">Step 5 · Report Viewer</div>
        <div className="app-section-title">Report Viewer</div>
        <div className="app-section-subtitle">
          Open and view generated reports below. Select a report to view its content.
        </div>
      </div>

      <div style={{ marginBottom: 14, fontSize: 13 }}>
        <strong>{company.name}</strong> ({company.ticker}) · {company.exchange} · {company.marketCap}
      </div>

      {generatedList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Generated reports
          </div>
          <div className="tabs" style={{ flexWrap: 'wrap', gap: 6 }}>
            {generatedList.map((id) => (
              <button
                key={id}
                type="button"
                className={`tab-pill ${effectiveReportType === id ? 'tab-pill-active' : ''}`}
                onClick={() => onSelectReport(id)}
              >
                {getReportTypeLabel(id)}
              </button>
            ))}
          </div>
        </div>
      )}

      {generatedList.length === 0 && (
        <div className="report-section">
          <div className="report-body">
            No reports generated yet. Go to the Reporting Engine (step 4) to generate report outputs.
          </div>
        </div>
      )}

      {effectiveReportType === 'overview' && reportSections.length > 0 && (
        <div className="report-layout">
          <div>
            {reportSections
              .filter((s) => s.title !== KPI_SECTION_TITLE && s.title !== 'Credit & ESG')
              .map((section) => (
                <div key={section.title} className="report-section" style={{ marginTop: 10 }}>
                  <div className="report-section-title">{section.title}</div>
                  <div className="report-body">
                    {LIST_SECTION_TITLES.includes(section.title) && section.content.includes('\n') ? (
                      <ul className="bullet-list">
                        {section.content.split('\n').filter(Boolean).map((line, i) => (
                          <li key={i}>{line.trim()}</li>
                        ))}
                      </ul>
                    ) : (
                      section.content
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div>
            {reportSections
              .filter((s) => s.title === KPI_SECTION_TITLE || s.title === 'Credit & ESG')
              .map((section) => (
                <div key={section.title} className="report-section" style={{ marginTop: 10 }}>
                  <div className="report-section-title">{section.title}</div>
                  <div className="report-body">{section.content}</div>
                  {section.title === KPI_SECTION_TITLE && kpiRows.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <KpiTable rows={kpiRows} />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {effectiveReportType && effectiveReportType !== 'overview' && (
        <div className="report-section">
          <div className="report-section-title">{reportTitle}</div>
          <div className="report-body">
            This report type is not yet available in V0. Placeholder content for {reportTitle} will be
            implemented in a future release.
          </div>
        </div>
      )}
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

const KPI_PERIOD_ORDER = ['FY21', 'FY22', 'FY23', 'FY24'];

const KpiTable: React.FC<{ rows: KpiRow[] }> = ({ rows }) => {
  const periods = rows[0]?.periodValues ? KPI_PERIOD_ORDER.filter((p) => p in (rows[0].periodValues ?? {})) : [];
  const usePeriods = periods.length > 0;

  return (
    <table className="kpi-table">
      <thead>
        <tr>
          <th>KPI</th>
          {usePeriods ? periods.map((p) => <th key={p}>{p}</th>) : <th>Value</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.metric}>
            <td>{row.metric}</td>
            {usePeriods
              ? periods.map((p) => <td key={p}>{row.periodValues?.[p] ?? '—'}</td>)
              : <td>{row.value}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ProductReportBody: React.FC<{ analysis: AnalysisOutput }> = ({ analysis }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ fontSize: 13, color: '#f5f6fa' }}>
      <strong>Business model overview</strong>
    </div>
    <div style={{ fontSize: 13 }}>{analysis.businessModelOverview}</div>
    <div style={{ fontSize: 13, marginTop: 4 }}>
      <strong>Revenue drivers</strong>
    </div>
    <div style={{ fontSize: 13 }}>{analysis.revenueDrivers}</div>
    <div style={{ fontSize: 13, marginTop: 4 }}>
      <strong>Industry positioning</strong>
    </div>
    <div style={{ fontSize: 13 }}>{analysis.industryPositioning}</div>
  </div>
);
