import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

const ELIT_URL = "https://clientes.elit.com.ar/v1/api/productos";

// ⚠️ Idealmente esto iría en variables de entorno (.env)
const ELIT_AUTH_BODY = {
  user_id: "28736",
  token: "plv92s1l2j",
};

// Helpers
function toNumber(val: any): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

function toBool(val: any): boolean | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "boolean") return val;
  if (val === 1 || val === "1" || val === "true" || val === "TRUE") return true;
  if (val === 0 || val === "0" || val === "false" || val === "FALSE") return false;
  return null;
}

function toDate(val: any): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Devuelve:
 *  - firstImage: primer URL útil
 *  - imagenesRaw / miniaturasRaw: string JSON para guardar todo
 */
function extractElitImages(p: any) {
  let imagenesArr: string[] = [];
  let miniaturasArr: string[] = [];

  if (Array.isArray(p.imagenes)) {
    imagenesArr = p.imagenes.filter((x: any) => typeof x === "string" && x.trim() !== "");
  } else if (typeof p.imagenes === "string" && p.imagenes.trim() !== "") {
    // por si en algún momento viene como string separado por ; o ,
    imagenesArr = p.imagenes
      .split(/[;,|]/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  if (Array.isArray(p.miniaturas)) {
    miniaturasArr = p.miniaturas.filter((x: any) => typeof x === "string" && x.trim() !== "");
  } else if (typeof p.miniaturas === "string" && p.miniaturas.trim() !== "") {
    miniaturasArr = p.miniaturas
      .split(/[;,|]/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  const firstImage = imagenesArr[0] || miniaturasArr[0] || null;

  return {
    firstImage,
    imagenesRaw: imagenesArr.length ? JSON.stringify(imagenesArr) : null,
    miniaturasRaw: miniaturasArr.length ? JSON.stringify(miniaturasArr) : null,
  };
}

/**
 * Descarga todos los productos de ELIT paginando:
 * - limit máximo 100
 * - offset ES 1-BASED → 1, 101, 201, ...
 */
async function syncElitWithDb() {
  const limit = 100;
  const maxTotal = 5000;

  let offset = 1; // ELIT no acepta 0
  let totalParsed = 0;
  let created = 0;
  let updated = 0;

  while (offset <= maxTotal) {
    const url = `${ELIT_URL}?limit=${limit}&offset=${offset}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(ELIT_AUTH_BODY),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Respuesta ELIT no OK:", res.status, text);
      throw new Error(`Error HTTP ${res.status} consultando ELIT: ${text}`);
    }

    const json: any = await res.json().catch((e) => {
      console.error("Error parseando JSON de ELIT:", e);
      return null;
    });

    // Log sólo de la primera página para ver formato
    if (offset === 1) {
      console.log("========== EJEMPLO RESPUESTA ELIT (página 1) ==========");
      console.log(JSON.stringify(json).slice(0, 10000));
      console.log("=====================================================");
    }

    // Detectar array de productos
    let productos: any[] = [];

    if (Array.isArray(json)) {
      productos = json;
    } else if (json && Array.isArray(json.resultado)) {
      // según el ejemplo que viste
      productos = json.resultado;
    } else if (json && Array.isArray(json.data)) {
      productos = json.data;
    } else if (json && Array.isArray(json.productos)) {
      productos = json.productos;
    } else if (json && json.data && Array.isArray(json.data.productos)) {
      productos = json.data.productos;
    } else if (json && typeof json === "object") {
      // último intento: primera propiedad que sea array
      for (const key of Object.keys(json)) {
        if (Array.isArray(json[key])) {
          productos = json[key];
          break;
        }
      }
    }

    if (!productos || productos.length === 0) {
      if (offset === 1) {
        console.warn(
          "No se encontró ningún array de productos en la respuesta de ELIT."
        );
      }
      break;
    }

    for (const p of productos) {
      const elitId = Number(p.id);
      if (!elitId) continue;

      const imgInfo = extractElitImages(p);

      const data = {
        elitId,
        codigoAlfa: p.codigo_alfa ?? null,
        codigoProducto: p.codigo_producto ?? null,
        nombre: String(p.nombre || "Sin nombre"),
        categoria: p.categoria ?? null,
        subCategoria: p.sub_categoria ?? null,
        marca: p.marca ?? null,
        precio: toNumber(p.precio) ?? undefined,
        impuestoInterno: toNumber(p.impuesto_interno) ?? undefined,
        iva: toNumber(p.iva) ?? undefined,
        moneda: toNumber(p.moneda) ?? undefined,
        markup: toNumber(p.markup) ?? undefined,
        cotizacion: toNumber(p.cotizacion) ?? undefined,
        pvpUsd: toNumber(p.pvp_usd) ?? undefined,
        pvpArs: toNumber(p.pvp_ars) ?? undefined,
        peso:
          p.peso !== undefined && p.peso !== null
            ? Number(p.peso)
            : undefined,
        // ean como string o null
        ean:
          p.ean !== undefined && p.ean !== null ? String(p.ean) : null,
        nivelStock: p.nivel_stock ?? null,
        stockTotal: toNumber(p.stock_total) ?? undefined,
        stockDepositoCliente:
          toNumber(p.stock_deposito_cliente) ?? undefined,
        stockDepositoCd: toNumber(p.stock_deposito_cd) ?? undefined,
        garantia: p.garantia ?? null,
        link: p.link ?? null,
        gamer: toBool(p.gamer) ?? undefined,
        creado: toDate(p.creado) ?? undefined,
        actualizado: toDate(p.actualizado) ?? undefined,

        // 🔽 imágenes
        imagenesRaw: imgInfo.imagenesRaw,
        miniaturasRaw: imgInfo.miniaturasRaw,
        imageUrl: imgInfo.firstImage,
      };

      const exists = await prisma.elitProduct.findUnique({
        where: { elitId },
        select: { id: true },
      });

      if (exists) {
        await prisma.elitProduct.update({
          where: { elitId },
          data,
        });
        updated++;
      } else {
        await prisma.elitProduct.create({ data });
        created++;
      }

      totalParsed++;
      if (totalParsed >= maxTotal) break;
    }

    if (productos.length < limit || totalParsed >= maxTotal) {
      break;
    }

    offset += limit; // 1, 101, 201, ...
  }

  return { totalParsed, created, updated };
}

// =============== RUTAS ===============

// POST /sync/elit
router.post(
  "/sync/elit",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const result = await syncElitWithDb();
      return res.json({
        ok: true,
        message: "Sincronización ELIT completada",
        ...result,
      });
    } catch (error: any) {
      console.error("ERROR ELIT:", error);
      return res.status(500).json({
        ok: false,
        error: "Error sincronizando ELIT",
        details: error?.message ?? "unknown error",
      });
    }
  }
);

// GET /elit-products?limit=50&q=texto
router.get(
  "/elit-products",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const limitQuery = Number(req.query.limit);
      const take = limitQuery > 0 ? limitQuery : 50;

      let where: any = undefined;

      if (q) {
        // sin "mode: 'insensitive'" porque tu provider no lo soporta
        where = {
          OR: [
            { nombre: { contains: q } },
            { marca: { contains: q } },
            { categoria: { contains: q } },
            { codigoProducto: { contains: q } },
            { codigoAlfa: { contains: q } },
          ],
        };
      }

      const productos = await prisma.elitProduct.findMany({
        where,
        take,
        orderBy: { nombre: "asc" },
      });

      return res.json(productos);
    } catch (error: any) {
      console.error("ERROR GET /elit-products:", error);
      return res.status(500).json({
        ok: false,
        error: "Error obteniendo productos ELIT",
        details: error?.message ?? "unknown error",
      });
    }
  }
);

export default router;
