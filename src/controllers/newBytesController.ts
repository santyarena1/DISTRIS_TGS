// src/controllers/newBytesController.ts
import { Request, Response } from 'express';
import prisma from '../db';

export async function listNewBytesProductsHandler(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit) || 50;
    const q = (req.query.q as string | undefined)?.trim();

    const where: any = {};

    if (q) {
      where.OR = [
        { detalle: { contains: q, mode: 'insensitive' } },
        { categoria: { contains: q, mode: 'insensitive' } },
        { marca: { contains: q, mode: 'insensitive' } },
        { codigo: { contains: q, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.newBytesProduct.findMany({
      where,
      take: limit,
      orderBy: { codigo: 'asc' },
    });

    return res.json(products);
  } catch (err: any) {
    console.error('Error listando productos NewBytes:', err);
    return res
      .status(500)
      .json({ error: 'Error al listar productos de NewBytes' });
  }
}
