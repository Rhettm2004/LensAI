# LensAI backend (minimal)

Express + TypeScript. Mock data from `src/data/analysisBundle.json` (synced from frontend mock via script).

## Run

```bash
cd backend
npm install
npm run dev
```

Default port **3001**. Override with `PORT=...`.

## Regenerate mock bundle

After changing `src/mock/data.ts` in the frontend:

```bash
cd backend && npx tsx scripts/export-analysis-bundle.ts
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/companies?query=` | Search by ticker/name (substring, case-insensitive) |
| GET | `/companies/:ticker` | Single company or 404 |
| POST | `/analysis/run` | Body `{ "ticker": "MU" }` → `CompanyAnalysisResponse` |
| POST | `/report/generate` | Body `{ "ticker", "analysis" }` → `OverviewReportResult` |

## Structure

- `routes/` — mount controllers
- `controllers/` — parse request, call service, set status
- `services/` — business logic (swap for DB/OpenAI later)
- `data/` — `analysisBundle.json` + loader
- `types/api.ts` — aligned with frontend `src/types`

 frontend still uses local services; switch by implementing `fetch` in `src/services/` when ready.
