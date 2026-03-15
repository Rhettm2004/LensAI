import express from 'express';
import cors from 'cors';
import companiesRouter from './routes/companies.js';
import analysisRouter from './routes/analysis.js';
import reportRouter from './routes/report.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'lensai-backend' });
});

app.use('/companies', companiesRouter);
app.use('/analysis', analysisRouter);
app.use('/report', reportRouter);

app.listen(PORT, () => {
  console.log(`LensAI backend http://localhost:${PORT}`);
  console.log('  GET  /companies?query=');
  console.log('  GET  /companies/:ticker');
  console.log('  POST /analysis/run  { "ticker": "MU" }');
  console.log('  POST /report/generate { "ticker", "analysis" }');
});
