import { Request, Response } from 'express';
import prisma from '../db';

// OBTIENE LAS CONFIGURACIONES (Ocultando passwords reales)
export async function getDistributorConfigs(req: Request, res: Response) {
  try {
    const configs = await prisma.distributorConfig.findMany();
    
    // Sanitizamos para no devolver las passwords al front si no es necesario,
    // o las devolvemos enmascaradas. Para editar, necesitamos devolverlas
    // o manejarlo con cuidado. Por ahora devolvemos todo porque es panel Admin.
    const parsedConfigs = configs.map(c => ({
      ...c,
      credentials: JSON.parse(c.credentials)
    }));

    res.json(parsedConfigs);
  } catch (error) {
    console.error("Error obteniendo configs:", error);
    res.status(500).json({ error: "Error interno" });
  }
}

// GUARDA O ACTUALIZA UNA CONFIGURACIÓN
export async function saveDistributorConfig(req: Request, res: Response) {
  try {
    const { distributor, name, credentials, active } = req.body;

    if (!distributor || !credentials) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const updated = await prisma.distributorConfig.upsert({
      where: { distributor },
      update: {
        name,
        active,
        credentials: JSON.stringify(credentials), // Guardamos como string
      },
      create: {
        distributor,
        name: name || distributor,
        active: active ?? true,
        credentials: JSON.stringify(credentials),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error guardando config:", error);
    res.status(500).json({ error: "Error al guardar configuración" });
  }
}