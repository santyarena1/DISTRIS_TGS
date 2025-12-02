// src/routes/userRoutes.ts
import { Router } from 'express';
import {
  listUsersHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from '../controllers/userController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Todas estas requieren admin
router.use(authMiddleware, requireAdmin);

router.get('/', listUsersHandler);
router.post('/', createUserHandler);
router.patch('/:id', updateUserHandler);
router.delete('/:id', deleteUserHandler);

export default router;
