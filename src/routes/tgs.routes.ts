import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/authMiddleware";
import { XMLParser } from "fast-xml-parser";

const router = Router();
const prisma = new PrismaClient();

const TGS_FEED_URL = "https://thegamershop.com.ar/feed/stock_feed/";

function parsePrice(priceStr: string): number {
  return Number(
    priceStr
      .replace("ARS", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );
}

// =======================
// ✅ SYNC TGS
// =======================

router.post("/sync/tgs", authMiddleware, async (req: Request, res: Response) => {
  try {
    const response = await fetch(TGS_FEED_URL);
    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const json = parser.parse(xml);
    const items = json?.rss?.channel?.item || [];

    let created = 0;
    let updated = 0;

    for (const item of items) {
      const externalId = Number(item["g:id"]) || null;
      const name = String(item["g:title"] || "Sin nombre");
      const imageUrl = item["g:image_link"]
        ? String(item["g:image_link"])
        : null;
      const category = item["g:product_type"]
        ? String(item["g:product_type"])
        : null;
      const status = item["g:availability"]
        ? String(item["g:availability"])
        : null;

      const priceRaw = String(item["g:price"] || "0");
      const price = parsePrice(priceRaw);

      // 👉 ACA ESTÁ LA CLAVE DEL ERROR QUE TENÍAS
      const internalSku = String(item["g:mpn"] || "").trim();
      const stock = Number(item["g:stock_quantity"]) || 0;

      if (!internalSku) continue;

      const data = {
        externalId,
        name,
        imageUrl,
        category,
        status,
        price,
        currency: "ARS",
        internalSku,
        stock,
      };

      const exists = await prisma.tgsProduct.findUnique({
        where: { internalSku },
      });

      if (exists) {
        await prisma.tgsProduct.update({
          where: { internalSku },
          data,
        });
        updated++;
      } else {
        await prisma.tgsProduct.create({
          data,
        });
        created++;
      }
    }

    return res.json({
      ok: true,
      message: "Sincronización TGS completada",
      totalParsed: items.length,
      created,
      updated,
    });
  } catch (error: any) {
    console.error("ERROR TGS:", error);
    return res.status(500).json({
      ok: false,
      error: "Error sincronizando TGS",
    });
  }
});

// =======================
// ✅ LISTADO TGS
// =======================

router.get(
  "/tgs-products",
  authMiddleware,
  async (req: Request, res: Response) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const limit = Number(req.query.limit) || 50;

    const products = await prisma.tgsProduct.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { category: { contains: q } },
              { internalSku: { contains: q } },
            ],
          }
        : undefined,
      take: limit,
      orderBy: { name: "asc" },
    });

    return res.json(products);
  }
);

export default router;
