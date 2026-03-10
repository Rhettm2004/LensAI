import { Router } from 'express';
import { generateReportHandler } from '../controllers/reportController.js';

const router = Router();
router.post('/generate', generateReportHandler);

export default router;
