import { Request, Response } from 'express';
import prisma from '../db';

/**
 * Maneja la búsqueda global combinando productos de todos los proveedores.
 * Devuelve un arreglo de objetos normalizados con las claves:
 * - source: proveedor ("NEWBYTES" | "GRUPONUCLEO" | "TGS" | "ELIT")
 * - id: id interno
 * - title: título o nombre
 * - brand: marca (opcional)
 * - category: categoría (opcional)
 * - price: número con el precio si está disponible
 * - currency: moneda ("ARS" o "USD")
 * - imageUrl: URL de imagen (opcional)
 * - stockLabel: texto de stock o disponibilidad (opcional)
 * - iva: porcentaje de IVA (opcional)
 */
export async function globalSearchHandler(req: Request, res: Response) {
  try {
    const { q, limit } = req.query;
    const searchTerm = (q ?? '').toString().trim();
    const take = Math.min(Number(limit) || 50, 200);

    // Si no hay término de búsqueda, devolvemos array vacío
    if (!searchTerm) {
      return res.json([]);
    }

    const term = searchTerm;

    // Construimos criterios de búsqueda simples para cada proveedor
    const nbWhere: any = {
      OR: [
        { detalle: { contains: term } },
        { categoria: { contains: term } },
        { marca: { contains: term } },
        { codigo: { contains: term } },
      ],
    };
    const gnWhere: any = {
      OR: [
        { item_desc_0: { contains: term } },
        { item_desc_1: { contains: term } },
        { item_desc_2: { contains: term } },
        { categoria: { contains: term } },
        { marca: { contains: term } },
        { codigo: { contains: term } },
      ],
    };
    const tgsWhere: any = {
      OR: [
        { name: { contains: term } },
        { category: { contains: term } },
        { manufacturerSku: { contains: term } },
        { internalSku: { contains: term } },
      ],
    };
    const elitWhere: any = {
      OR: [
        { nombre: { contains: term } },
        { categoria: { contains: term } },
        { marca: { contains: term } },
        { codigoProducto: { contains: term } },
      ],
    };

    // Ejecutamos las consultas en paralelo
    const [nb, gn, tgs, elit] = await Promise.all([
      prisma.newBytesProduct.findMany({ where: nbWhere, take }),
      prisma.grupoNucleoProduct.findMany({ where: gnWhere, take }),
      prisma.tgsProduct.findMany({ where: tgsWhere, take }),
      prisma.elitProduct.findMany({ where: elitWhere, take }),
    ]);

    // Mapeamos a formato unificado
    const results: any[] = [];

    for (const p of nb) {
      results.push({
        source: 'NEWBYTES',
        id: p.id,
        title: p.detalle ?? p.codigo ?? null,
        brand: p.marca ?? null,
        category: p.categoria ?? null,
        price: p.precio
          ? parseFloat(p.precio)
          : p.precio_final
          ? parseFloat(p.precio_final)
          : null,
        currency: p.moneda ?? 'ARS',
        imageUrl: p.imagen ?? null,
        stockLabel: p.stock ?? null,
        iva: p.iva ? parseFloat(p.iva) : null,
      });
    }
    for (const p of gn) {
      results.push({
        source: 'GRUPONUCLEO',
        id: p.id,
        title: p.item_desc_0 ?? p.item_desc_1 ?? p.item_desc_2 ?? p.codigo,
        brand: p.marca ?? null,
        category: p.categoria ?? null,
        price: p.precio ? parseFloat(p.precio) : null,
        currency: p.moneda ?? 'ARS',
        imageUrl: (p as any).imageUrl ?? null,
        stockLabel: p.stock ?? null,
        iva: null,
      });
    }
    for (const p of tgs) {
      results.push({
        source: 'TGS',
        id: p.id,
        title: p.name,
        brand: p.manufacturerSku ?? null,
        category: p.category ?? null,
        price: p.price != null ? Number(p.price) : null,
        currency: p.currency ?? 'ARS',
        imageUrl: p.imageUrl ?? null,
        stockLabel: (p as any).status ?? null,
        iva: null,
      });
    }
    for (const p of elit) {
      results.push({
        source: 'ELIT',
        id: p.id,
        title: p.nombre,
        brand: p.marca ?? null,
        category: p.categoria ?? null,
        price:
          (p as any).pvpArs != null
            ? Number((p as any).pvpArs)
            : (p as any).pvpUsd != null
            ? Number((p as any).pvpUsd)
            : p.precio != null
            ? Number(p.precio)
            : null,
        currency:
          p.moneda && Number(p.moneda) === 2 ? 'USD' : 'ARS',
        imageUrl: (p as any).imageUrl ?? null,
        stockLabel: (p as any).nivelStock ?? null,
        iva: (p as any).iva != null ? Number((p as any).iva) : null,
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Error en búsqueda global:', err);
    res.status(500).json({ error: 'Error ejecutando búsqueda global' });
  }
}
