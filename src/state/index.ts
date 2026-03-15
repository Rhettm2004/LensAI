/**
 * App state and workflow orchestration.
 */

export { appReducer, getInitialAppState } from './appReducer';
export type { AppAction } from './appReducer';
export {
  SCREEN_ORDER,
  WORKFLOW_STEPS,
  INITIAL_GENERATED_REPORT_BY_TYPE,
  REPORT_TYPE_CONFIG,
  hasAnyReportGenerated,
  getReportTypeLabel,
  getPreviousScreen,
  getCurrentStepIndex,
} from './constants';
