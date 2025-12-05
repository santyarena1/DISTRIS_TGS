// src/grupoNucleoSyncService.ts
import prisma from './db';
import { fetchGrupoNucleoProducts } from './grupoNucleoClient';

interface GrupoNucleoRawItem {
  [key: string]: any;
}

export async function syncGrupoNucleoCatalog() {
  const rawResponse: any = await fetchGrupoNucleoProducts();

  let rawList: GrupoNucleoRawItem[] = [];

  if (Array.isArray(rawResponse)) {
    rawList = rawResponse;
  } else if (rawResponse) {
    rawList =
      rawResponse.items ||
      rawResponse.data ||
      rawResponse.productos ||
      rawResponse.Products ||
      rawResponse.Result ||
      [];
  }

  console.log('GN rawResponse tipo:', Array.isArray(rawResponse) ? 'array' : typeof rawResponse);
  console.log('GN cantidad de items a procesar:', rawList.length);
  if (rawList.length > 0) {
    console.log('GN ejemplo de item:', rawList[0]);
  }

  let created = 0;
  let updated = 0;

  for (const raw of rawList) {
    // ✅ TU JSON USA "codigo" en minúsculas
    const codigo = String(raw.codigo ?? '').trim();
    if (!codigo) continue;

    // ✅ ESTE CAMPO ERA OBLIGATORIO Y FALTABA
    const item_id = Number(raw.item_id);
    if (!item_id || isNaN(item_id)) continue;

    const data = {
      item_id, // ✅ CLAVE OBLIGATORIA EN TU SCHEMA
      codigo,
      item_desc_0: raw.item_desc_0 ?? null,
      item_desc_1: raw.item_desc_1 ?? null,
      item_desc_2: raw.item_desc_2 ?? null,
      marca: raw.marca ?? null,
      categoria: raw.categoria ?? null,
      stock: String(raw.stock_mdp ?? raw.stock_caba ?? ''),
      precio: raw.precioNeto_USD != null ? String(raw.precioNeto_USD) : null,
      moneda: 'USD',
      raw_data: JSON.stringify(raw),
    };

    // 🔍 Buscamos por codigo (NO es unique)
    const existing = await prisma.grupoNucleoProduct.findFirst({
      where: { codigo },
      select: { id: true },
    });

    if (existing) {
      // ✅ UPDATE por ID
      await prisma.grupoNucleoProduct.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      // ✅ CREATE con item_id incluido
      await prisma.grupoNucleoProduct.create({
        data,
      });
      created++;
    }
  }

  return {
    total: created + updated,
    created,
    updated,
  };
}
