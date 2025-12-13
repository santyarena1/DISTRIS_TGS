import { Router } from 'express';
import prisma from '../db';

const router = Router();

// Ruta: /api/tgs-products
router.get('/tgs-products', async (req, res) => {
  try {
    // Buscamos todos los productos de la tabla TgsProduct
    const products = await prisma.tgsProduct.findMany();
    
    // Devolvemos el array JSON
    res.json(products);
  } catch (error) {
    console.error("Error obteniendo productos TGS:", error);
    res.status(500).json({ error: "Error interno al obtener catálogo TGS" });
  }
});

export default router;