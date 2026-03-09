/**
 * Data and API services. All data access goes through these modules.
 * Mock implementations live in ../mock; swap for real API calls when backend is ready.
 */

export {
  searchCompanies,
  getCompanyByTicker,
  getCompanyByTickerSync,
  getAvailableTickers,
  getCompanyForDisplay,
} from './companyService';

export {
  runFundamentalAnalysis,
  getCompanyAnalysis,
} from './analysisService';
export type { RunFundamentalAnalysisInput } from './analysisService';

export { generateOverviewReport } from './reportService';
export type { GenerateOverviewReportInput } from './reportService';
