/**
 * App state reducer and initial state. Single source of truth for workflow and UI state.
 */

import type { Company } from '../types';
import type { CompanyAnalysisResponse } from '../types';
import type { GeneratedReportArtifact } from '../types/reportDocument';
import type { ReportDocument } from '../types/report';
import type {
  AppState,
  ScreenId,
  AnalystId,
  AnalysisStatus,
  ReportTypeId,
} from '../types/app';
import {
  SCREEN_ORDER,
  INITIAL_GENERATED_REPORT_BY_TYPE,
  getPreviousScreen,
} from './constants';

export type AppAction =
  | { type: 'GO_TO_SCREEN'; payload: ScreenId }
  | { type: 'GO_BACK' }
  | { type: 'SET_TICKER_INPUT'; payload: string }
  | { type: 'SELECT_COMPANY'; payload: Company }
  | { type: 'SELECT_ANALYST'; payload: AnalystId }
  | { type: 'RUN_ANALYSIS' }
  | { type: 'SET_ANALYSIS_DATA'; payload: CompanyAnalysisResponse }
  | { type: 'SET_ANALYSIS_LOAD_ERROR'; payload: string }
  | { type: 'SET_ANALYSIS_STATUS'; payload: AnalysisStatus }
  | { type: 'RESET_FLOW' }
  | { type: 'CHANGE_COMPANY' }
  | { type: 'CHANGE_ANALYST' }
  | { type: 'START_GENERATE_REPORT'; payload: ReportTypeId }
  | { type: 'COMPLETE_GENERATE_REPORT'; payload: { reportType: ReportTypeId; artifact: GeneratedReportArtifact } }
  | { type: 'GENERATE_REPORT_FAILED'; payload: { reportType: ReportTypeId; message: string } }
  | { type: 'OPEN_REPORT_VIEWER'; payload: ReportTypeId }
  | { type: 'OPEN_REPORT_WORKSPACE'; payload: { reportType: ReportTypeId; reportDocument: ReportDocument | null } }
  | { type: 'SELECT_REPORT_TO_VIEW'; payload: ReportTypeId }
  | { type: 'BACK_TO_REPORTING_ENGINE' };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'GO_TO_SCREEN': {
      const newIndex = SCREEN_ORDER.indexOf(action.payload);
      const nextMax = Math.max(state.maxStepReached, newIndex);
      const clearReportDoc = action.payload !== 'report-viewer' ? { currentReportDocument: null } : {};
      return { ...state, screen: action.payload, maxStepReached: nextMax, ...clearReportDoc };
    }

    case 'GO_BACK': {
      const prev = getPreviousScreen(state.screen);
      const clearReportDoc = state.screen === 'report-viewer' ? { currentReportDocument: null } : {};
      return prev ? { ...state, screen: prev, ...clearReportDoc } : state;
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
        selectedAnalystId: 'fundamental',
        analysisStatus: 'running',
        analysisData: null,
        analysisLoadError: null,
        generatedReportByType: INITIAL_GENERATED_REPORT_BY_TYPE,
        reportingEngineState: 'engine',
        generatingReportType: null,
        activeReportType: null,
      };

    case 'SET_ANALYSIS_DATA':
      return { ...state, analysisData: action.payload, analysisLoadError: null };

    case 'SET_ANALYSIS_LOAD_ERROR':
      return { ...state, analysisLoadError: action.payload, analysisStatus: 'idle' };

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
        generatedReportByType: INITIAL_GENERATED_REPORT_BY_TYPE,
        reportingEngineState: 'engine',
        generatingReportType: null,
        activeReportType: null,
      };

    case 'START_GENERATE_REPORT':
      return {
        ...state,
        reportingEngineState: 'generating',
        generatingReportType: action.payload,
        reportGenerationError: null,
      };

    case 'COMPLETE_GENERATE_REPORT': {
      const { reportType, artifact } = action.payload;
      return {
        ...state,
        reportingEngineState: 'engine',
        generatingReportType: null,
        reportGenerationError: null,
        generatedReportByType: {
          ...state.generatedReportByType,
          [reportType]: artifact,
        },
      };
    }

    case 'GENERATE_REPORT_FAILED':
      return {
        ...state,
        reportingEngineState: 'engine',
        generatingReportType: null,
        reportGenerationError: action.payload.message,
      };

    case 'OPEN_REPORT_VIEWER':
      return {
        ...state,
        screen: 'report-viewer',
        activeReportType: action.payload,
        maxStepReached: Math.max(state.maxStepReached, 4),
      };

    case 'OPEN_REPORT_WORKSPACE':
      return {
        ...state,
        screen: 'report-viewer',
        activeReportType: action.payload.reportType,
        currentReportDocument: action.payload.reportDocument,
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
    analysisLoadError: null,
    reportGenerationError: null,
    generatedReportByType: INITIAL_GENERATED_REPORT_BY_TYPE,
    reportingEngineState: 'engine',
    generatingReportType: null,
    activeReportType: null,
    currentReportDocument: null,
  };
}
