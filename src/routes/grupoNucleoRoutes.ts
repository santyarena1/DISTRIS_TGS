// src/routes/grupoNucleoRoutes.ts
import { Router } from 'express';
import { listGrupoNucleoProductsHandler } from '../controllers/grupoNucleoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET /gruponucleo-products
router.get('/', authMiddleware, listGrupoNucleoProductsHandler);

export default router;
