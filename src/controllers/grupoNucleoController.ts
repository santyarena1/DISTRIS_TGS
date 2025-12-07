// src/controllers/grupoNucleoController.ts
import { Request, Response } from "express";
import prisma from "../db";

export async function listGrupoNucleoProductsHandler(
  req: Request,
  res: Response
) {
  try {
    const qParam =
      typeof req.query.q === "string" ? req.query.q.trim() : "";
    const limitParam = Number(req.query.limit);
    const take =
      limitParam > 0 && limitParam <= 200 ? limitParam : 50;

    let where: any = undefined;

    if (qParam) {
      const term = qParam;

      where = {
        OR: [
          {
            item_desc_0: {
              contains: term,
              // OJO: tu provider NO soporta "mode"
              // mode: 'insensitive'
            },
          },
          {
            item_desc_1: {
              contains: term,
              // mode: 'insensitive'
            },
          },
          {
            item_desc_2: {
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

    const products = await prisma.grupoNucleoProduct.findMany({
      where,
      take,
      orderBy: {
        codigo: "asc",
      },
    });

    return res.json(products);
  } catch (err) {
    console.error("Error listando productos Grupo Núcleo:", err);
    return res
      .status(500)
      .json({ error: "Error obteniendo productos Grupo Núcleo" });
  }
}
