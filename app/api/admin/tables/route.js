// Mesas del banquete (seating). Solo rol 'novios'.
//   GET    /api/admin/tables?token=<novios>            -> lista de mesas
//   POST   /api/admin/tables?token=<novios>            -> crea una mesa { name?, seats? }
//   PATCH  /api/admin/tables?token=<novios>            -> sienta/libera { memberId, tableId|null }
//   DELETE /api/admin/tables?token=<novios>&id=<mesa>  -> borra una mesa (libera invitados)
import { NextResponse } from 'next/server'
import { requireNovios } from '@/lib/admin'
import { listTables, createTable, deleteTable, assignMember } from '@/lib/repo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function guard(req) {
  const { searchParams } = new URL(req.url)
  const g = await requireNovios(searchParams.get('token'))
  return { g, searchParams }
}

export async function GET(req) {
  const { g } = await guard(req)
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status })
  try {
    return NextResponse.json({ tables: await listTables() })
  } catch (err) {
    console.error('[api/admin/tables] GET error:', err.message)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(req) {
  const { g } = await guard(req)
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status })
  let body = {}
  try { body = await req.json() } catch {}
  try {
    const table = await createTable(body || {})
    return NextResponse.json({ ok: true, table }, { status: 201 })
  } catch (err) {
    console.error('[api/admin/tables] POST error:', err.message)
    return NextResponse.json({ error: 'No se pudo crear la mesa' }, { status: 500 })
  }
}

export async function PATCH(req) {
  const { g } = await guard(req)
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status })
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalido' }, { status: 400 }) }
  const { memberId, tableId } = body || {}
  if (!memberId) return NextResponse.json({ error: 'Falta memberId' }, { status: 400 })
  try {
    await assignMember(memberId, tableId || null)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err.code === 'NO_TABLE') return NextResponse.json({ error: err.message }, { status: 404 })
    console.error('[api/admin/tables] PATCH error:', err.message)
    return NextResponse.json({ error: 'No se pudo asignar la mesa' }, { status: 500 })
  }
}

export async function DELETE(req) {
  const { g, searchParams } = await guard(req)
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status })
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el id de la mesa' }, { status: 400 })
  try {
    await deleteTable(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/admin/tables] DELETE error:', err.message)
    return NextResponse.json({ error: 'No se pudo borrar la mesa' }, { status: 500 })
  }
}
