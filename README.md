# LensAI V0

AI-driven market analysis prototype. Users select a company, run a fundamental analysis, view structured outputs (Product Report + KPI Table) in a workspace, then generate and view an overview report.

**Stack:** React 19, Vite 7, TypeScript. No router; no external state library.

---

## Quick start

```bash
npm install
npm run dev
```

Build: `npm run build`. Preview: `npm run preview`.

---

## What’s built

### App flow

Navigation is **state-based** (no URL routing). Single linear workflow:

1. **Select Company** → Enter ticker (e.g. AAPL, MU, MSFT, NVDA), preview card appears, click to select.
2. **Choose Analyst** → Single “Fundamental Analyst”; click *Run analysis*.
3. **Workspace** → Product Report and KPI Table widgets appear progressively (staged loading); progress CTA unlocks *Open Reporting Engine* when complete.
4. **Reporting Engine** → Generate Overview Report (timer-simulated); View opens Report Viewer.
5. **Report Viewer** → Tabs for generated reports; overview shows sections + KPI table.

- **Back:** Header “Back” goes to previous step (`SCREEN_ORDER`).
- **Reset:** “Start again with new ticker” resets to Select Company.
- **Stepper:** Top stepper allows jumping to any unlocked step; step 5 (Report Viewer) unlocks only after at least one report is “generated”.

### State (single source of truth)

All app state lives in `AppState` and `appReducer` (`src/state/`).

| What | Where |
|------|--------|
| Selected company | `state.selectedCompany` |
| Ticker input | `state.tickerInput` |
| Analysis status | `state.analysisStatus` (`idle` → `running` → `widget_1_complete` → `widget_2_complete` → `complete`) |
| Analysis result | `state.analysisData` (company + analysis output) |
| Widget/report content | Same `analysisData.analysis` (reportSections, kpiRows) |
| Generated report flags | `state.generatedReports` (overview, valuation, industry, news) |

Screens and components receive data via props; no scattered duplicate state.

### Data

- **Companies:** AAPL, MU, MSFT, NVDA. All in `src/mock/data.ts` (`MOCK_COMPANIES`, `MOCK_ANALYSIS`). No company data hardcoded in UI.
- **Fallback:** Unknown/missing ticker uses `DEFAULT_TICKER` (`'MU'`) in mock layer.
- **Structured:** KPI rows use `KpiRow[]` with `metric`, `value`, `trend`, `periodValues`. Report sections use `ReportSection[]` (`title`, `content`). Product Report and KPI Table are data-driven from `analysisData.analysis`.

### Company search

- User types in the search field; **Select Company** debounces input and calls **`searchCompanies(query)`** (async, mock delay). Results match **partial ticker or partial company name** (case-insensitive).
- Suggestions render as **CompanyCard** list; click selects the company (`SELECT_COMPANY`); flow continues unchanged.

### Analysis workflow

- **Run Analysis** → Reducer sets `screen: 'workspace'`, `analysisStatus: 'running'`, `analysisData: null`. App then fetches via `getCompanyAnalysis(ticker)` and dispatches `SET_ANALYSIS_DATA`.
- **Staged loading:** After analysis data is set, timers (1.2s, 2.4s, 3s) advance status so Product Report appears first, then KPI Table, then “complete”. CTA “Open Reporting Engine” is disabled until `analysisStatus === 'complete'`.
- **Report generation (overview):** Clicking Generate sets `reportingEngineState` to generating; **App** calls `generateOverviewReport({ ticker, analysis })` (service still uses a mock delay). On resolve, reducer stores `overviewReport` and sets `generatedReports.overview`. Report Viewer reads **`state.overviewReport`** (sections + kpiRows snapshot), not raw analysis.

### Architecture

```
src/
  App.tsx              # Root: reducer, effects, screen switch, header/stepper
  main.tsx
  types/               # Domain (Company, AnalysisOutput, etc.) + app state types
  state/               # appReducer, constants (SCREEN_ORDER, report config)
  services/            # companyService, analysisService, reportService (mock-backed)
  mock/                # data.ts only; used only by services
  screens/             # SelectCompany, ChooseAnalyst, Workspace, ReportingEngine, ReportViewer
  components/          # layout (WorkflowStepper), cards (CompanyCard), widgets (KpiTable, ProductReportBody, WidgetLoading), progress
  utils/               # ticker normalization, workspace messages
  styles.css
```

- **Separation:** Screens are thin; state in reducer; data behind services; mock isolated; types centralized.
- **Services:** All data access goes through `services/`. Mock is only imported there; UI never imports mock. Service APIs are async and documented for future backend swap (e.g. `GET /companies/search`, `POST /analysis/run`).
- **Report service:** `generateOverviewReport()` is called from `App.tsx` when the Reporting Engine enters generating state for overview; result is stored in `overviewReport`.

---

## Known gaps

- **No URL routing** — No shareable links or browser back/forward; refresh loses position.
- ~~**Exact-ticker only**~~ — Replaced by `searchCompanies`-backed search (still mock dataset only).
- **Report generation** — Overview is wired through `reportService` and `overviewReport` state; service still simulates delay only (no backend).
- **Selected analyst unused** — `selectedAnalystId` exists in state but no UI sets it (only one analyst).
- **Non-overview reports** — Valuation/industry/news show “not yet available” placeholder.
- **Default ticker MU** — Fallback for unknown ticker is Micron (in mock).
- **Error UI** — `ErrorCallout` surfaces analysis load failure (workspace, Retry) and report generation failure (reporting engine, Try again). Messages are fixed strings until backend returns codes.
- **Timing constants** — Single source in `src/constants/timing.ts` for workspace staged delays and report mock delay (`reportService` imports same value).

---

## Recommended next steps

1. ~~**Wire report generation**~~ — Done: overview uses `generateOverviewReport` and `overviewReport` in state; next step is real backend/job polling.
2. **Optional:** Add URL routing (e.g. hash or path for screen + ticker) for shareable state and refresh.
3. ~~**Optional: searchCompanies in Select Company**~~ — Done. Next: backend `GET /companies/search` and ranking/pagination.

---

## Design reference

- **Colors:** Primary `#5B6CFF`, background `#0F1226`, card `#2A2940`, light text `#F5F6FA`.
- **Style:** Dark UI, soft purple accents, rounded cards, strong typography. Premium fintech / research feel.
- **V0 scope:** Company selection, one analyst, Product Report + KPI Table, overview report only. No chat, trading, portfolio, alerts, or user accounts.

---

## Key files

| Purpose | File(s) |
|--------|---------|
| Flow and state | `src/App.tsx`, `src/state/appReducer.ts` |
| Data and defaults | `src/mock/data.ts` |
| Company / analysis / report APIs | `src/services/companyService.ts`, `analysisService.ts`, `reportService.ts` |
| Screens | `src/screens/*.tsx` |
| Workflow steps and report config | `src/state/constants.ts` |
| Types | `src/types/index.ts`, `src/types/app.ts` |
