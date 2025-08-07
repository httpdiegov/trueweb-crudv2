
import mysql from 'mysql2/promise';
import type { Imagen } from '@/types';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.MYSQL_SSL_CA ? { ca: process.env.MYSQL_SSL_CA } : undefined, // Soporte básico para SSL si es necesario
});

// Helper function to parse imagen_urls string from DB into Imagen[] array
export function parseImagenUrls(
  imagenUrlsString: string | null | undefined,
  prendaId: number,
  categoria: string,
  nombrePrenda: string
): Imagen[] {
  if (!imagenUrlsString) return [];
  return imagenUrlsString.split(',').map((url, index) => ({
    id: index + 1, // Artificial ID for client-side use, DB might not store individual image IDs this way
    prenda_id: prendaId,
    url: url.trim(),
  }));
}

export async function query(sql: string, params?: any[], retries = 2, delay = 500): Promise<any> {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error: any) { // Explicitly type error as any to access properties like 'code'
    if ((error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') && retries > 0) {
      console.warn(
        `Database query failed with ${error.code}, retrying (${retries -1} retries left after ${delay/1000}s)... SQL: ${sql.substring(0,100)}...`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
      // For subsequent retries, slightly increase delay (simple exponential backoff)
      return query(sql, params, retries - 1, delay * 2);
    }
    console.error("Database query error:", error, `SQL: ${sql.substring(0,100)}...`);
    // Ensure the original error code is part of the thrown message if available
    const errorMessage = error.message || 'Unknown database error';
    const errorCode = error.code ? ` (Code: ${error.code})` : '';
    throw new Error(`Database query failed: ${errorMessage}${errorCode}`);
  }
}

// Test connection (optional, can be called once at startup)
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database.');
    connection.release();
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error);
  }
}

