import { Router } from 'express';
import { globalSearchHandler } from '../controllers/searchController';

// Router para endpoints de búsqueda global
const router = Router();

// GET /search/global
router.get('/global', globalSearchHandler);

export default router;
