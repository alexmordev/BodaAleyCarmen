// POST /api/rsvp
// Persiste la confirmacion de un grupo. Body:
//   { token, responses: [{ memberId, attending, name?, diet? }], plus?: { enabled, name, diet } }
import { NextResponse } from 'next/server'
import { clientIp, userAgent, findGuestByToken, persistRsvp } from '@/lib/repo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const { token, responses, plus } = body || {}
  if (!token) return NextResponse.json({ error: 'Falta el token' }, { status: 400 })
  if (!Array.isArray(responses) || !responses.length) {
    return NextResponse.json({ error: 'Faltan respuestas' }, { status: 400 })
  }

  let guest
  try {
    guest = await findGuestByToken(token)
  } catch (err) {
    console.error('[api/rsvp] DB error:', err.message)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
  if (!guest) return NextResponse.json({ error: 'Invitacion no encontrada' }, { status: 404 })

  try {
    const result = await persistRsvp(guest, { responses, plus }, { ip: clientIp(req), ua: userAgent(req) })
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    // Aforo excedido: es culpa del payload, no del servidor. El mensaje ya viene
    // redactado para mostrarse tal cual al invitado.
    if (err.code === 'AFORO') {
      return NextResponse.json({ error: err.message, code: 'AFORO' }, { status: 409 })
    }
    // Rol exento (novios/proveedor): no confirma. No es error del servidor.
    if (err.code === 'NO_RSVP') {
      return NextResponse.json({ error: err.message, code: 'NO_RSVP' }, { status: 403 })
    }
    console.error('[api/rsvp] persist error:', err.message)
    return NextResponse.json({ error: 'No se pudo guardar la confirmacion' }, { status: 500 })
  }
}
