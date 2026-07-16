// Semilla de datos de ejemplo para probar el flujo end-to-end:
//   - 1 grupo con rol NOVIOS (para entrar al panel de accesos)
//   - 1 grupo invitado de ejemplo (Familia Curiel-Ramirez) con miembros
//
// Imprime los enlaces (?i=<token>) al final. Idempotente por 'family':
// si ya existe un grupo con esa etiqueta, no lo duplica.
//
//   npm run seed
import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import mysql from 'mysql2/promise'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

async function ensureGuest(conn, { family, roleId, allowPlusOne, seatsAdults, seatsChildren, members }) {
  const [existing] = await conn.query('SELECT id, token FROM guests WHERE family = ? LIMIT 1', [family])
  if (existing.length) return existing[0]

  const id = randomUUID()
  const token = randomUUID()
  await conn.query(
    `INSERT INTO guests (id, family, token, role_id, allow_plus_one, seats_adults, seats_children)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, family, token, roleId, allowPlusOne ? 1 : 0, seatsAdults, seatsChildren],
  )
  let order = 0
  for (const m of members || []) {
    await conn.query(
      `INSERT INTO guest_members (id, guest_id, name, editable_name, type, is_principal, allow_plus_one, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [randomUUID(), id, m.name || null, m.editable ? 1 : 0, m.type || 'adulto', m.principal ? 1 : 0, m.allowPlusOne ? 1 : 0, order++],
    )
  }
  return { id, token }
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: String(process.env.DB_SSL).toLowerCase() === 'true' ? { rejectUnauthorized: true } : undefined,
  })

  const novios = await ensureGuest(conn, {
    family: 'Alejandro & Carmen (novios)',
    roleId: 1,
    allowPlusOne: false,
    seatsAdults: 2,
    seatsChildren: 0,
    members: [
      { name: 'Alejandro', principal: true },
      { name: 'Carmen' },
    ],
  })

  const familia = await ensureGuest(conn, {
    family: 'Familia Curiel-Ramírez',
    roleId: 3,
    allowPlusOne: true,
    seatsAdults: 3,
    seatsChildren: 1,
    members: [
      { name: 'Norma Curiel', principal: true, allowPlusOne: true },
      { name: 'Roberto Ramírez' },
      { name: '', editable: true },
    ],
  })

  console.log('\n[seed] Enlaces de prueba:')
  console.log(`  NOVIOS   -> ${SITE}/?i=${novios.token}`)
  console.log(`  PANEL    -> ${SITE}/novios?token=${novios.token}`)
  console.log(`  INVITADO -> ${SITE}/?i=${familia.token}`)
  console.log('')

  await conn.end()
}

main().catch((err) => {
  console.error('[seed] Error:', err.message)
  process.exit(1)
})
