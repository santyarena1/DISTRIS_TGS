import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from './db';

export async function scrapeGamingCity() {
  console.log('🔄 [Gaming City] Iniciando Scraping directo a Google Sheets...');
  
  // 🚨 CAMBIO CLAVE: Vamos directo a la fuente de datos (el iframe)
  const URL = 'https://docs.google.com/spreadsheets/d/1-dWrQTZtGeTYch1eY83_t7pxaCUG3K8YvtEdCfU4TL4/htmlembed?gid=0&widget=false&chrome=false';

  try {
    const { data: html } = await axios.get(URL);
    const $ = cheerio.load(html);
    
    const products: any[] = [];

    // Google Sheets publica tablas estándar. Buscamos las filas.
    $('tr').each((index, row) => {
      // Saltamos las primeras filas que suelen ser encabezados
      if (index < 2) return;

      const cols = $(row).find('td');
      
      // En la planilla, la estructura visual suele ser: 
      // Col 0 o 1: Nombre
      // Col 2 o 3: Precio
      // Vamos a ser flexibles y buscar texto + precio en la misma fila
      if (cols.length >= 2) {
        // Obtenemos el texto de todas las celdas para encontrar cual es cual
        const colA = $(cols[0]).text().trim(); // Posible nombre
        const colB = $(cols[1]).text().trim(); // Posible nombre o precio
        const colC = $(cols[2]).text().trim(); // Posible precio
        
        // Lógica de detección:
        // El nombre suele ser largo. El precio tiene formato de moneda.
        let nombre = '';
        let rawPrice = '';

        if (colB.includes('$') || /^\d/.test(colB)) {
            // Caso: Col 0 es Nombre, Col 1 es Precio
            nombre = colA;
            rawPrice = colB;
        } else if (colC.includes('$') || /^\d/.test(colC)) {
            // Caso: Col 1 es Nombre, Col 2 es Precio (común en Sheets con margen)
            nombre = colB;
            rawPrice = colC;
        } else {
            // Intento genérico: Primera celda con texto largo es nombre, siguiente con $ es precio
            nombre = colA || colB;
            // Buscamos el precio en las siguientes
            rawPrice = [colB, colC, $(cols[3]).text()].find(t => t && (t.includes('$') || /^\d+([.,]\d+)?$/.test(t.replace(/[.,]/g,'')))) || '';
        }

        // Limpieza de precio (Formato Argentino: 1.250,50 o 1250)
        // Eliminamos todo lo que no sea dígito o coma
        const cleanPriceStr = rawPrice.replace(/[^0-9,]/g, '').replace(',', '.');
        const precio = parseFloat(cleanPriceStr);

        // Validaciones estrictas para no guardar basura
        const isNameValid = nombre && nombre.length > 3 && !nombre.toLowerCase().includes('lista de precios');
        const isPriceValid = !isNaN(precio) && precio > 100; // Filtramos precios absurdos

        if (isNameValid && isPriceValid) {
          products.push({
            nombre,
            precio, // ARS Final
            categoria: 'Varios'
          });
        }
      }
    });

    console.log(`✅ [Gaming City] Encontrados ${products.length} productos.`);

    if (products.length === 0) {
        console.warn("⚠️ ALERTA: La planilla no devolvió datos legibles. Revisa el HTML si cambió.");
    }

    // --- GUARDADO EN BASE DE DATOS (Upsert por Nombre) ---
    let created = 0, updated = 0;
    
    for (const p of products) {
      const exists = await prisma.gamingCityProduct.findFirst({
        where: { nombre: p.nombre }
      });

      if (exists) {
        await prisma.gamingCityProduct.update({
          where: { id: exists.id },
          data: { precio: p.precio, updatedAt: new Date() }
        });
        updated++;
      } else {
        await prisma.gamingCityProduct.create({
          data: {
            nombre: p.nombre,
            precio: p.precio,
            categoria: p.categoria,
            stock: 100 
          }
        });
        created++;
      }
    }

    // Actualizar Stats
    try {
        const stats = JSON.stringify({ total: products.length, created, updated });
        await prisma.distributorConfig.upsert({
            where: { distributor: 'gamingcity' },
            update: { syncStats: stats },
            create: { 
                distributor: 'gamingcity', 
                name: 'Gaming City', 
                credentials: '{}', 
                active: true, 
                syncStats: stats 
            }
        });
    } catch (e) { console.warn("No se pudo actualizar stats"); }

    return { success: true, count: products.length, created, updated };

  } catch (error: any) {
    console.error('❌ [Gaming City] Error:', error.message);
    throw error;
  }
}