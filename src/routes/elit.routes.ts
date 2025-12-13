import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

const ELIT_URL = "https://clientes.elit.com.ar/v1/api/productos";

// Helpers originales
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

function extractElitImages(p: any) {
  let imagenesArr: string[] = [];
  let miniaturasArr: string[] = [];

  if (Array.isArray(p.imagenes)) {
    imagenesArr = p.imagenes.filter((x: any) => typeof x === "string" && x.trim() !== "");
  } else if (typeof p.imagenes === "string" && p.imagenes.trim() !== "") {
    imagenesArr = p.imagenes.split(/[;,|]/).map((s: string) => s.trim()).filter(Boolean);
  }

  if (Array.isArray(p.miniaturas)) {
    miniaturasArr = p.miniaturas.filter((x: any) => typeof x === "string" && x.trim() !== "");
  } else if (typeof p.miniaturas === "string" && p.miniaturas.trim() !== "") {
    miniaturasArr = p.miniaturas.split(/[;,|]/).map((s: string) => s.trim()).filter(Boolean);
  }

  const firstImage = imagenesArr[0] || miniaturasArr[0] || null;

  return {
    firstImage,
    imagenesRaw: imagenesArr.length ? JSON.stringify(imagenesArr) : null,
    miniaturasRaw: miniaturasArr.length ? JSON.stringify(miniaturasArr) : null,
  };
}

/**
 * Descarga todos los productos de ELIT paginando.
 * AHORA LEE CREDENCIALES DE LA BD.
 */
async function syncElitWithDb() {
  // 1. OBTENER CREDENCIALES DE LA BD
  const config = await prisma.distributorConfig.findUnique({
    where: { distributor: 'elit' }
  });

  // Fallback por si no corriste el seed, pero idealmente debe venir de BD
  let authBody = { user_id: "28736", token: "plv92s1l2j" };

  if (config && config.active && config.credentials) {
    const creds = JSON.parse(config.credentials);
    if (creds.user_id && creds.token) {
      authBody = { user_id: creds.user_id, token: creds.token };
      console.log('✅ Usando credenciales de Elit desde base de datos.');
    }
  } else {
    console.warn('⚠️ Usando credenciales hardcodeadas de Elit (fallback).');
  }

  const limit = 100;
  const maxTotal = 5000;

  let offset = 1; 
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
      body: JSON.stringify(authBody), // Usamos las credenciales dinámicas
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

    if (offset === 1) {
      console.log("========== EJEMPLO RESPUESTA ELIT (página 1) ==========");
      console.log(JSON.stringify(json).slice(0, 500));
      console.log("=====================================================");
    }

    let productos: any[] = [];

    if (Array.isArray(json)) {
      productos = json;
    } else if (json && Array.isArray(json.resultado)) {
      productos = json.resultado;
    } else if (json && Array.isArray(json.data)) {
      productos = json.data;
    } else if (json && Array.isArray(json.productos)) {
      productos = json.productos;
    } else if (json && json.data && Array.isArray(json.data.productos)) {
      productos = json.data.productos;
    }

    if (!productos || productos.length === 0) break;

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
        peso: toNumber(p.peso) ?? undefined,
        ean: p.ean !== undefined && p.ean !== null ? String(p.ean) : null,
        nivelStock: p.nivel_stock ?? null,
        stockTotal: toNumber(p.stock_total) ?? undefined,
        stockDepositoCliente: toNumber(p.stock_deposito_cliente) ?? undefined,
        stockDepositoCd: toNumber(p.stock_deposito_cd) ?? undefined,
        garantia: p.garantia ?? null,
        link: p.link ?? null,
        gamer: toBool(p.gamer) ?? undefined,
        creado: toDate(p.creado) ?? undefined,
        actualizado: toDate(p.actualizado) ?? undefined,
        imagenesRaw: imgInfo.imagenesRaw,
        miniaturasRaw: imgInfo.miniaturasRaw,
        imageUrl: imgInfo.firstImage,
      };

      const exists = await prisma.elitProduct.findUnique({
        where: { elitId },
        select: { id: true },
      });

      if (exists) {
        await prisma.elitProduct.update({ where: { elitId }, data });
        updated++;
      } else {
        await prisma.elitProduct.create({ data });
        created++;
      }

      totalParsed++;
      if (totalParsed >= maxTotal) break;
    }

    if (productos.length < limit || totalParsed >= maxTotal) break;
    offset += limit;
  }

  return { totalParsed, created, updated };
}

// =============== RUTAS ===============

router.post("/sync/elit", authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await syncElitWithDb();
    return res.json({ ok: true, message: "Sincronización ELIT completada", ...result });
  } catch (error: any) {
    console.error("ERROR ELIT:", error);
    return res.status(500).json({ ok: false, error: "Error sincronizando ELIT", details: error?.message });
  }
});

router.get("/elit-products", authMiddleware, async (req: Request, res: Response) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const limitQuery = Number(req.query.limit);
    const take = limitQuery > 0 ? limitQuery : 50;

    let where: any = undefined;
    if (q) {
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

    const productos = await prisma.elitProduct.findMany({ where, take, orderBy: { nombre: "asc" } });
    return res.json(productos);
  } catch (error: any) {
    console.error("ERROR GET /elit-products:", error);
    return res.status(500).json({ ok: false, error: "Error obteniendo productos ELIT", details: error?.message });
  }
});

export default router;