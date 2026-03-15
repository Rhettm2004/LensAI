import type { Request, Response } from 'express';
import type { AnalysisOutput } from '../types/api.js';
import { generateOverviewReport } from '../services/reportService.js';

export async function generateReportHandler(req: Request, res: Response): Promise<void> {
  const ticker = (req.body?.ticker as string) || '';
  const analysis = req.body?.analysis as AnalysisOutput | undefined;
  if (!ticker.trim()) {
    res.status(400).json({ error: 'Missing ticker' });
    return;
  }
  if (!analysis || !analysis.kpiRows) {
    res.status(400).json({ error: 'Missing analysis payload (need analysis with kpiRows)' });
    return;
  }
  const result = await generateOverviewReport({ ticker: ticker.trim(), analysis });
  res.json(result);
}
