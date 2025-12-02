import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Obtiene un token de acceso de la API de Grupo Núcleo. El token dura 15 min.
 */
export async function loginGrupoNucleo(): Promise<string> {
  const id = process.env.NUCLEO_ID;
  const username = process.env.NUCLEO_USERNAME;
  const password = process.env.NUCLEO_PASSWORD;

  if (!id || !username || !password) {
    throw new Error('NUCLEO_ID, NUCLEO_USERNAME o NUCLEO_PASSWORD no están definidos en el .env');
  }

  const url = 'https://api.gruponucleosa.com/Authentication/Login';
  try {
    const response = await axios.post(url, {
      id: Number(id),
      username,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
      timeout: 30_000,
    });

    // La API retorna el token como cadena plana en el body
    if (typeof response.data === 'string') {
      return response.data.trim();
    }
    if (response.data?.access_token) {
      return String(response.data.access_token);
    }
    throw new Error('Respuesta inesperada del login de Grupo Núcleo');
  } catch (error: any) {
    const status = error?.response?.status;
    const msg = status
      ? `Login falló con status ${status}`
      : 'No se pudo ejecutar el login';
    throw new Error(msg);
  }
}

/**
 * Obtiene el catálogo completo de productos (precio y stock) de Grupo Núcleo.
 */
export async function fetchGrupoNucleoProducts(): Promise<Record<string, any>[]> {
  const token = await loginGrupoNucleo();
  const url = 'https://api.gruponucleosa.com/API_V1/GetCatalog';
  try {
    const response = await axios.get(url, {
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      timeout: 60_000,
    });
    if (!Array.isArray(response.data)) {
      throw new Error('La respuesta de catálogo no es un array');
    }
    return response.data as Record<string, any>[];
  } catch (error: any) {
    const status = error?.response?.status;
    const msg = status
      ? `Error al obtener catálogo de Grupo Núcleo: HTTP ${status}`
      : 'Error al obtener catálogo de Grupo Núcleo';
    throw new Error(msg);
  }
}
