import { Router } from 'express';
import { PERMISSIONS } from '../config/permissions.js';
import { requirePermission } from '../middlewares/authorization.middleware.js';
import { getFraudTrendReport } from '../controllers/reporting.controller.js';

const router = Router();
router.get('/fraud-trends', requirePermission(PERMISSIONS.REPORTING_READ), getFraudTrendReport);
export default router;
