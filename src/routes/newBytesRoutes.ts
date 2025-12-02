// src/routes/newBytesRoutes.ts
import { Router } from 'express';
import { listNewBytesProductsHandler } from '../controllers/newBytesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET /newbytes-products
router.get('/', authMiddleware, listNewBytesProductsHandler);

export default router;
