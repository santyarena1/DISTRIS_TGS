// src/routes/syncRoutes.ts
import { Router } from 'express';
import {
  syncNewBytesHandler,
  syncGrupoNucleoHandler,
} from '../controllers/syncController';
import {
  authMiddleware,
  requireAdmin,
} from '../middleware/authMiddleware';

const router = Router();

// Todas requieren estar logueado y ser admin
router.use(authMiddleware, requireAdmin);

// POST /sync/newbytes
router.post('/newbytes', syncNewBytesHandler);

// POST /sync/gruponucleo
router.post('/gruponucleo', syncGrupoNucleoHandler);

export default router;
