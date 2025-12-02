import prisma from './db';
import { fetchGrupoNucleoProducts } from './grupoNucleoClient';

// Funciones de ayuda para convertir valores
function toStringOrNull(value: any): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str === '' ? null : str;
}
function toIntOrNull(value: any): number | null {
  if (value === undefined || value === null) return null;
  const num = parseInt(String(value), 10);
  return isNaN(num) ? null : num;
}
function toFloatOrNull(value: any): number | null {
  if (value === undefined || value === null) return null;
  const num = parseFloat(String(value));
  return isNaN(num) ? null : num;
}

/**
 * Normaliza un producto bruto de Grupo Núcleo al formato de la tabla Prisma.
 */
function mapGrupoNucleoItem(item: Record<string, any>) {
  return {
    item_id: toIntOrNull(item['item_id']) ?? 0,
    codigo: toStringOrNull(item['codigo']) ?? '',
    ean: toStringOrNull(item['ean']),
    partNumber: toStringOrNull(item['partNumber']),
    item_desc_0: toStringOrNull(item['item_desc_0']),
    item_desc_1: toStringOrNull(item['item_desc_1']),
    item_desc_2: toStringOrNull(item['item_desc_2']),
    marca: toStringOrNull(item['marca']),
    categoria: toStringOrNull(item['categoria']),
    subcategoria: toStringOrNull(item['subcategoria']),
    peso_gr: toIntOrNull(item['peso_gr']),
    alto_cm: toIntOrNull(item['alto_cm']),
    ancho_cm: toIntOrNull(item['ancho_cm']),
    largo_cm: toIntOrNull(item['largo_cm']),
    volumen_cm3: toIntOrNull(item['volumen_cm3']),
    precioNeto_USD: toFloatOrNull(item['precioNeto_USD']),
    impuestos: item['impuestos'] ? JSON.stringify(item['impuestos']) : null,
    stock_mdp: toIntOrNull(item['stock_mdp']),
    stock_caba: toIntOrNull(item['stock_caba']),
    url_imagenes: item['url_imagenes'] ? JSON.stringify(item['url_imagenes']) : null,
    raw_data: JSON.stringify(item),
  };
}

/**
 * Sincroniza todos los productos de Grupo Núcleo con la base de datos.
 * Devuelve un resumen con la cantidad total leída y cuántos se crearon/actualizaron.
 */
export async function syncGrupoNucleo() {
  const items = await fetchGrupoNucleoProducts();
  let created = 0;
  let updated = 0;

  for (const item of items) {
    const normalized = mapGrupoNucleoItem(item);
    if (!normalized.codigo) continue;

    const where = { codigo: normalized.codigo };
    const existing = await prisma.grupoNucleoProduct.findUnique({ where });
    if (existing) updated++; else created++;

    await prisma.grupoNucleoProduct.upsert({
      where,
      update: {
        item_id: normalized.item_id,
        ean: normalized.ean,
        partNumber: normalized.partNumber,
        item_desc_0: normalized.item_desc_0,
        item_desc_1: normalized.item_desc_1,
        item_desc_2: normalized.item_desc_2,
        marca: normalized.marca,
        categoria: normalized.categoria,
        subcategoria: normalized.subcategoria,
        peso_gr: normalized.peso_gr,
        alto_cm: normalized.alto_cm,
        ancho_cm: normalized.ancho_cm,
        largo_cm: normalized.largo_cm,
        volumen_cm3: normalized.volumen_cm3,
        precioNeto_USD: normalized.precioNeto_USD,
        impuestos: normalized.impuestos,
        stock_mdp: normalized.stock_mdp,
        stock_caba: normalized.stock_caba,
        url_imagenes: normalized.url_imagenes,
        raw_data: normalized.raw_data,
      },
      create: normalized,
    });
  }

  return {
    totalFetched: items.length,
    created,
    updated,
  };
}
