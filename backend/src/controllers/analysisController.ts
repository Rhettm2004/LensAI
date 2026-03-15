import type { Request, Response } from 'express';
import { runAnalysis } from '../services/analysisService.js';

export async function runAnalysisHandler(req: Request, res: Response): Promise<void> {
  const ticker = (req.body?.ticker as string) || '';
  if (!ticker.trim()) {
    res.status(400).json({ error: 'Missing ticker' });
    return;
  }
  const result = await runAnalysis(ticker.trim().toUpperCase());
  if (!result) {
    res.status(404).json({ error: 'No analysis available for ticker', ticker });
    return;
  }
  res.json(result);
}
