import type { Request, Response } from 'express';
import { searchCompanies, getCompanyByTicker } from '../services/companyService.js';

export function listCompanies(req: Request, res: Response): void {
  const query = typeof req.query.query === 'string' ? req.query.query : '';
  const companies = searchCompanies(query);
  res.json(companies);
}

export function getCompany(req: Request, res: Response): void {
  const ticker = req.params.ticker;
  const company = getCompanyByTicker(ticker);
  if (!company) {
    res.status(404).json({ error: 'Company not found', ticker });
    return;
  }
  res.json(company);
}
