import { Router } from 'express';
import { runAnalysisHandler } from '../controllers/analysisController.js';

const router = Router();
router.post('/run', runAnalysisHandler);

export default router;
