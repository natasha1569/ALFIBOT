import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { getCurrentUser, login, register } from '../controllers/auth.controller.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
export default router;
