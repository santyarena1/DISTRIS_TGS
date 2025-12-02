// src/routes/authRoutes.ts
import { Router } from 'express';
import { loginHandler, meHandler } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// POST /auth/login
router.post('/login', loginHandler);

// GET /auth/me
router.get('/me', authMiddleware, meHandler);

export default router;
