// src/controllers/grupoNucleoController.ts
import { Request, Response } from 'express';
import prisma from '../db';

export async function listGrupoNucleoProductsHandler(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit) || 50;
    const q = (req.query.q as string | undefined)?.trim();

    const where: any = {};

    if (q) {
      where.OR = [
        { item_desc_0: { contains: q, mode: 'insensitive' } },
        { item_desc_1: { contains: q, mode: 'insensitive' } },
        { item_desc_2: { contains: q, mode: 'insensitive' } },
        { marca: { contains: q, mode: 'insensitive' } },
        { codigo: { contains: q, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.grupoNucleoProduct.findMany({
      where,
      take: limit,
      orderBy: { codigo: 'asc' },
    });

    return res.json(products);
  } catch (err: any) {
    console.error('Error listando productos Grupo Núcleo:', err);
    return res
      .status(500)
      .json({ error: 'Error al listar productos de Grupo Núcleo' });
  }
}
