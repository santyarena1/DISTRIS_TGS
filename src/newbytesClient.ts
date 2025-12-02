import axios from 'axios';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Fetch the full price list from the New Bytes CSV endpoint.
 *
 * The New Bytes API exposes a CSV file containing the current price list.
 * A valid token must be provided via the NEWBYTES_TOKEN environment variable.
 *
 * @throws Error if the token is not defined or the request fails.
 * @returns A list of objects parsed from the CSV. Each row is represented as
 *          a record keyed by the CSV headers.
 */
export async function fetchNewBytesProducts(): Promise<Record<string, any>[]> {
  const token = process.env.NEWBYTES_TOKEN;
  if (!token) {
    throw new Error('NEWBYTES_TOKEN is not defined in environment');
  }

  // Base URL configurable por env, por defecto la oficial de NB.
  const baseUrl = process.env.NEWBYTES_BASE_URL ?? 'http://api.nb.com.ar';
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const url = `${normalizedBase}/v1/priceListCsv/${encodeURIComponent(token)}`;

  try {
    const response = await axios.get<string>(url, {
      responseType: 'text',
      timeout: 30_000,
    });

    // 👇 Acá está el cambio importante: indicamos delimitador ";"
    // y relajamos un poco las reglas de comillas / columnas.
    const records = parse(response.data, {
      columns: true,          // primera fila = headers
      skip_empty_lines: true,
      trim: true,
      delimiter: ';',         // <--- NB usa ; en lugar de ,
      bom: true,              // por si viene con BOM al principio
      relax_quotes: true,     // ignora comillas medio raras
      relax_column_count: true,
    });

    return records as Record<string, any>[];
  } catch (error: any) {
    console.error('New Bytes API error:', {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
    });

    const statusInfo = error?.response?.status ? `: HTTP ${error.response.status}` : '';
    throw new Error(`Failed to fetch New Bytes price list${statusInfo}`);
  }
}
