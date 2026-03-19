/**
 * Centralized timing constants for mock/staged UI behavior.
 * Backend replacement should swap delays for real job polling elsewhere.
 */

/** Workspace: first widget (Company & market data) reveal after analysis data is loaded. */
export const WORKSPACE_WIDGET_1_MS = 1200;

/** Workspace: second widget (KPI Table) reveal. */
export const WORKSPACE_WIDGET_2_MS = 2400;

/** Workspace: analysis pipeline marked complete; CTA enabled. */
export const WORKSPACE_COMPLETE_MS = 3000;

/** Report generation mock delay. Keep in sync with reportService usage. */
export const REPORT_GENERATION_MOCK_MS = 1400;

/** Research Workspace: single sourced table reveal after analysis load. */
export const WORKSPACE_RESEARCH_WIDGET_MS = 900;

/** Analysis Workspace: loading before analysis widget appears. */
export const ANALYSIS_WORKSPACE_REVEAL_MS = 900;
