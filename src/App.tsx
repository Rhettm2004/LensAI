import React, { useCallback, useEffect, useReducer } from 'react';
import type { Company, ScreenId, AppAnalysisStatus, ReportTypeId } from './types';
import { appReducer, getInitialAppState, getPreviousScreen, hasAnyReportGenerated } from './state';
import {
  getCompanyAnalysis,
  getCompanyByTickerSync,
  getAvailableTickers,
  getCompanyForDisplay,
  generateOverviewReport,
} from './services';
import { normalizeTicker, isTickerAvailable } from './utils/ticker';
import { WorkflowStepper } from './components/layout';
import {
  SelectCompanyScreen,
  ChooseAnalystScreen,
  WorkspaceScreen,
  ReportingEngineScreen,
  ReportViewerScreen,
} from './screens';

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialAppState);

  const goToScreen = useCallback((screen: ScreenId) => dispatch({ type: 'GO_TO_SCREEN', payload: screen }), []);
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const resetFlow = useCallback(() => dispatch({ type: 'RESET_FLOW' }), []);
  const setTickerInput = useCallback((value: string) => dispatch({ type: 'SET_TICKER_INPUT', payload: value }), []);
  const selectCompany = useCallback((company: Company) => dispatch({ type: 'SELECT_COMPANY', payload: company }), []);
  const runAnalysis = useCallback(() => dispatch({ type: 'RUN_ANALYSIS' }), []);
  const setAnalysisStatus = useCallback((status: AppAnalysisStatus) => dispatch({ type: 'SET_ANALYSIS_STATUS', payload: status }), []);
  const startGenerateReport = useCallback((reportType: ReportTypeId) => dispatch({ type: 'START_GENERATE_REPORT', payload: reportType }), []);
  const generateReportFailed = useCallback(
    (reportType: ReportTypeId) => dispatch({ type: 'GENERATE_REPORT_FAILED', payload: reportType }),
    []
  );
  const openReportViewer = useCallback((reportType: ReportTypeId) => dispatch({ type: 'OPEN_REPORT_VIEWER', payload: reportType }), []);
  const selectReportToView = useCallback((reportType: ReportTypeId) => dispatch({ type: 'SELECT_REPORT_TO_VIEW', payload: reportType }), []);

  const availableTickers = getAvailableTickers();
  const effectiveCompany = state.selectedCompany ?? getCompanyForDisplay(state.tickerInput);
  const canGoBack = getPreviousScreen(state.screen) !== null;

  const normalizedInputTicker = normalizeTicker(state.tickerInput);
  const tickerAvailable = isTickerAvailable(state.tickerInput, availableTickers);
  const tickerUnavailable = normalizedInputTicker.length > 0 && !tickerAvailable;
  const previewCompany = tickerAvailable ? getCompanyByTickerSync(state.tickerInput) : null;
  const analysis = state.analysisData?.analysis ?? null;

  const screensNeedingAnalysis: ScreenId[] = ['workspace', 'reporting-engine', 'report-viewer'];
  const needsAnalysisData = screensNeedingAnalysis.includes(state.screen) && state.selectedCompany;
  const hasStaleOrNoAnalysis =
    !state.analysisData || state.analysisData.company.ticker !== state.selectedCompany?.ticker;

  // Fetch analysis when on a screen that needs it and data is missing or for a different company
  useEffect(() => {
    if (!needsAnalysisData || !hasStaleOrNoAnalysis || !state.selectedCompany) return;
    const ticker = state.selectedCompany.ticker;
    getCompanyAnalysis(ticker)
      .then((data) => dispatch({ type: 'SET_ANALYSIS_DATA', payload: data }))
      .catch(() => { /* TODO: surface error in UI */ });
  }, [state.screen, state.selectedCompany?.ticker, state.analysisData, needsAnalysisData, hasStaleOrNoAnalysis]);

  // Advance workspace widget status only after analysis data has loaded (ensures KPI table has data).
  // Deps intentionally exclude analysisStatus so we don't re-run when status advances (which would cleanup and cancel t2/t3).
  const WIDGET_1_DELAY_MS = 1200;
  const WIDGET_2_DELAY_MS = 2400;
  const COMPLETE_DELAY_MS = 3000;
  useEffect(() => {
    if (
      state.screen !== 'workspace' ||
      state.analysisStatus !== 'running' ||
      !state.analysisData
    ) return;
    const t1 = setTimeout(() => dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'widget_1_complete' }), WIDGET_1_DELAY_MS);
    const t2 = setTimeout(() => dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'widget_2_complete' }), WIDGET_2_DELAY_MS);
    const t3 = setTimeout(() => dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'complete' }), COMPLETE_DELAY_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [state.screen, state.analysisData]);

  // Overview report generation: call report service once engine enters generating state; no duplicate timers.
  useEffect(() => {
    if (
      state.reportingEngineState !== 'generating' ||
      state.generatingReportType !== 'overview' ||
      !state.selectedCompany ||
      !analysis
    ) {
      return;
    }
    let cancelled = false;
    const ticker = state.selectedCompany.ticker;
    generateOverviewReport({ ticker, analysis })
      .then((result) => {
        if (!cancelled) {
          dispatch({ type: 'COMPLETE_GENERATE_REPORT', payload: { reportType: 'overview', result } });
        }
      })
      .catch(() => {
        if (!cancelled) generateReportFailed('overview');
      });
    return () => {
      cancelled = true;
    };
  }, [
    state.reportingEngineState,
    state.generatingReportType,
    state.selectedCompany?.ticker,
    analysis,
    generateReportFailed,
  ]);

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
              availableTickers={availableTickers}
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
              onAnalysisStatusChange={setAnalysisStatus}
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
              onOpenReportViewer={openReportViewer}
            />
          )}
          {state.screen === 'report-viewer' && (
            <ReportViewerScreen
              company={effectiveCompany}
              overviewReport={state.overviewReport}
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
