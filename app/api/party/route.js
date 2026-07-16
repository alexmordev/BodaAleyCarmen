// GET /api/party?i=<token>
// Resuelve el grupo del invitado por su token, registra el acceso (log de
// ingresos) y devuelve el payload que el frontend inyecta en window.__PARTY__.
import { NextResponse } from 'next/server'
import { clientIp, userAgent, findGuestByToken, membersOf, toPartyPayload, logAccess, markOpened } from '@/lib/repo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('i') || searchParams.get('token')
  const ip = clientIp(req)
  const ua = userAgent(req)

  if (!token) {
    return NextResponse.json({ error: 'Falta el token de invitacion' }, { status: 400 })
  }

  let guest
  try {
    guest = await findGuestByToken(token)
  } catch (err) {
    console.error('[api/party] DB error:', err.message)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }

  if (!guest) {
    await logAccess({ tokenTried: token, success: false, ip, ua }).catch(() => {})
    return NextResponse.json({ error: 'Invitacion no encontrada' }, { status: 404 })
  }

  const members = await membersOf(guest.id)
  await markOpened(guest.id).catch(() => {})
  await logAccess({ guestId: guest.id, tokenTried: token, success: true, ip, ua }).catch(() => {})

  return NextResponse.json({ party: toPartyPayload(guest, members) })
}
