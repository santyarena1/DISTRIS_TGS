import { Request, Response } from 'express';
import prisma from '../db';

export async function listNewBytesProductsHandler(req: Request, res: Response) {
  try {
    const { q, limit } = req.query;
    const take = Math.min(Number(limit) || 0, 20000);

    let where: any = {};

    if (q && String(q).trim() !== '') {
      const term = String(q).trim();

      where = {
        OR: [
          {
            detalle: {
              contains: term,
              // mode: 'insensitive'  // ❌ SACAMOS ESTO
            },
          },
          {
            categoria: {
              contains: term,
              // mode: 'insensitive'
            },
          },
          {
            marca: {
              contains: term,
              // mode: 'insensitive'
            },
          },
          {
            codigo: {
              contains: term,
              // mode: 'insensitive'
            },
          },
        ],
      };
    }

    const products = await prisma.newBytesProduct.findMany({
      where,
      take,
      orderBy: {
        codigo: 'asc',
      },
    });

    res.json(products);
  } catch (err) {
    console.error('Error listando productos NewBytes:', err);
    res.status(500).json({ error: 'Error obteniendo productos NewBytes' });
  }
}
