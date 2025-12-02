import { Router, Request, Response } from 'express';
import prisma from './db';
import { syncNewBytes } from './syncService';
import { syncGrupoNucleo } from './grupoNucleoSyncService';

const router = Router();

// Healthcheck
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Sincronizar New Bytes
router.post('/sync/newbytes', async (_req: Request, res: Response) => {
  try {
    const result = await syncNewBytes();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected error' });
  }
});

// Sincronizar Grupo Núcleo
router.post('/sync/gruponucleo', async (_req: Request, res: Response) => {
  try {
    const result = await syncGrupoNucleo();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected error' });
  }
});

// Listar productos de New Bytes
router.get('/newbytes-products', async (req: Request, res: Response) => {
  const { q, marca, categoria, page = '1', limit = '10' } = req.query;
  const where: any = {};
  if (q && typeof q === 'string') {
    where.OR = [
      { detalle: { contains: q, mode: 'insensitive' } },
      { detalle_usuario: { contains: q, mode: 'insensitive' } },
      { categoria: { contains: q, mode: 'insensitive' } },
      { marca: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (marca && typeof marca === 'string') {
    where.marca = { contains: marca, mode: 'insensitive' };
  }
  if (categoria && typeof categoria === 'string') {
    where.categoria = { contains: categoria, mode: 'insensitive' };
  }
  const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit as string, 10) || 10, 1);
  try {
    const products = await prisma.newBytesProduct.findMany({
      where,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: { id: 'asc' },
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected error' });
  }
});

// Obtener un producto de New Bytes por ID
router.get('/newbytes-products/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  try {
    const product = await prisma.newBytesProduct.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected error' });
  }
});

// Listar productos de Grupo Núcleo
router.get('/gruponucleo-products', async (req: Request, res: Response) => {
  const { q, marca, categoria, page = '1', limit = '10' } = req.query;
  const where: any = {};
  if (q && typeof q === 'string') {
    where.OR = [
      { item_desc_0: { contains: q, mode: 'insensitive' } },
      { item_desc_1: { contains: q, mode: 'insensitive' } },
      { item_desc_2: { contains: q, mode: 'insensitive' } },
      { categoria: { contains: q, mode: 'insensitive' } },
      { subcategoria: { contains: q, mode: 'insensitive' } },
      { marca: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (marca && typeof marca === 'string') {
    where.marca = { contains: marca, mode: 'insensitive' };
  }
  if (categoria && typeof categoria === 'string') {
    where.categoria = { contains: categoria, mode: 'insensitive' };
  }
  const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1);
  const limitNumber = Math.max(parseInt(limit as string, 10) || 10, 1);
  try {
    const products = await prisma.grupoNucleoProduct.findMany({
      where,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy: { id: 'asc' },
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected error' });
  }
});

// Obtener un producto de Grupo Núcleo por ID
router.get('/gruponucleo-products/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  try {
    const product = await prisma.grupoNucleoProduct.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected error' });
  }
});

export default router;
