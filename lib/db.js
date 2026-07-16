// Pool de conexiones MySQL (mysql2/promise) compartido por las Route Handlers.
// Las credenciales llegan por variables de entorno (.env, ver .env.example).
// Next.js carga .env automaticamente en la app; los scripts standalone
// (scripts/*.mjs) cargan .env con dotenv.
import mysql from 'mysql2/promise'

let pool

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: String(process.env.DB_SSL).toLowerCase() === 'true' ? { rejectUnauthorized: true } : undefined,
      waitForConnections: true,
      connectionLimit: 5,
      charset: 'utf8mb4_unicode_ci',
      timezone: 'Z',
      dateStrings: true,
    })
  }
  return pool
}

// Helper de consulta parametrizada. Devuelve solo las filas.
export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params)
  return rows
}

// Devuelve la primera fila o null.
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows.length ? rows[0] : null
}
