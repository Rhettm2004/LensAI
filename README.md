# LensAI V0

Prototype **AI-driven market analysis** UI: pick a company, review mock research, step through a separate analysis view, generate an **illustrative valuation report**, then preview and export **PDF**. The experience is **frontend-first** and **mock-backed**; an optional Express backend exists mainly for future HTTP integration.

**Stack:** React 19, Vite 7, TypeScript, `pdf-lib`. No router; no external global state library (workflow state is a single `useReducer`).

---

## Quick start

From the repository root:

```bash
npm install
npm run dev
```

- **Build:** `npm run build`  
- **Preview production build:** `npm run preview`

---

## User flow (6 steps)

Navigation is **in-memory only** (no URL routing). The canonical order is defined in `src/state/constants.ts` (`SCREEN_ORDER`):

1. **Select Company** — Search/select from the mock universe (partial ticker or name).
2. **Select Analyst** — Single “Fundamental Analyst”; **Run analysis** loads research for the ticker.
3. **Research Workspace** — **Sourced** revenue & earnings table (structured mock data); short staged loading, then **Continue to Analysis Workspace**.
4. **Analysis Workspace** — Interpretation/commentary derived from research (brief staged “preparing analysis…”); **Continue to Reporting**.
5. **Reporting Engine** — **Generate** an illustrative **Valuation Report** (mock delay, then client-side PDF build).
6. **Report & Export** — Preview the generated report and **export PDF** (or download an already-generated artifact).

**Back** / **Start again** in the header follow `appReducer` rules; the **stepper** only allows jumping to steps you have already reached (`maxStepReached`).

---

## Architecture (high level)

```
src/
  App.tsx                 # useReducer, effects (analysis load, report gen, PDF), screen switch
  main.tsx
  types/                  # Domain + AppState (screens, reports, documents)
  state/                  # appReducer.ts, constants (SCREEN_ORDER, report labels)
  services/               # companyService, analysisService, reportService, PDF helpers (mock-backed today)
  mock/data.ts            # Companies + analysis payloads consumed by services
  screens/                # One screen component per workflow step (incl. Analysis Workspace + Export)
  components/             # Stepper, widgets, report blocks, feedback
  utils/                  # Workspace/analysis/report document builders
  constants/              # Timing and other shared constants (e.g. staged UI delays)
  styles.css
```

- **Separation:** Screens are mostly presentational; workflow rules live in the **reducer**; structured data is accessed through **`services/`**, which today **always** use the mock layer (see below).

---

## State management

Global UI state is **`AppState`** (`src/types/app.ts`), updated only via **`appReducer`** (`src/state/appReducer.ts`) and actions dispatched from `App.tsx`.

Important concepts:

| Area | Role |
|------|------|
| `screen`, `maxStepReached` | Current step and how far the user may jump in the stepper |
| `selectedCompany`, `tickerInput` | Company selection and search field |
| `analysisStatus` | `idle` → `running` → `complete` for the **Research Workspace** load/reveal |
| `analysisData` | Mock `CompanyAnalysisResponse` from `getCompanyAnalysis` |
| `currentAnalysisDocument` | Document built when leaving Research for Analysis Workspace |
| `reportingEngineState`, `generatingReportType` | Reporting step: idle engine vs generating (valuation) |
| `currentReportDocument`, `generatedReportByType` | Valuation report content and stored PDF bytes for download |
| `analysisWorkspaceRevealCompleteKey` | Gates Analysis Workspace content after a short reveal delay |

There is **no** URL-synced state; refresh returns to the initial screen.

---

## Where the data comes from

- **Companies and analysis payloads** are defined in **`src/mock/data.ts`** (`MOCK_COMPANIES`, per-ticker analysis objects). Services **`searchCompanies`**, **`getCompanyAnalysis`**, etc., apply small **artificial delays** and call into this module.
- **Unknown tickers** in the mock helpers fall back to **`DEFAULT_TICKER`** (currently **`AAPL`**) for shape-safe demo data—not live market data.
- **`src/services/apiBase.ts`** defines **`VITE_API_BASE_URL`** and a small **`apiJson`** helper for a future HTTP switch; **current service implementations do not call the backend**—they use mocks only.

---

## Mock / MVP / incomplete

- **Mock-only path:** No real market feeds, jobs, or authenticated APIs in the default UI path.
- **Single analyst path:** `RUN_ANALYSIS` sets `selectedAnalystId` to **`fundamental`**; there is no multi-analyst product surface.
- **Valuation report:** Described in UI as **illustrative** (multiples framing, not a full DCF). Generation uses **`generateValuationReport`** (mock delay + **`pdf-lib`** PDF bytes).
- **Legacy “overview” report:** The frontend exposes a **deprecated** `generateOverviewReport` that **throws**; do not use it as the current product path.
- **No shareable URLs** and no browser history integration for steps.

---

## Optional backend

```bash
cd backend && npm install && npm run dev
```

Default **http://localhost:3001**. Endpoints include company search, analysis bundle delivery, and a **report generate** route aligned with an **overview-shaped** API (see `backend/README.md`). The **running SPA does not use these endpoints by default**; the frontend remains mock-driven until `services/` are wired to `fetch` (using `VITE_API_BASE_URL` / `apiBase.ts`).

After changing `src/mock/data.ts`, the backend can refresh its bundled JSON via the script in `backend/README.md`.

---

## Current status (honest)

This repository is a **coherent UI prototype**: six clear steps, mock research and analysis stages, **valuation-first** reporting with **PDF export**, and clean reducer-driven workflow code. **Production concerns** (real data, persistence, auth, routing, backend parity with the valuation document model) are **out of scope** for the default path documented here.

---

## Key files for onboarding

| Topic | Location |
|-------|----------|
| Workflow orchestration | `src/App.tsx` |
| State machine | `src/state/appReducer.ts`, `src/types/app.ts` |
| Step order & labels | `src/state/constants.ts` |
| Mock datasets | `src/mock/data.ts` |
| Company / analysis APIs | `src/services/companyService.ts`, `analysisService.ts` |
| Valuation report + PDF | `src/services/reportService.ts`, `reportPdfFromReport.ts`, `reportPdfExport.ts` |
| Research → analysis document | `src/utils/buildAnalysisFromResearch.ts` (and related workspace helpers) |
| Screens | `src/screens/*.tsx` |

---

## Design reference

- **Colors:** Primary `#5B6CFF`, background `#0F1226`, card `#2A2940`, light text `#F5F6FA`.
- **Style:** Dark UI, soft purple accents, rounded cards. **Scope today:** company selection, single analyst, research + analysis workspaces, **valuation report** preview and **PDF export**—not chat, trading, portfolios, or accounts.
