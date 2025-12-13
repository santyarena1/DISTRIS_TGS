import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import prisma from './db';

export async function syncTgsFromFeed() {
  console.log('🔄 [TGS] Iniciando sincronización desde Feed XML...');
  const URL = 'https://thegamershop.com.ar/feed/stock_feed/';

  try {
    // 1. Descargar XML
    const { data: xmlData } = await axios.get(URL);
    
    // 2. Parsear a JSON
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonData = parser.parse(xmlData);

    // Ajustar según la estructura del XML de TGS (generalmente es <products><product>...)
    // Buscamos el array de productos. Puede variar, así que buscamos "root" o "products"
    let items = jsonData.products?.product || jsonData.rss?.channel?.item || [];
    
    if (!Array.isArray(items)) {
        // Si es un solo producto, el parser a veces devuelve objeto en vez de array
        items = [items];
    }

    console.log(`📦 [TGS] Feed descargado. Procesando ${items.length} items...`);

    let created = 0, updated = 0;

    // 3. Procesar y Guardar
    for (const item of items) {
      // Mapeo de campos (Ajustar si los nombres en el XML son distintos)
      // Ejemplo típico: <sku>, <description>, <price>, <stock>
      const sku = String(item.sku || item.id || item.code || '').trim();
      const nombre = String(item.description || item.name || item.title || '').trim();
      
      // Limpieza de precio (si viene con $ o comas)
      let precio = 0;
      if (typeof item.price === 'number') precio = item.price;
      else if (typeof item.price === 'string') {
         precio = parseFloat(item.price.replace('$', '').replace(',', ''));
      }

      // Stock
      const stock = parseInt(item.stock || item.quantity || '0');
      
      // Imagen (si viene)
      const imagen = item.image || item.image_link || null;

      if (sku && precio > 0) {
        // Upsert en la tabla TgsProduct (que debemos crear o reusar)
        // Como aun no creamos el modelo TgsProduct especifico en prisma, 
        // vamos a asumir que lo agregamos ahora en el schema.
        await prisma.tgsProduct.upsert({
            where: { sku },
            update: {
                nombre,
                precio,
                stock,
                imagen,
                updatedAt: new Date()
            },
            create: {
                sku,
                nombre,
                precio,
                stock,
                imagen
            }
        });
        
        // Contadores para feedback (lógica simplificada)
        updated++; 
      }
    }

    console.log(`✅ [TGS] Sincronización finalizada.`);
    
    // Guardar estadísticas para el panel
    const stats = JSON.stringify({ total: items.length, processed: created + updated });
    await prisma.distributorConfig.upsert({
        where: { distributor: 'tgs' },
        update: { syncStats: new Date(), syncStats: stats },
        create: { distributor: 'tgs', name: 'TGS', credentials: '{}', active: true, syncStats: stats }
    });

    return { success: true, count: items.length };

  } catch (error: any) {
    console.error('❌ [TGS] Error:', error.message);
    throw error;
  }
}