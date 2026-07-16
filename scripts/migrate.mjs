// Runner de migraciones SQL. Aplica en orden los archivos db/migrations/*.sql
// que aun no esten registrados en la tabla _migrations. Idempotente: se puede
// correr varias veces sin reaplicar.
//
//   npm run migrate           -> aplica las pendientes
//   npm run migrate:status    -> lista aplicadas / pendientes sin ejecutar
//
// Requiere las variables DB_* en .env (ver .env.example).
import 'dotenv/config'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '..', 'db', 'migrations')
const STATUS_ONLY = process.argv.includes('--status')

function requireEnv() {
  const missing = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter((k) => !process.env[k])
  if (missing.length) {
    console.error(`\n[migrate] Faltan variables de entorno: ${missing.join(', ')}`)
    console.error('[migrate] Copia .env.example a .env y complétalo.\n')
    process.exit(1)
  }
}

async function main() {
  requireEnv()

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: String(process.env.DB_SSL).toLowerCase() === 'true' ? { rejectUnauthorized: true } : undefined,
    multipleStatements: true,
  })

  await conn.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_migrations_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `)

  const [appliedRows] = await conn.query('SELECT filename FROM _migrations')
  const applied = new Set(appliedRows.map((r) => r.filename))

  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()

  if (STATUS_ONLY) {
    console.log('\n[migrate] Estado de migraciones:')
    for (const f of files) console.log(`  ${applied.has(f) ? '[x]' : '[ ]'} ${f}`)
    console.log('')
    await conn.end()
    return
  }

  const pending = files.filter((f) => !applied.has(f))
  if (!pending.length) {
    console.log('[migrate] Sin migraciones pendientes. La base ya está al día.')
    await conn.end()
    return
  }

  for (const f of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, f), 'utf8')
    process.stdout.write(`[migrate] Aplicando ${f} ... `)
    try {
      await conn.query(sql)
      await conn.query('INSERT INTO _migrations (filename) VALUES (?)', [f])
      console.log('ok')
    } catch (err) {
      console.log('FALLÓ')
      console.error(err.message)
      await conn.end()
      process.exit(1)
    }
  }

  console.log(`[migrate] Listo. ${pending.length} migración(es) aplicada(s).`)
  await conn.end()
}

main().catch((err) => {
  console.error('[migrate] Error:', err.message)
  process.exit(1)
})
