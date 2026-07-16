'use client'
// Panel de novios. Acceso con ?token=<token-de-un-grupo-rol-novios>.
// Muestra: accesos (quién entró, hora, cuántas veces), resumen por familia,
// conteo de confirmaciones y alta de invitados con generación de enlaces.
import React, { useCallback, useEffect, useMemo, useState } from 'react'

function useToken() {
  const [token, setToken] = useState(null)
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token')
    setToken(t)
  }, [])
  return token
}

function fmt(dt) {
  if (!dt) return '—'
  // Las fechas llegan como string 'YYYY-MM-DD HH:MM:SS' (dateStrings).
  const d = new Date(dt.replace(' ', 'T'))
  if (isNaN(d)) return dt
  return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function NoviosPanel() {
  const token = useToken()
  const [data, setData] = useState(null)
  const [guests, setGuests] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true); setError(null)
    try {
      const [aRes, gRes] = await Promise.all([
        fetch(`/api/admin/access?token=${encodeURIComponent(token)}`),
        fetch(`/api/admin/guests?token=${encodeURIComponent(token)}`),
      ])
      if (!aRes.ok) {
        const j = await aRes.json().catch(() => ({}))
        throw new Error(j.error || `Error ${aRes.status}`)
      }
      setData(await aRes.json())
      setGuests(gRes.ok ? (await gRes.json()).guests : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const stats = data?.stats
  const people = stats?.people || {}
  const groups = stats?.groups || {}

  const copy = (text) => { navigator.clipboard?.writeText(text) }

  if (token === null) return <div className="np-wrap"><p className="np-msg">Cargando…</p></div>
  if (!token) return <div className="np-wrap"><p className="np-msg">Falta el token de acceso en la URL (<code>?token=…</code>).</p></div>

  return (
    <div className="np-wrap">
      <header className="np-head">
        <div>
          <div className="np-kicker">Panel de novios</div>
          <h1>Accesos y confirmaciones</h1>
        </div>
        <button className="np-btn" onClick={load} disabled={loading}>{loading ? 'Actualizando…' : 'Actualizar'}</button>
      </header>

      {error && <p className="np-error">{error}</p>}

      {stats && (
        <section className="np-cards">
          <div className="np-card"><b>{Number(people.asisten || 0) + Number(people.acompanantes || 0)}</b><small>Personas asisten</small></div>
          <div className="np-card"><b>{people.no_asisten || 0}</b><small>No asisten</small></div>
          <div className="np-card"><b>{people.sin_responder || 0}</b><small>Sin responder</small></div>
          <div className="np-card"><b>{groups.grupos_confirmados || 0}/{groups.grupos || 0}</b><small>Grupos confirmados</small></div>
        </section>
      )}

      <section className="np-section">
        <h2>Resumen por familia · accesos</h2>
        <div className="np-table-wrap">
          <table className="np-table">
            <thead>
              <tr><th>Grupo</th><th>Rol</th><th>Veces</th><th>Primer ingreso</th><th>Último ingreso</th><th>RSVP</th></tr>
            </thead>
            <tbody>
              {(data?.summary || []).map((r) => (
                <tr key={r.id}>
                  <td>{r.family}</td>
                  <td><span className={`np-tag np-${r.role}`}>{r.role}</span></td>
                  <td>{r.visitas}</td>
                  <td>{fmt(r.primer_ingreso)}</td>
                  <td>{fmt(r.ultimo_ingreso)}</td>
                  <td>{r.confirmed ? '✓' : '—'}</td>
                </tr>
              ))}
              {data && !data.summary?.length && <tr><td colSpan={6} className="np-empty">Aún no hay accesos.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {stats?.diets?.length > 0 && (
        <section className="np-section">
          <h2>Restricciones alimentarias</h2>
          <ul className="np-diets">
            {stats.diets.map((d) => <li key={d.diet}><b>{d.n}</b> {d.diet}</li>)}
          </ul>
        </section>
      )}

      <section className="np-section">
        <h2>Ingresos recientes</h2>
        <div className="np-table-wrap">
          <table className="np-table">
            <thead><tr><th>Fecha</th><th>Grupo</th><th>Resultado</th><th>IP</th></tr></thead>
            <tbody>
              {(data?.recent || []).map((r) => (
                <tr key={r.id}>
                  <td>{fmt(r.created_at)}</td>
                  <td>{r.family || <em>token inválido</em>}</td>
                  <td>{r.success ? 'ok' : 'fallido'}</td>
                  <td>{r.ip || '—'}</td>
                </tr>
              ))}
              {data && !data.recent?.length && <tr><td colSpan={4} className="np-empty">Sin ingresos aún.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <NewGuest token={token} onCreated={load} />

      {guests && guests.length > 0 && (
        <section className="np-section">
          <h2>Invitados y enlaces ({guests.length})</h2>
          <div className="np-table-wrap">
            <table className="np-table">
              <thead><tr><th>Grupo</th><th>Rol</th><th>Personas</th><th>RSVP</th><th>Enlace</th></tr></thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.id}>
                    <td>{g.family}</td>
                    <td><span className={`np-tag np-${g.role}`}>{g.role}</span></td>
                    <td>{g.members?.length || 0}</td>
                    <td>{g.confirmed ? '✓' : '—'}</td>
                    <td><button className="np-link" onClick={() => copy(g.link)} title={g.link}>Copiar enlace</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

// Alta rápida de un grupo con miembros.
function NewGuest({ token, onCreated }) {
  const [family, setFamily] = useState('')
  const [role, setRole] = useState('invitado')
  const [allowPlusOne, setAllowPlusOne] = useState(false)
  const [seatsAdults, setSeatsAdults] = useState(1)
  const [seatsChildren, setSeatsChildren] = useState(0)
  const [names, setNames] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState(null)

  const members = useMemo(
    () => names.split('\n').map((n) => n.trim()).filter(Boolean).map((name, i) => ({ name, principal: i === 0 })),
    [names],
  )

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr(null); setResult(null)
    try {
      const res = await fetch(`/api/admin/guests?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family, role, allowPlusOne, seatsAdults: Number(seatsAdults), seatsChildren: Number(seatsChildren), members }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Error')
      setResult(j)
      setFamily(''); setNames(''); setAllowPlusOne(false)
      onCreated?.()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="np-section">
      <h2>Nuevo invitado</h2>
      <form className="np-form" onSubmit={submit}>
        <label>Grupo / familia
          <input value={family} onChange={(e) => setFamily(e.target.value)} placeholder="Familia Curiel-Ramírez" required />
        </label>
        <div className="np-row">
          <label>Rol
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="invitado">invitado</option>
              <option value="proveedor">proveedor</option>
              <option value="novios">novios</option>
            </select>
          </label>
          <label>Lugares adultos
            <input type="number" min="0" value={seatsAdults} onChange={(e) => setSeatsAdults(e.target.value)} />
          </label>
          <label>Menores (familia)
            <input type="number" min="0" value={seatsChildren} onChange={(e) => setSeatsChildren(e.target.value)} />
          </label>
          <label className="np-check">
            <input type="checkbox" checked={allowPlusOne} onChange={(e) => setAllowPlusOne(e.target.checked)} /> Permite +1
          </label>
        </div>
        <label>Personas (una por línea; la primera es la principal)
          <textarea value={names} onChange={(e) => setNames(e.target.value)} rows={4} placeholder={'Norma Curiel\nRoberto Ramírez'} />
        </label>
        <button className="np-btn" disabled={busy || !family}>{busy ? 'Creando…' : 'Crear y generar enlace'}</button>
      </form>
      {err && <p className="np-error">{err}</p>}
      {result && (
        <p className="np-result">
          Enlace generado: <code>{result.link}</code>{' '}
          <button className="np-link" onClick={() => navigator.clipboard?.writeText(result.link)}>Copiar</button>
        </p>
      )}
    </section>
  )
}
