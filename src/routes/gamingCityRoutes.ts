import { Router } from 'express';
import prisma from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await prisma.gamingCityProduct.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo productos Gaming City" });
  }
});

export default router;