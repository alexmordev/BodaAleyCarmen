// Gestion de invitados por los novios.
//   GET  /api/admin/guests?token=<novios>            -> lista con enlaces y estado
//   POST /api/admin/guests?token=<novios>            -> alta de grupo + genera token
//
// Body del POST:
//   { family, role?, allowPlusOne?, seatsAdults?, seatsChildren?,
//     members: [{ name?, editable?, type?, principal?, allowPlusOne? }] }
import { NextResponse } from 'next/server'
import { requireNovios } from '@/lib/admin'
import { guestsWithMembers, createGuest } from '@/lib/repo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const guard = await requireNovios(searchParams.get('token'))
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const base = siteBase()
    const guests = await guestsWithMembers()
    const withLinks = guests.map((g) => ({
      ...g,
      link: base ? `${base}/?i=${g.token}` : `/?i=${g.token}`,
    }))
    return NextResponse.json({ guests: withLinks })
  } catch (err) {
    console.error('[api/admin/guests] DB error:', err.message)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req) {
  const { searchParams } = new URL(req.url)
  const guard = await requireNovios(searchParams.get('token'))
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }
  if (!body || !body.family) return NextResponse.json({ error: 'Falta la etiqueta del grupo (family)' }, { status: 400 })

  try {
    const { id, token } = await createGuest(body)
    const base = siteBase()
    return NextResponse.json({
      ok: true, id, token,
      link: base ? `${base}/?i=${token}` : `/?i=${token}`,
    }, { status: 201 })
  } catch (err) {
    console.error('[api/admin/guests] create error:', err.message)
    return NextResponse.json({ error: 'No se pudo crear el invitado' }, { status: 500 })
  }
}
