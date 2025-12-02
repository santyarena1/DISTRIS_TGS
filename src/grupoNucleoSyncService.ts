// src/grupoNucleoSyncService.ts
import prisma from './db';
import { fetchGrupoNucleoRawList } from './grupoNucleoClient';

interface GrupoNucleoRawItem {
  [key: string]: any;
}

export async function syncGrupoNucleoCatalog() {
  const rawList: GrupoNucleoRawItem[] = await fetchGrupoNucleoRawList();

  let created = 0;
  let updated = 0;

  for (const raw of rawList) {
    const codigo = String(raw['CODIGO'] ?? raw['ItemCode'] ?? '').trim();
    if (!codigo) continue;

    const data = {
      codigo,
      item_desc_0: raw['ItemName'] ?? raw['ITEM_DESC_0'] ?? null,
      item_desc_1: raw['ITEM_DESC_1'] ?? null,
      item_desc_2: raw['ITEM_DESC_2'] ?? null,
      marca: raw['MARCA'] ?? raw['Brand'] ?? null,
      categoria: raw['CATEGORIA'] ?? null,
      stock: raw['STOCK'] ?? null,
      precio: raw['PRECIO'] ?? null,
      moneda: raw['MONEDA'] ?? null,
      raw_data: JSON.stringify(raw),
    };

    const existing = await prisma.grupoNucleoProduct.findUnique({
      where: { codigo },
    });

    await prisma.grupoNucleoProduct.upsert({
      where: { codigo },
      update: data,
      create: data,
    });

    if (existing) updated++;
    else created++;
  }

  return {
    total: created + updated,
    created,
    updated,
  };
}
