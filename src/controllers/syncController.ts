import { Request, Response } from 'express';
import { 
  syncNewBytesCatalog, 
  syncGrupoNucleoCatalog,
  syncGamingCityCatalog,
  syncTgsCatalog // <--- IMPORTAR
} from '../syncService';

export async function syncNewBytesHandler(_req: Request, res: Response) {
  try {
    const result = await syncNewBytesCatalog();
    return res.json({ message: 'Sync NewBytes OK', ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function syncGrupoNucleoHandler(_req: Request, res: Response) {
  try {
    const result = await syncGrupoNucleoCatalog();
    return res.json({ message: 'Sync Grupo Núcleo OK', ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function syncGamingCityHandler(_req: Request, res: Response) {
  try {
    const result = await syncGamingCityCatalog();
    return res.json({ message: 'Sync Gaming City OK', ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

// ✅ NUEVO HANDLER PARA TGS
export async function syncTgsHandler(_req: Request, res: Response) {
  try {
    const result = await syncTgsCatalog();
    return res.json({ message: 'Sync TGS OK', ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}