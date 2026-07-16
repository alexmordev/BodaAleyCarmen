// GET /api/admin/access?token=<token-novios>
// Panel de novios: resumen de accesos (quien entro, hora, cuantas veces),
// ingresos recientes y conteo de confirmaciones. Solo rol 'novios'.
import { NextResponse } from 'next/server'
import { requireNovios } from '@/lib/admin'
import { accessSummary, recentAccess, rsvpStats } from '@/lib/repo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  const guard = await requireNovios(token).catch((err) => {
    console.error('[api/admin/access] guard error:', err.message)
    return { ok: false, status: 500, error: 'Error del servidor' }
  })
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })

  try {
    const [summary, recent, stats] = await Promise.all([accessSummary(), recentAccess(100), rsvpStats()])
    return NextResponse.json({ summary, recent, stats })
  } catch (err) {
    console.error('[api/admin/access] DB error:', err.message)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
