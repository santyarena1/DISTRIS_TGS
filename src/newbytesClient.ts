import axios from 'axios';
import { parse } from 'csv-parse/sync';
import prisma from './db';

export async function loginAndScrapeNewBytes() {
  console.log('🔄 Iniciando sincronización de New Bytes...');

  try {
    // 1. LEER CREDENCIALES DE BD
    const config = await prisma.distributorConfig.findUnique({
      where: { distributor: 'newbytes' }
    });

    if (!config || !config.active) throw new Error('New Bytes inactivo o no configurado.');
    
    const creds = JSON.parse(config.credentials);
    if (!creds.token) throw new Error('Falta el Token de New Bytes en la configuración.');

    const token = creds.token;
    const baseUrl = creds.baseUrl || 'http://api.nb.com.ar';
    const url = `${baseUrl.replace(/\/+$/, '')}/v1/priceListCsv/${encodeURIComponent(token)}`;

    // 2. DESCARGAR CSV
    console.log('📥 Descargando CSV con Token...');
    const response = await axios.get(url, { responseType: 'text', timeout: 30000 });

    // 3. PARSEAR
    const records = parse(response.data, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',
      bom: true,
      relax_quotes: true,
      relax_column_count: true,
    });

    console.log(`✅ ${records.length} productos leídos del CSV.`);

    let created = 0;
    let updated = 0;

    // 4. GUARDAR (Upsert con TODOS tus campos originales)
    for (const row of records) {
      const codigo = String(row['CODIGO'] ?? '').trim();
      if (!codigo) continue;

      const data = {
        codigo,
        id_fabricante: row['ID FABRICANTE'] ?? null,
        categoria: row['CATEGORIA'] ?? null,
        detalle: row['DETALLE'] ?? null,
        imagen: row['IMAGEN'] ?? null,
        iva: row['IVA'] ?? null,
        stock: row['STOCK'] ?? null,
        garantia: row['GARANTIA'] ?? null,
        moneda: row['MONEDA'] ?? null,
        precio: row['PRECIO'] ?? null,
        precio_final: row['PRECIO FINAL'] ?? null,
        cotizacion_dolar: row['COTIZACION DOLAR'] ?? null,
        precio_pesos_sin_iva: row['PRECIO PESOS SIN IVA'] ?? null,
        precio_pesos_con_iva: row['PRECIO PESOS CON IVA'] ?? null,
        atributos: row['ATRIBUTOS'] ?? null,
        precio_usd_con_utilidad: row['PRECIO USD CON UTILIDAD'] ?? null,
        precio_pesos_con_utilidad: row['PRECIO PESOS CON UTILIDAD'] ?? null,
        categoria_usuario: row['CATEGORIA_USUARIO'] ?? null,
        utilidad: row['UTILIDAD'] ?? null,
        detalle_usuario: row['DETALLE_USUARIO'] ?? null,
        peso: row['PESO'] ?? null,
        alto: row['ALTO'] ?? null,
        ancho: row['ANCHO'] ?? null,
        largo: row['LARGO'] ?? null,
        impuesto_interno: row['IMPUESTO_INTERNO'] ?? null,
        marca: row['MARCA'] ?? null,
        raw_data: JSON.stringify(row),
        updatedAt: new Date() // Actualizamos timestamp
      };

      const existing = await prisma.newBytesProduct.findFirst({
        where: { codigo },
        select: { id: true },
      });

      if (existing) {
        await prisma.newBytesProduct.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.newBytesProduct.create({ data });
        created++;
      }
    }

    console.log(`💾 New Bytes completado: ${created} creados, ${updated} actualizados.`);
    return { success: true, count: records.length, created, updated };

  } catch (error: any) {
    console.error('❌ Error NewBytes:', error.message);
    throw error;
  }
}