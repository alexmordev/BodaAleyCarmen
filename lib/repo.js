// Acceso a datos del RSVP. Consultas parametrizadas sobre el pool de lib/db.js.
import { randomUUID } from 'node:crypto'
import { getPool, query, queryOne } from './db.js'

// --- Utilidades de request -------------------------------------------------

export function clientIp(req) {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0].trim().slice(0, 45)
  return (req.headers.get('x-real-ip') || '').slice(0, 45) || null
}

export function userAgent(req) {
  return (req.headers.get('user-agent') || '').slice(0, 512) || null
}

// --- Politica de RSVP por rol ----------------------------------------------

// Roles que NO confirman asistencia: no ven el formulario ni cuentan en las
// estadisticas del evento. Cualquier otro rol confirma por defecto (invitado y,
// si se anadiera, padrinos/damas de honor). Fuente de verdad unica de "quien
// confirma": no reintroducir filtros por role_id sueltos, usar este helper.
const NON_RSVP_ROLES = new Set(['novios', 'proveedor'])

export function rsvpRequiredForRole(role) {
  return !NON_RSVP_ROLES.has(role)
}

// --- Resolucion de token ---------------------------------------------------

// Devuelve el grupo (guest) + rol por token, o null si no existe.
export async function findGuestByToken(token) {
  if (!token || typeof token !== 'string') return null
  return queryOne(
    `SELECT g.*, r.name AS role
       FROM guests g
       JOIN roles r ON r.id = g.role_id
      WHERE g.token = ?
      LIMIT 1`,
    [token],
  )
}

export async function membersOf(guestId) {
  return query(
    `SELECT id, name, editable_name, type, is_principal, allow_plus_one,
            attending, diet, plus_one_name, plus_one_attending, plus_one_diet
       FROM guest_members
      WHERE guest_id = ?
      ORDER BY is_principal DESC, sort_order ASC, created_at ASC`,
    [guestId],
  )
}

// Forma que consume el frontend (window.__PARTY__).
export function toPartyPayload(guest, members) {
  return {
    id: guest.id,
    family: guest.family,
    role: guest.role,
    rsvpRequired: rsvpRequiredForRole(guest.role),
    allowPlusOne: !!guest.allow_plus_one,
    confirmed: !!guest.confirmed,
    seats: { adults: guest.seats_adults, children: guest.seats_children },
    guests: members.map((m) => ({
      id: m.id,
      name: m.name || '',
      principal: !!m.is_principal,
      editable: !!m.editable_name,
      type: m.type,
      attending: m.attending == null ? null : !!m.attending,
      diet: m.diet || '',
    })),
  }
}

// --- Log de accesos --------------------------------------------------------

export async function logAccess({ guestId = null, tokenTried = null, success = false, ip = null, ua = null }) {
  await query(
    `INSERT INTO access_logs (guest_id, token_tried, success, ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [guestId, tokenTried ? String(tokenTried).slice(0, 64) : null, success ? 1 : 0, ip, ua],
  )
}

export async function markOpened(guestId) {
  await query('UPDATE guests SET opened_at = COALESCE(opened_at, NOW()) WHERE id = ?', [guestId])
}

// --- Validacion de aforo ---------------------------------------------------

// Cuenta cuantos adultos y menores confirma una respuesta. El +1 cuenta como
// adulto y solo si el grupo lo tiene habilitado.
export function countSeats(guest, members, { responses = [], plus = null }) {
  const byId = new Map(members.map((m) => [m.id, m]))
  let adults = 0
  let children = 0
  for (const r of responses) {
    const m = byId.get(r.memberId)
    if (!m || !r.attending) continue
    if (m.type === 'menor') children++
    else adults++
  }
  if (guest.allow_plus_one && plus && plus.enabled && plus.name) adults++
  return { adults, children }
}

// Valida que la respuesta no exceda los lugares reservados del grupo.
// Un limite en 0 se interpreta como "sin limite declarado" y NO se aplica: los
// grupos dados de alta antes de la Fase 5 tienen seats_adults/seats_children en
// 0 y bloquearlos dejaria a esas familias sin poder confirmar.
export function checkCapacity(guest, members, payload) {
  const { adults, children } = countSeats(guest, members, payload)
  const maxAdults = guest.seats_adults | 0
  const maxChildren = guest.seats_children | 0

  if (maxAdults > 0 && adults > maxAdults) {
    return {
      ok: false,
      error: `Tu invitación tiene ${maxAdults} ${maxAdults === 1 ? 'lugar' : 'lugares'} para adultos y estás confirmando ${adults}.`,
      adults, children, maxAdults, maxChildren,
    }
  }
  if (maxChildren > 0 && children > maxChildren) {
    return {
      ok: false,
      error: `Tu invitación tiene ${maxChildren} ${maxChildren === 1 ? 'lugar' : 'lugares'} para menores y estás confirmando ${children}.`,
      adults, children, maxAdults, maxChildren,
    }
  }
  return { ok: true, adults, children, maxAdults, maxChildren }
}

// --- Persistencia del RSVP -------------------------------------------------

// responses: [{ memberId, attending: bool, name?: string, diet?: string }]
// plus:      { enabled, name, diet }  (se guarda en el miembro principal)
// Lanza un Error con code='AFORO' si la respuesta excede los lugares del grupo.
export async function persistRsvp(guest, { responses = [], plus = null }, meta = {}) {
  // Roles exentos (novios/proveedor) no confirman. El front ya oculta el
  // formulario, pero no confiamos solo en el cliente.
  if (!rsvpRequiredForRole(guest.role)) {
    const err = new Error('Este acceso no requiere confirmación')
    err.code = 'NO_RSVP'
    throw err
  }

  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const members = await membersOf(guest.id)

    // Aforo: se valida antes de escribir nada, para no dejar el grupo a medias.
    const cap = checkCapacity(guest, members, { responses, plus })
    if (!cap.ok) {
      const err = new Error(cap.error)
      err.code = 'AFORO'
      throw err
    }

    const byId = new Map(members.map((m) => [m.id, m]))
    let going = 0
    let notGoing = 0

    for (const r of responses) {
      const m = byId.get(r.memberId)
      if (!m) continue
      const attending = r.attending ? 1 : 0
      if (attending) going++
      else notGoing++
      const name = m.editable_name ? (r.name || '').slice(0, 255) : m.name
      await conn.execute(
        `UPDATE guest_members
            SET attending = ?, diet = ?, name = COALESCE(?, name)
          WHERE id = ? AND guest_id = ?`,
        [attending, r.diet ? String(r.diet).slice(0, 255) : null, name, m.id, guest.id],
      )
    }

    // El +1 se cuelga del miembro principal.
    const principal = members.find((m) => m.is_principal) || members[0]
    if (principal && plus && guest.allow_plus_one) {
      if (plus.enabled && plus.name) {
        going++
        await conn.execute(
          `UPDATE guest_members
              SET plus_one_name = ?, plus_one_attending = 1, plus_one_diet = ?
            WHERE id = ?`,
          [String(plus.name).slice(0, 255), plus.diet ? String(plus.diet).slice(0, 255) : null, principal.id],
        )
      } else {
        await conn.execute(
          `UPDATE guest_members
              SET plus_one_name = NULL, plus_one_attending = NULL, plus_one_diet = NULL
            WHERE id = ?`,
          [principal.id],
        )
      }
    }

    await conn.execute(
      'UPDATE guests SET confirmed = 1, confirmed_at = NOW() WHERE id = ?',
      [guest.id],
    )

    await conn.execute(
      `INSERT INTO rsvp_submissions (guest_id, payload, going_count, not_going_count, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [guest.id, JSON.stringify({ responses, plus }), going, notGoing, meta.ip || null, meta.ua || null],
    )

    await conn.commit()
    return { going, notGoing }
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

// --- Panel de novios -------------------------------------------------------

// Resumen de accesos por grupo: quien entro, primera/ultima vez, cuantas veces.
export async function accessSummary() {
  return query(
    `SELECT g.id, g.family, r.name AS role, g.confirmed,
            COUNT(a.id)            AS visitas,
            MIN(a.created_at)      AS primer_ingreso,
            MAX(a.created_at)      AS ultimo_ingreso
       FROM guests g
       JOIN roles r ON r.id = g.role_id
       LEFT JOIN access_logs a ON a.guest_id = g.id AND a.success = 1
      GROUP BY g.id, g.family, r.name, g.confirmed
      ORDER BY (MAX(a.created_at) IS NULL), MAX(a.created_at) DESC`,
  )
}

export async function recentAccess(limit = 100) {
  const n = Math.min(500, Math.max(1, Number(limit) || 100))
  return query(
    `SELECT a.id, a.created_at, a.success, a.ip, a.token_tried, g.family
       FROM access_logs a
       LEFT JOIN guests g ON g.id = a.guest_id
      ORDER BY a.created_at DESC
      LIMIT ${n}`,
  )
}

// Conteo de confirmaciones a nivel persona (incluye +1). Solo cuentan los roles
// que confirman: se excluyen novios (1) y proveedor (2). Usar el mismo criterio
// en las tres consultas para que un futuro rol invitado cuente sin tocar SQL.
export async function rsvpStats() {
  const groups = await queryOne(
    `SELECT
        COUNT(*)                                   AS grupos,
        SUM(confirmed = 1)                         AS grupos_confirmados
       FROM guests WHERE role_id NOT IN (1, 2)`,
  )
  const people = await queryOne(
    // Se excluyen los miembros sin nombre: son plazas editables vacias (huecos a
    // rellenar por el invitado), no personas reales; no deben contar como "sin
    // responder" ni en ningun otro cubo.
    `SELECT
        SUM(attending = 1)                         AS asisten,
        SUM(attending = 0)                         AS no_asisten,
        SUM(attending IS NULL)                     AS sin_responder,
        SUM(plus_one_attending = 1)                AS acompanantes
       FROM guest_members m
       JOIN guests g ON g.id = m.guest_id
      WHERE g.role_id NOT IN (1, 2)
        AND m.name IS NOT NULL AND m.name <> ''`,
  )
  const diets = await query(
    `SELECT diet, COUNT(*) AS n
       FROM guest_members m
       JOIN guests g ON g.id = m.guest_id
      WHERE m.attending = 1 AND m.diet IS NOT NULL AND m.diet <> ''
        AND g.role_id NOT IN (1, 2)
      GROUP BY diet ORDER BY n DESC`,
  )
  return { groups, people, diets }
}

// Resumen por familia/persona para el panel.
export async function guestsWithMembers() {
  const guests = await query(
    `SELECT g.id, g.family, g.token, r.name AS role, g.allow_plus_one,
            g.confirmed, g.seats_adults, g.seats_children, g.opened_at, g.confirmed_at
       FROM guests g JOIN roles r ON r.id = g.role_id
      ORDER BY r.id, g.family`,
  )
  const members = await query(
    `SELECT id, guest_id, name, type, is_principal, attending, diet, table_id,
            plus_one_name, plus_one_attending, plus_one_diet
       FROM guest_members ORDER BY is_principal DESC, sort_order ASC`,
  )
  const byGuest = new Map()
  for (const m of members) {
    if (!byGuest.has(m.guest_id)) byGuest.set(m.guest_id, [])
    byGuest.get(m.guest_id).push(m)
  }
  return guests.map((g) => ({ ...g, members: byGuest.get(g.id) || [] }))
}

// --- Alta de invitados / generacion de tokens ------------------------------

export async function createGuest({ family, role = 'invitado', allowPlusOne = false, seatsAdults = 0, seatsChildren = 0, members = [] }) {
  const roleRow = await queryOne('SELECT id FROM roles WHERE name = ? LIMIT 1', [role])
  const roleId = roleRow ? roleRow.id : 3
  const id = randomUUID()
  const token = randomUUID()

  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.execute(
      `INSERT INTO guests (id, family, token, role_id, allow_plus_one, seats_adults, seats_children)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, String(family).slice(0, 255), token, roleId, allowPlusOne ? 1 : 0, seatsAdults | 0, seatsChildren | 0],
    )
    let order = 0
    for (const m of members) {
      await conn.execute(
        `INSERT INTO guest_members (id, guest_id, name, editable_name, type, is_principal, allow_plus_one, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(), id,
          m.name ? String(m.name).slice(0, 255) : null,
          m.editable ? 1 : 0,
          m.type === 'menor' ? 'menor' : 'adulto',
          m.principal ? 1 : 0,
          m.allowPlusOne ? 1 : 0,
          order++,
        ],
      )
    }
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
  return { id, token }
}

// --- Mesas (seating) -------------------------------------------------------

// Lista de mesas con el conteo de personas ya sentadas en cada una.
export async function listTables() {
  return query(
    `SELECT t.id, t.name, t.seats, t.sort_order,
            COUNT(m.id) AS seated
       FROM tables t
       LEFT JOIN guest_members m ON m.table_id = t.id
      GROUP BY t.id, t.name, t.seats, t.sort_order
      ORDER BY t.sort_order ASC, t.created_at ASC`,
  )
}

export async function createTable({ name, seats = 10 } = {}) {
  const id = randomUUID()
  const row = await queryOne('SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM tables')
  const order = row ? row.n : 1
  const label = (name && String(name).trim()) || `Mesa ${order}`
  await query(
    'INSERT INTO tables (id, name, seats, sort_order) VALUES (?, ?, ?, ?)',
    [id, label.slice(0, 120), Math.max(1, seats | 0) || 10, order],
  )
  return { id, name: label, seats: Math.max(1, seats | 0) || 10, sort_order: order, seated: 0 }
}

export async function deleteTable(id) {
  // Los miembros sentados quedan libres por el ON DELETE SET NULL de la FK.
  await query('DELETE FROM tables WHERE id = ?', [id])
}

// Sienta (o libera, con tableId = null) a un miembro. Valida que la mesa exista.
export async function assignMember(memberId, tableId) {
  if (tableId) {
    const t = await queryOne('SELECT id FROM tables WHERE id = ? LIMIT 1', [tableId])
    if (!t) {
      const err = new Error('La mesa no existe')
      err.code = 'NO_TABLE'
      throw err
    }
  }
  await query('UPDATE guest_members SET table_id = ? WHERE id = ?', [tableId || null, memberId])
}
