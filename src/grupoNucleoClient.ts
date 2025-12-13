import axios from 'axios';
import prisma from './db';

export async function loginAndScrapeGrupoNucleo() {
  console.log('🔄 [GrupoNucleo] Iniciando...');
  
  try {
    const config = await prisma.distributorConfig.findUnique({ where: { distributor: 'gruponucleo' } });
    if (!config || !config.active) throw new Error('Inactivo o no configurado.');

    const creds = JSON.parse(config.credentials);
    if (!creds.user || !creds.password) throw new Error('Faltan credenciales.');

    // 1. LOGIN
    console.log(`🔐 [GrupoNucleo] Login user: ${creds.user}`);
    const authRes = await axios.post('https://api.gruponucleosa.com/Authentication/Login', {
      username: creds.user,
      password: creds.password
    }).catch(e => { throw new Error(`Fallo Login: ${e.response?.status} ${e.response?.statusText}`); });

    let token = typeof authRes.data === 'string' ? authRes.data : authRes.data?.access_token;
    if (!token) throw new Error('No se recibió token.');

    // 2. DESCARGA
    console.log('📥 [GrupoNucleo] Descargando productos...');
    const prodRes = await axios.get('https://api.gruponucleosa.com/API_V1/GetCatalog', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 120000 // Aumentamos timeout a 2 min
    });

    const productos = Array.isArray(prodRes.data) ? prodRes.data : [];
    console.log(`📦 [GrupoNucleo] Recibidos: ${productos.length}`);

    // 3. GUARDADO
    let created = 0, updated = 0;
    
    for (const p of productos) {
      const codigo = String(p.Id || p.Sku || p.Codigo || '').trim();
      if(!codigo) continue;

      const data = {
        codigo,
        item_desc_0: p.Description || p.Descripcion || 'Sin Nombre',
        marca: p.Brand || p.Marca || 'Genérico',
        precio: String(p.Price || p.Precio || 0),
        stock: String(p.Quantity || p.Stock || 0),
        imagen: p.Image || p.Imagen || null,
        item_id: parseInt(String(p.Id || p.Sku || '0'), 10),
        raw_data: JSON.stringify(p),
        updatedAt: new Date()
      };

      const exists = await prisma.grupoNucleoProduct.findFirst({ where: { codigo } });
      if(exists) {
        await prisma.grupoNucleoProduct.update({ where: { id: exists.id }, data });
        updated++;
      } else {
        await prisma.grupoNucleoProduct.create({ data });
        created++;
      }
    }

    // 4. ACTUALIZAR ESTADÍSTICAS EN BD
    const stats = JSON.stringify({ total: productos.length, created, updated });
    await prisma.distributorConfig.update({
      where: { distributor: 'gruponucleo' },
      data: { syncStats: stats }
    });

    return { success: true, stats: { total: productos.length, created, updated } };

  } catch (error: any) {
    console.error('❌ [GrupoNucleo] Error Fatal:', error.message);
    // Relanzamos el error para que el frontend sepa que falló
    throw new Error(`Error Grupo Núcleo: ${error.message}`);
  }
}