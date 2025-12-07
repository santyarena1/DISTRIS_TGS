import { Router } from 'express';
import authRoutes from './authroutes';
import userRoutes from './userRoutes';
import syncRoutes from './syncRoutes';
import newBytesRoutes from './newBytesRoutes';
import grupoNucleoRoutes from './grupoNucleoRoutes';
import searchRoutes from './searchRoutes';

const router = Router();

// Autenticación
router.use('/auth', authRoutes);

// ABM de usuarios (solo admin adentro)
router.use('/users', userRoutes);

// Sincronización de catálogos
router.use('/sync', syncRoutes);

// Listado de productos
router.use('/newbytes-products', newBytesRoutes);
router.use('/gruponucleo-products', grupoNucleoRoutes);

// Búsqueda global de productos
router.use('/search', searchRoutes);

export default router;
