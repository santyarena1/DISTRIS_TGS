// src/controllers/syncController.ts
import { Request, Response } from 'express';
import { syncNewBytesCatalog } from '../syncService';
import { syncGrupoNucleoCatalog } from '../grupoNucleoSyncService';

export async function syncNewBytesHandler(_req: Request, res: Response) {
  try {
    const result = await syncNewBytesCatalog();
    return res.json({
      message: 'Sincronización de NewBytes finalizada',
      ...result,
    });
  } catch (err: any) {
    console.error('Error al sincronizar NewBytes:', err);
    return res
      .status(500)
      .json({ error: 'Error al sincronizar catálogo de NewBytes' });
  }
}

export async function syncGrupoNucleoHandler(_req: Request, res: Response) {
  try {
    const result = await syncGrupoNucleoCatalog();
    return res.json({
      message: 'Sincronización de Grupo Núcleo finalizada',
      ...result,
    });
  } catch (err: any) {
    console.error('Error al sincronizar Grupo Núcleo:', err);
    return res
      .status(500)
      .json({ error: 'Error al sincronizar catálogo de Grupo Núcleo' });
  }
}
