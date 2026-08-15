import { Router } from 'express';
import { PERMISSIONS } from '../config/permissions.js';
import { requirePermission } from '../middlewares/authorization.middleware.js';
import { listAnalysisDiagnostics, testDatabase } from '../controllers/diagnostics.controller.js';

const router = Router();
router.get('/test', requirePermission(PERMISSIONS.DATABASE_DIAGNOSTICS), testDatabase);
router.get('/analisis', requirePermission(PERMISSIONS.DATABASE_DIAGNOSTICS), listAnalysisDiagnostics);
export default router;
