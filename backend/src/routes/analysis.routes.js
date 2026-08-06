import { Router } from 'express';
import { analyzeContent, getHistory, clearHistory } from '../controllers/analysis.controller.js';

const router = Router();

// POST   /api/analysis          -> analiza texto, link o imagen
// GET    /api/analysis/history  -> lista el historial guardado
// DELETE /api/analysis/history  -> borra el historial guardado
router.post('/', analyzeContent);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export default router;
