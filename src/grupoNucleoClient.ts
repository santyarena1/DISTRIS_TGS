import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Realiza el login en la API de Grupo Núcleo y devuelve el token de acceso.
 * El `id` se envía si está definido en el entorno. Si es numérico se envía como número;
 * en cualquier otro caso se envía como cadena.
 */
export async function loginGrupoNucleo(): Promise<string> {
  const rawId = process.env.NUCLEO_ID;
  const username = process.env.NUCLEO_USERNAME?.trim();
  const password = process.env.NUCLEO_PASSWORD?.trim();

  if (!username || !password) {
    throw new Error('Debes definir NUCLEO_USERNAME y NUCLEO_PASSWORD en el entorno');
  }

  const body: any = { username, password };

  if (rawId) {
    const idNum = parseInt(rawId, 10);
    // Si la conversión no es numérica, envía el id como string.
    body.id = isNaN(idNum) ? rawId : idNum;
  }

  try {
    const response = await axios.post(
      'https://api.gruponucleosa.com/Authentication/Login',
      body,
      {
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      },
    );

    // La API puede devolver el token como string plano o como { access_token }
    if (typeof response.data === 'string') {
      return response.data.trim();
    }
    if (response.data?.access_token) {
      return String(response.data.access_token);
    }

    throw new Error('Formato de respuesta de login inesperado');
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // Errores de credenciales
      throw new Error('Credenciales inválidas para Grupo Núcleo (HTTP ' + status + ')');
    }
    throw new Error(
      `Fallo al hacer login de Grupo Núcleo${
        status ? `: HTTP ${status}` : ''
      }`,
    );
  }
}

/**
 * Obtiene el catálogo completo de productos con precio y stock.
 */
export async function fetchGrupoNucleoProducts(): Promise<Record<string, any>[]> {
  const token = await loginGrupoNucleo();
  try {
    const response = await axios.get('https://api.gruponucleosa.com/API_V1/GetCatalog', {
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      timeout: 60_000,
    });

    if (!Array.isArray(response.data)) {
      throw new Error('La respuesta del catálogo no es una lista');
    }
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    throw new Error(
      `Error al obtener catálogo de Grupo Núcleo${
        status ? `: HTTP ${status}` : ''
      }`,
    );
  }
}
