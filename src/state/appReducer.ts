/**
 * App state reducer and initial state. Single source of truth for workflow and UI state.
 */

import type { Company } from '../types';
import type { CompanyAnalysisResponse } from '../types';
import type { OverviewReportResult } from '../types';
import type {
  AppState,
  ScreenId,
  AnalystId,
  AnalysisStatus,
  ReportTypeId,
} from '../types/app';
import { SCREEN_ORDER, INITIAL_GENERATED_REPORTS, getPreviousScreen } from './constants';

export type AppAction =
  | { type: 'GO_TO_SCREEN'; payload: ScreenId }
  | { type: 'GO_BACK' }
  | { type: 'SET_TICKER_INPUT'; payload: string }
  | { type: 'SELECT_COMPANY'; payload: Company }
  | { type: 'SELECT_ANALYST'; payload: AnalystId }
  | { type: 'RUN_ANALYSIS' }
  | { type: 'SET_ANALYSIS_DATA'; payload: CompanyAnalysisResponse }
  | { type: 'SET_ANALYSIS_STATUS'; payload: AnalysisStatus }
  | { type: 'RESET_FLOW' }
  | { type: 'CHANGE_COMPANY' }
  | { type: 'CHANGE_ANALYST' }
  | { type: 'START_GENERATE_REPORT'; payload: ReportTypeId }
  /** Overview must include result from generateOverviewReport; other types flip flag only. */
  | {
      type: 'COMPLETE_GENERATE_REPORT';
      payload:
        | { reportType: 'overview'; result: OverviewReportResult }
        | { reportType: Exclude<ReportTypeId, 'overview'> };
    }
  | { type: 'GENERATE_REPORT_FAILED'; payload: ReportTypeId }
  | { type: 'OPEN_REPORT_VIEWER'; payload: ReportTypeId }
  | { type: 'SELECT_REPORT_TO_VIEW'; payload: ReportTypeId }
  | { type: 'BACK_TO_REPORTING_ENGINE' };

export function appReducer(state: AppState, action: AppAction): AppState {
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
        overviewReport: null,
        generatedReports: INITIAL_GENERATED_REPORTS,
        reportingEngineState: 'engine',
        generatingReportType: null,
        activeReportType: null,
      };

    case 'SET_ANALYSIS_DATA':
      return { ...state, analysisData: action.payload };

    case 'SET_ANALYSIS_STATUS':
      return { ...state, analysisStatus: action.payload };

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
        overviewReport: null,
        generatedReports: INITIAL_GENERATED_REPORTS,
        reportingEngineState: 'engine',
        generatingReportType: null,
        activeReportType: null,
      };

    case 'START_GENERATE_REPORT':
      return { ...state, reportingEngineState: 'generating', generatingReportType: action.payload };

    case 'COMPLETE_GENERATE_REPORT': {
      const nextBase = { ...state, reportingEngineState: 'engine' as const, generatingReportType: null };
      if (action.payload.reportType === 'overview') {
        return {
          ...nextBase,
          overviewReport: action.payload.result,
          generatedReports: { ...state.generatedReports, overview: true },
        };
      }
      const next = { ...nextBase };
      if (action.payload.reportType === 'valuation')
        next.generatedReports = { ...state.generatedReports, valuation: true };
      if (action.payload.reportType === 'industry')
        next.generatedReports = { ...state.generatedReports, industry: true };
      if (action.payload.reportType === 'news')
        next.generatedReports = { ...state.generatedReports, news: true };
      return next;
    }

    case 'GENERATE_REPORT_FAILED':
      return {
        ...state,
        reportingEngineState: 'engine',
        generatingReportType: null,
      };

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

export function getInitialAppState(): AppState {
  return {
    screen: 'select-company',
    maxStepReached: 0,
    tickerInput: '',
    selectedCompany: null,
    selectedAnalystId: null,
    analysisStatus: 'idle',
    analysisData: null,
    overviewReport: null,
    generatedReports: INITIAL_GENERATED_REPORTS,
    reportingEngineState: 'engine',
    generatingReportType: null,
    activeReportType: null,
  };
}
