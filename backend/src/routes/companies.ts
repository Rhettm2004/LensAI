import { Router } from 'express';
import { listCompanies, getCompany } from '../controllers/companiesController.js';

const router = Router();
router.get('/', listCompanies);
router.get('/:ticker', getCompany);

export default router;
