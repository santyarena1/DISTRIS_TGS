// src/syncService.ts
import prisma from './db';
import { fetchNewBytesProducts } from './newbytesClient';

interface NewBytesRawItem {
  [key: string]: any;
}

/**
 * Sincroniza el catálogo de NewBytes con la BD local.
 * Usa:
 *  - findFirst({ where: { codigo } })
 *  - si existe -> update por id
 *  - si no existe -> create
 */
export async function syncNewBytesCatalog() {
  const rawList: NewBytesRawItem[] = await fetchNewBytesProducts();

  let created = 0;
  let updated = 0;

  for (const raw of rawList) {
    const codigo = String(raw['CODIGO'] ?? '').trim();
    if (!codigo) continue;

    const data = {
      codigo,
      id_fabricante: raw['ID FABRICANTE'] ?? null,
      categoria: raw['CATEGORIA'] ?? null,
      detalle: raw['DETALLE'] ?? null,
      imagen: raw['IMAGEN'] ?? null,
      iva: raw['IVA'] ?? null,
      stock: raw['STOCK'] ?? null,
      garantia: raw['GARANTIA'] ?? null,
      moneda: raw['MONEDA'] ?? null,
      precio: raw['PRECIO'] ?? null,
      precio_final: raw['PRECIO FINAL'] ?? null,
      cotizacion_dolar: raw['COTIZACION DOLAR'] ?? null,
      precio_pesos_sin_iva: raw['PRECIO PESOS SIN IVA'] ?? null,
      precio_pesos_con_iva: raw['PRECIO PESOS CON IVA'] ?? null,
      atributos: raw['ATRIBUTOS'] ?? null,
      // nombres corregidos según tu schema
      precio_usd_con_utilidad: raw['PRECIO USD CON UTILIDAD'] ?? null,
      precio_pesos_con_utilidad: raw['PRECIO PESOS CON UTILIDAD'] ?? null,
      categoria_usuario: raw['CATEGORIA_USUARIO'] ?? null,
      utilidad: raw['UTILIDAD'] ?? null,
      detalle_usuario: raw['DETALLE_USUARIO'] ?? null,
      peso: raw['PESO'] ?? null,
      alto: raw['ALTO'] ?? null,
      ancho: raw['ANCHO'] ?? null,
      largo: raw['LARGO'] ?? null,
      impuesto_interno: raw['IMPUESTO_INTERNO'] ?? null,
      marca: raw['MARCA'] ?? null,
      raw_data: JSON.stringify(raw),
    };

    // 🔹 Buscamos por código (NO es unique, así que usamos findFirst)
    const existing = await prisma.newBytesProduct.findFirst({
      where: { codigo },
      select: { id: true },
    });

    if (existing) {
      // 🔹 Si existe, actualizamos por id (que sí es unique)
      await prisma.newBytesProduct.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      // 🔹 Si no existe, creamos registro nuevo
      await prisma.newBytesProduct.create({
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
