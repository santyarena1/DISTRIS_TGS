import prisma from './db';
import { fetchNewBytesProducts } from './newbytesClient';

export async function syncNewBytes() {
  // Ajustá esta línea al método real que ya tenés
  const productosApi = await fetchNewBytesProducts();

  let created = 0;
  let updated = 0;

  for (const item of productosApi) {
    // Mapeo de campos desde la API de NB a tu modelo Prisma
    const data = {
      codigo: item.CODIGO,
      id_fabricante: item['ID FABRICANTE'] ?? null,
      categoria: item.CATEGORIA ?? null,
      detalle: item.DETALLE ?? null,
      imagen: item.IMAGEN ?? null,
      iva: item.IVA ?? null,
      stock: item.STOCK ?? null,
      garantia: item.GARANTIA ?? null,
      moneda: item.MONEDA ?? null,
      precio: item.PRECIO ?? null,
      precio_final: item['PRECIO FINAL'] ?? null,
      cotizacion_dolar: item['COTIZACION DOLAR'] ?? null,
      precio_pesos_sin_iva: item['PRECIO PESOS SIN IVA'] ?? null,
      precio_pesos_con_iva: item['PRECIO PESOS CON IVA'] ?? null,
      atributos: item.ATRIBUTOS ?? null,
      // 👇 nombres CORRECTOS segun el error que te tiró Prisma
      precio_usd_con_utilidad: item['PRECIO USD CON UTILIDAD'] ?? null,
      precio_pesos_con_utilidad: item['PRECIO PESOS CON UTILIDAD'] ?? null,
      categoria_usuario: item.CATEGORIA_USUARIO ?? null,
      utilidad: item.UTILIDAD ?? null,
      detalle_usuario: item.DETALLE_USUARIO ?? null,
      peso: item.PESO ?? null,
      alto: item.ALTO ?? null,
      ancho: item.ANCHO ?? null,
      largo: item.LARGO ?? null,
      impuesto_interno: item.IMPUESTO_INTERNO ?? null,
      marca: item.MARCA ?? null,
      raw_data: JSON.stringify(item),
    };

    // Buscamos si ya existe por código (ajustá si tenés otra unique)
    const existing = await prisma.newBytesProduct.findFirst({
      where: { codigo: data.codigo },
    });

    if (existing) {
      await prisma.newBytesProduct.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      await prisma.newBytesProduct.create({ data });
      created++;
    }
  }

  return { created, updated };
}