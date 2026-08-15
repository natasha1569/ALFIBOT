import { Router } from 'express';
import { loginAdmin, loginAuditor } from '../controllers/privileged-auth.controller.js';

const router = Router();
router.post('/admin/login', loginAdmin);
router.post('/auditor/login', loginAuditor);
export default router;
