import React, { useCallback, useEffect, useReducer } from 'react';
import type { Company, ScreenId } from './types';
import { appReducer, getInitialAppState, getPreviousScreen } from './state';
import {
  getCompanyAnalysis,
  getCompanyForDisplay,
  generateValuationReport,
  buildValuationReportArtifactFromReport,
} from './services';
import { buildBrandedPdfFromReport } from './services/reportPdfFromReport';
import { buildAnalysisWorkspaceDocument } from './utils/buildAnalysisFromResearch';
import { downloadReportPdfArtifact } from './services/reportPdfExport';
import { WORKSPACE_RESEARCH_WIDGET_MS, ANALYSIS_WORKSPACE_REVEAL_MS } from './constants';
import { getReportTypeLabel } from './state/constants';
import { valuationReportTitle } from './utils/buildValuationReportDocument';
import { WorkflowStepper } from './components/layout';
import {
  SelectCompanyScreen,
  ChooseAnalystScreen,
  WorkspaceScreen,
  AnalysisWorkspaceScreen,
  ReportingEngineScreen,
  ExportScreen,
} from './screens';

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialAppState);

  const goToScreen = useCallback(
    (screen: ScreenId) => {
      if (screen === 'analysis-workspace' && !state.currentAnalysisDocument) return;
      if (
        screen === 'report-viewer' &&
        !state.currentReportDocument &&
        !state.generatedReportByType.valuation?.pdfBytes?.length
      ) {
        return;
      }
      dispatch({ type: 'GO_TO_SCREEN', payload: screen });
    },
    [
      state.currentAnalysisDocument,
      state.currentReportDocument,
      state.generatedReportByType.valuation?.pdfBytes?.length,
    ]
  );
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const resetFlow = useCallback(() => dispatch({ type: 'RESET_FLOW' }), []);
  const setTickerInput = useCallback((value: string) => dispatch({ type: 'SET_TICKER_INPUT', payload: value }), []);
  const selectCompany = useCallback((company: Company) => dispatch({ type: 'SELECT_COMPANY', payload: company }), []);
  const runAnalysis = useCallback(() => dispatch({ type: 'RUN_ANALYSIS' }), []);
  const startGenerateReport = useCallback(
    () => dispatch({ type: 'START_GENERATE_REPORT', payload: 'valuation' }),
    []
  );
  const generateReportFailed = useCallback((message: string) => {
    dispatch({ type: 'GENERATE_REPORT_FAILED', payload: { reportType: 'valuation', message } });
  }, []);

  const continueToAnalysis = useCallback(() => {
    if (!state.analysisData) return;
    const doc = buildAnalysisWorkspaceDocument(
      state.analysisData.analysis,
      state.analysisData.company.ticker
    );
    dispatch({ type: 'CONTINUE_TO_ANALYSIS', payload: doc });
  }, [state.analysisData]);

  const continueToReporting = useCallback(() => dispatch({ type: 'CONTINUE_TO_REPORTING' }), []);

  const clearValuationAndRegenerate = useCallback(() => {
    dispatch({ type: 'CLEAR_VALUATION_ARTIFACT' });
    dispatch({ type: 'START_GENERATE_REPORT', payload: 'valuation' });
  }, []);

  const handleExportPdf = useCallback(async () => {
    const company = state.selectedCompany;
    if (!company || !state.currentAnalysisDocument || !state.analysisData) return;

    if (state.currentReportDocument) {
      try {
        const pdfBytes = await buildBrandedPdfFromReport({
          reportDocument: state.currentReportDocument,
          company,
          reportTypeId: 'valuation',
          title: valuationReportTitle(company),
          generatedAtIso: state.currentReportDocument.generatedAt,
        });
        const artifact = buildValuationReportArtifactFromReport(
          state.currentReportDocument,
          company,
          pdfBytes
        );
        downloadReportPdfArtifact(artifact);
      } catch {
        generateReportFailed('PDF export failed. Please try again.');
      }
      return;
    }

    const existing = state.generatedReportByType.valuation;
    if (existing?.pdfBytes?.length) {
      downloadReportPdfArtifact(existing);
    }
  }, [
    state.selectedCompany,
    state.analysisData,
    state.currentAnalysisDocument,
    state.currentReportDocument,
    state.generatedReportByType.valuation,
    generateReportFailed,
  ]);

  const effectiveCompany = state.selectedCompany ?? getCompanyForDisplay(state.tickerInput);
  const canGoBack = getPreviousScreen(state.screen) !== null;
  const analysis = state.analysisData?.analysis ?? null;

  const screensNeedingAnalysis: ScreenId[] = ['research', 'analysis-workspace', 'reporting'];
  const needsAnalysisData = screensNeedingAnalysis.includes(state.screen) && state.selectedCompany;
  const hasStaleOrNoAnalysis =
    !state.analysisData || state.analysisData.company.ticker !== state.selectedCompany?.ticker;

  useEffect(() => {
    if (!needsAnalysisData || !hasStaleOrNoAnalysis || !state.selectedCompany) return;
    const ticker = state.selectedCompany.ticker;
    getCompanyAnalysis(ticker)
      .then((data) => dispatch({ type: 'SET_ANALYSIS_DATA', payload: data }))
      .catch(() => {
        dispatch({
          type: 'SET_ANALYSIS_LOAD_ERROR',
          payload: 'Could not load research for this company. Check your connection and try again.',
        });
      });
  }, [state.screen, state.selectedCompany?.ticker, state.analysisData, needsAnalysisData, hasStaleOrNoAnalysis]);

  useEffect(() => {
    if (state.screen !== 'research' || state.analysisStatus !== 'running' || !state.analysisData) return;
    const t = setTimeout(
      () => dispatch({ type: 'SET_ANALYSIS_STATUS', payload: 'complete' }),
      WORKSPACE_RESEARCH_WIDGET_MS
    );
    return () => clearTimeout(t);
  }, [state.screen, state.analysisData, state.analysisStatus]);

  useEffect(() => {
    if (state.screen !== 'analysis-workspace' || !state.currentAnalysisDocument || !state.selectedCompany) return;
    const revealKey = `${state.selectedCompany.ticker}|${state.currentAnalysisDocument.generatedAt}`;
    if (state.analysisWorkspaceRevealCompleteKey === revealKey) return;
    const t = setTimeout(() => {
      dispatch({ type: 'ANALYSIS_WORKSPACE_REVEAL_DONE', payload: revealKey });
    }, ANALYSIS_WORKSPACE_REVEAL_MS);
    return () => clearTimeout(t);
  }, [
    state.screen,
    state.selectedCompany?.ticker,
    state.currentAnalysisDocument?.generatedAt,
    state.analysisWorkspaceRevealCompleteKey,
  ]);

  useEffect(() => {
    if (
      state.reportingEngineState !== 'generating' ||
      state.generatingReportType !== 'valuation' ||
      !state.selectedCompany ||
      !analysis ||
      !state.currentAnalysisDocument
    ) {
      return;
    }
    let cancelled = false;
    generateValuationReport({
      ticker: state.selectedCompany.ticker,
      company: state.selectedCompany,
      analysis,
      analysisDoc: state.currentAnalysisDocument,
    })
      .then(({ artifact, reportDocument }) => {
        if (!cancelled) {
          dispatch({ type: 'SET_CURRENT_REPORT_DOCUMENT', payload: reportDocument });
          dispatch({ type: 'COMPLETE_GENERATE_REPORT', payload: { reportType: 'valuation', artifact } });
        }
      })
      .catch(() => {
        if (!cancelled) {
          generateReportFailed(
            'Report generation failed. Try again or go back to adjust your research and analysis.'
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    state.reportingEngineState,
    state.generatingReportType,
    state.selectedCompany?.ticker,
    analysis,
    state.currentAnalysisDocument,
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
                Start again
              </button>
            )}
            <div className="app-pill">6-step flow</div>
          </div>
        </header>

        <main className="app-main-card">
          <WorkflowStepper
            currentScreen={state.screen}
            maxStepReached={state.maxStepReached}
            onStepClick={goToScreen}
          />

          {state.screen === 'select-company' && (
            <SelectCompanyScreen
              tickerInput={state.tickerInput}
              selectedTicker={state.selectedCompany?.ticker ?? null}
              onTickerChange={setTickerInput}
              onCompanySelect={selectCompany}
            />
          )}

          {state.screen === 'select-analyst' && state.selectedCompany && (
            <ChooseAnalystScreen company={state.selectedCompany} onRunAnalysis={runAnalysis} />
          )}

          {state.screen === 'select-analyst' && !state.selectedCompany && (
            <div style={{ padding: 24, color: '#a3a7c2' }}>
              Select a company first.{' '}
              <button type="button" className="button-ghost" onClick={() => goToScreen('select-company')}>
                Select Company
              </button>
            </div>
          )}

          {state.screen === 'research' && (
            <WorkspaceScreen
              company={effectiveCompany}
              analysis={analysis}
              analysisStatus={state.analysisStatus}
              analysisLoadError={state.analysisLoadError}
              onRetryAnalysis={runAnalysis}
              onContinueToAnalysis={continueToAnalysis}
            />
          )}

          {state.screen === 'analysis-workspace' && state.currentAnalysisDocument && state.selectedCompany && (
            <AnalysisWorkspaceScreen
              company={effectiveCompany}
              analysisDoc={state.currentAnalysisDocument}
              analysisContentReady={
                state.analysisWorkspaceRevealCompleteKey ===
                `${state.selectedCompany.ticker}|${state.currentAnalysisDocument.generatedAt}`
              }
              onContinueToReporting={continueToReporting}
            />
          )}

          {state.screen === 'analysis-workspace' && !state.currentAnalysisDocument && (
            <div style={{ padding: 24, color: '#a3a7c2' }}>
              No analysis document.{' '}
              <button type="button" className="button-ghost" onClick={() => goToScreen('research')}>
                Return to Research
              </button>
            </div>
          )}

          {state.screen === 'reporting' && state.currentAnalysisDocument && (
            <ReportingEngineScreen
              company={effectiveCompany}
              reportingEngineState={state.reportingEngineState}
              reportGenerationError={state.reportGenerationError}
              hasGeneratedReport={
                state.currentReportDocument != null ||
                (state.generatedReportByType.valuation?.pdfBytes?.length ?? 0) > 0
              }
              onGenerateValuationReport={startGenerateReport}
              onRegenerate={clearValuationAndRegenerate}
              onOpenReportViewer={() => goToScreen('report-viewer')}
            />
          )}

          {state.screen === 'reporting' && !state.currentAnalysisDocument && (
            <div style={{ padding: 24, color: '#a3a7c2' }}>
              Complete Analysis Workspace first.{' '}
              <button type="button" className="button-ghost" onClick={() => goToScreen('analysis-workspace')}>
                Go to Analysis
              </button>
            </div>
          )}

          {state.screen === 'report-viewer' && (
            <ExportScreen
              company={effectiveCompany}
              reportDocument={state.currentReportDocument}
              reportTypeLabel={getReportTypeLabel('valuation')}
              onExportPdf={handleExportPdf}
              onBackToReporting={() => goToScreen('reporting')}
            />
          )}
        </main>

        <footer className="app-footer">
          <span>
            <strong>LensAI</strong> · Company → Analyst → Research → Analysis → Reporting → Export
          </span>
        </footer>
      </div>
    </div>
  );
};
