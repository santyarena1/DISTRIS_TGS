import prisma from './db';
import { fetchNewBytesProducts } from './newbytesClient';

export async function syncNewBytes() {
  const products = await fetchNewBytesProducts();

  let created = 0;
  let updated = 0;

  for (const item of products) {
    const codigo = item["CODIGO"]?.toString().trim();

    if (!codigo) {
      console.warn("Producto sin CODIGO, se salta:", item);
      continue;
    }

    const existing = await prisma.newBytesProduct.findFirst({
      where: { codigo }
    });

    if (existing) updated++;
    else created++;

    await prisma.newBytesProduct.upsert({
      where: { id: existing?.id ?? 0 },
      update: {
        codigo: item["CODIGO"],
        id_fabricante: item["ID FABRICANTE"],
        categoria: item["CATEGORIA"],
        detalle: item["DETALLE"],
        imagen: item["IMAGEN"],
        iva: item["IVA"],
        stock: item["STOCK"],
        garantia: item["GARANTIA"],
        moneda: item["MONEDA"],
        precio: item["PRECIO"],
        precio_final: item["PRECIO FINAL"],
        cotizacion_dolar: item["COTIZACION DOLAR"],
        precio_pesos_sin_iva: item["PRECIO PESOS SIN IVA"],
        precio_pesos_con_iva: item["PRECIO PESOS CON IVA"],
        atributos: item["ATRIBUTOS"],
        precio_usd_utilidad: item["PRECIO USD CON UTILIDAD"],
        precio_pesos_util: item["PRECIO PESOS CON UTILIDAD"],
        categoria_usuario: item["CATEGORIA_USUARIO"],
        utilidad: item["UTILIDAD"],
        detalle_usuario: item["DETALLE_USUARIO"],
        peso: item["PESO"],
        alto: item["ALTO"],
        ancho: item["ANCHO"],
        largo: item["LARGO"],
        impuesto_interno: item["IMPUESTO_INTERNO"],
        marca: item["MARCA"],
        raw_data: JSON.stringify(item)
      },
      create: {
        codigo: item["CODIGO"],
        id_fabricante: item["ID FABRICANTE"],
        categoria: item["CATEGORIA"],
        detalle: item["DETALLE"],
        imagen: item["IMAGEN"],
        iva: item["IVA"],
        stock: item["STOCK"],
        garantia: item["GARANTIA"],
        moneda: item["MONEDA"],
        precio: item["PRECIO"],
        precio_final: item["PRECIO FINAL"],
        cotizacion_dolar: item["COTIZACION DOLAR"],
        precio_pesos_sin_iva: item["PRECIO PESOS SIN IVA"],
        precio_pesos_con_iva: item["PRECIO PESOS CON IVA"],
        atributos: item["ATRIBUTOS"],
        precio_usd_utilidad: item["PRECIO USD CON UTILIDAD"],
        precio_pesos_util: item["PRECIO PESOS CON UTILIDAD"],
        categoria_usuario: item["CATEGORIA_USUARIO"],
        utilidad: item["UTILIDAD"],
        detalle_usuario: item["DETALLE_USUARIO"],
        peso: item["PESO"],
        alto: item["ALTO"],
        ancho: item["ANCHO"],
        largo: item["LARGO"],
        impuesto_interno: item["IMPUESTO_INTERNO"],
        marca: item["MARCA"],
        raw_data: JSON.stringify(item)
      }
    });
  }

  return {
    totalFetched: products.length,
    created,
    updated
  };
}
