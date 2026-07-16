// Módulo reutilizable de conexión a MySQL para scripts standalone.
//
// Uso como librería (desde otros scripts .mjs):
//
//   import { withConnection, run } from './db.mjs'
//
//   // 1) Una sola consulta rápida (abre y cierra conexión):
//   const rows = await run('SELECT * FROM guests WHERE family = ?', ['Curiel'])
//
//   // 2) Varias operaciones sobre la misma conexión (con o sin transacción):
//   await withConnection(async (conn) => {
//     await conn.query('INSERT INTO guests (...) VALUES (...)', [...])
//     await conn.query('UPDATE guests SET ... WHERE id = ?', [id])
//   }, { transaction: true })
//
// Uso como CLI (lanzar SQL a mano). Requiere las DB_* en .env (ver .env.example):
//
//   node scripts/db.mjs "SELECT COUNT(*) AS n FROM guests"
//   node scripts/db.mjs "SELECT * FROM guests WHERE family = ?" "Curiel-Ramirez"
//   node scripts/db.mjs --json "SELECT id, family FROM guests"
//   node scripts/db.mjs --file db/migrations/002_guests.sql   # ejecuta un .sql
//   echo "SELECT NOW()" | node scripts/db.mjs -               # SQL por stdin
//
// Las escrituras (INSERT/UPDATE/DELETE) informan filas afectadas / insertId.
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import mysql from 'mysql2/promise'

// --- Lectura y validación de las variables de entorno de la BD --------------

const REQUIRED = ['DB_HOST', 'DB_USER', 'DB_NAME']

export function dbConfig(extra = {}) {
  const missing = REQUIRED.filter((k) => !process.env[k])
  if (missing.length) {
    throw new Error(
      `Faltan variables de entorno: ${missing.join(', ')}. ` +
        'Copia .env.example a .env y complétalo.',
    )
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:
      String(process.env.DB_SSL).toLowerCase() === 'true'
        ? { rejectUnauthorized: true }
        : undefined,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    dateStrings: true,
    ...extra,
  }
}

// --- Helpers reutilizables --------------------------------------------------

// Abre una conexión, ejecuta `fn(conn)` y garantiza el cierre. Si
// `transaction: true`, envuelve la operación en BEGIN/COMMIT (ROLLBACK en error).
export async function withConnection(fn, { transaction = false, multipleStatements = false } = {}) {
  const conn = await mysql.createConnection(dbConfig({ multipleStatements }))
  try {
    if (transaction) await conn.beginTransaction()
    const result = await fn(conn)
    if (transaction) await conn.commit()
    return result
  } catch (err) {
    if (transaction) {
      try {
        await conn.rollback()
      } catch {}
    }
    throw err
  } finally {
    await conn.end()
  }
}

// Ejecuta una sola sentencia parametrizada y devuelve el resultado crudo de
// mysql2: filas (SELECT) o metadatos (INSERT/UPDATE/DELETE).
export async function run(sql, params = []) {
  return withConnection(async (conn) => {
    const [result] = await conn.execute(sql, params)
    return result
  })
}

// Igual que run() pero solo la primera fila (o null).
export async function runOne(sql, params = []) {
  const rows = await run(sql, params)
  return Array.isArray(rows) && rows.length ? rows[0] : null
}

// --- CLI --------------------------------------------------------------------

function readStdin() {
  return readFileSync(0, 'utf8')
}

async function cli(argv) {
  const args = [...argv]
  let asJson = false
  let fromFile = null

  const positional = []
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--json') asJson = true
    else if (a === '--file') fromFile = args[++i]
    else positional.push(a)
  }

  let sql
  if (fromFile) sql = readFileSync(fromFile, 'utf8')
  else if (positional[0] === '-') sql = readStdin()
  else sql = positional.shift()

  const params = fromFile || positional[0] === '-' ? [] : positional

  if (!sql || !sql.trim()) {
    console.error('Uso: node scripts/db.mjs "SQL" [param...]   |   --file archivo.sql   |   - (stdin)')
    process.exit(1)
  }

  // Un archivo .sql puede traer varias sentencias.
  const result = await withConnection(
    async (conn) => {
      const [res] = await conn.query(sql, params)
      return res
    },
    { multipleStatements: Boolean(fromFile) },
  )

  if (asJson) {
    console.log(JSON.stringify(result, null, 2))
  } else if (Array.isArray(result)) {
    if (result.length && typeof result[0] === 'object') console.table(result)
    else console.log(result)
    console.log(`\n${result.length} fila(s).`)
  } else {
    // INSERT / UPDATE / DELETE
    const { affectedRows, insertId, changedRows } = result
    console.log(
      `OK. filas afectadas: ${affectedRows}` +
        (insertId ? `, insertId: ${insertId}` : '') +
        (changedRows != null ? `, cambiadas: ${changedRows}` : ''),
    )
  }
}

// Ejecuta el CLI solo si se invoca directamente (no al importar como módulo).
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('db.mjs')) {
  cli(process.argv.slice(2)).catch((err) => {
    console.error('[db] Error:', err.message)
    process.exit(1)
  })
}
