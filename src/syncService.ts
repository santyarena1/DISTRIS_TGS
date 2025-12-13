import { loginAndScrapeNewBytes } from './newbytesClient';
import { loginAndScrapeGrupoNucleo } from './grupoNucleoClient';
import { scrapeGamingCity } from './gamingCityClient';
import { syncTgsFromFeed } from './tgsClient'; // <--- IMPORTANTE

export async function syncNewBytesCatalog() {
  try {
    console.log('🚀 Iniciando sync New Bytes...');
    return await loginAndScrapeNewBytes();
  } catch (error: any) {
    console.error('❌ Fallo en syncNewBytesCatalog:', error.message);
    throw error;
  }
}

export async function syncGrupoNucleoCatalog() {
  try {
    console.log('🚀 Iniciando sync Grupo Núcleo...');
    return await loginAndScrapeGrupoNucleo();
  } catch (error: any) {
    console.error('❌ Fallo en syncGrupoNucleoCatalog:', error.message);
    throw error;
  }
}

export async function syncGamingCityCatalog() {
  try {
    console.log('🚀 Iniciando sync Gaming City...');
    return await scrapeGamingCity();
  } catch (error: any) {
    console.error('❌ Fallo en syncGamingCityCatalog:', error.message);
    throw error;
  }
}

// ✅ NUEVA FUNCIÓN PARA TGS
export async function syncTgsCatalog() {
  try {
    console.log('🚀 Iniciando sync TGS (XML)...');
    return await syncTgsFromFeed();
  } catch (error: any) {
    console.error('❌ Fallo en syncTgsCatalog:', error.message);
    throw error;
  }
}