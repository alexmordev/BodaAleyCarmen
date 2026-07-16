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

// --- Persistencia del RSVP -------------------------------------------------

// responses: [{ memberId, attending: bool, name?: string, diet?: string }]
// plus:      { enabled, name, diet }  (se guarda en el miembro principal)
export async function persistRsvp(guest, { responses = [], plus = null }, meta = {}) {
  const pool = getPool()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const members = await membersOf(guest.id)
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

// Conteo de confirmaciones a nivel persona (incluye +1).
export async function rsvpStats() {
  const groups = await queryOne(
    `SELECT
        COUNT(*)                                   AS grupos,
        SUM(confirmed = 1)                         AS grupos_confirmados
       FROM guests WHERE role_id = 3`,
  )
  const people = await queryOne(
    `SELECT
        SUM(attending = 1)                         AS asisten,
        SUM(attending = 0)                         AS no_asisten,
        SUM(attending IS NULL)                     AS sin_responder,
        SUM(plus_one_attending = 1)                AS acompanantes
       FROM guest_members m
       JOIN guests g ON g.id = m.guest_id
      WHERE g.role_id = 3`,
  )
  const diets = await query(
    `SELECT diet, COUNT(*) AS n
       FROM guest_members
      WHERE attending = 1 AND diet IS NOT NULL AND diet <> ''
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
    `SELECT id, guest_id, name, type, is_principal, attending, diet,
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
