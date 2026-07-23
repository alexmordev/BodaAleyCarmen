'use client'
// Panel de novios. Acceso con ?token=<token-de-un-grupo-rol-novios>.
// Réplica del diseño "Panel de Novios.html" (Claude Design) cableada a los
// endpoints reales: /api/admin/access, /api/admin/guests, /api/admin/tables.
// Secciones: stats, resumen por familia (buscar/filtrar), mesas (seating),
// ingresos recientes y alta de invitados con generación de enlace.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './novios.css'

// --- Roles / RSVP ----------------------------------------------------------
// Mismo criterio que el backend (lib/repo.js): novios/proveedor no confirman.
const NON_RSVP_ROLES = new Set(['novios', 'proveedor'])
const requiresRsvp = (role) => !NON_RSVP_ROLES.has(role)
const ROLE_LABEL = { novios: 'Novios', invitado: 'Invitado', familia: 'Familia', padrinos: 'Padrinos', proveedor: 'Proveedor' }
const RSVP_LABEL = { yes: 'Asiste', no: 'No asiste', pend: 'Sin responder', na: 'Sin RSVP' }

function useToken() {
  const [token, setToken] = useState(null)
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get('token')) }, [])
  return token
}

function fmt(dt) {
  if (!dt) return null
  const d = new Date(String(dt).replace(' ', 'T'))
  if (isNaN(d)) return String(dt)
  return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// --- Iconos (SVG inline) ---------------------------------------------------
const svg = (children, extra = {}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...extra}>{children}</svg>
)
const IcoRefresh = (p) => svg(<><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></>, p)
const IcoSearch = (p) => svg(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>, p)
const IcoCopy = (p) => svg(<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, p)
const IcoCheck = (p) => svg(<path d="M20 6 9 17l-5-5" />, p)
const IcoX = (p) => svg(<path d="M18 6 6 18M6 6l12 12" />, p)
const IcoPlus = (p) => svg(<path d="M12 5v14M5 12h14" />, p)
const IcoUsers = (p) => svg(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>, p)
const IcoLink = (p) => svg(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>, p)

const RSVP_COLOR = { yes: 'var(--ok)', no: 'var(--bad)', pend: 'var(--warn)', na: 'var(--muted)' }

export default function NoviosPanel() {
  const token = useToken()
  const [data, setData] = useState(null)     // { summary, recent, stats }
  const [guests, setGuests] = useState(null)  // [{ ...guest, members }]
  const [tables, setTables] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState(null)
  const toastT = useRef(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastT.current)
    toastT.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const q = (path) => fetch(`${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`)

  const load = useCallback(async (soft = false) => {
    if (!token) return
    soft ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const [aRes, gRes, tRes] = await Promise.all([
        q('/api/admin/access'), q('/api/admin/guests'), q('/api/admin/tables'),
      ])
      if (!aRes.ok) {
        const j = await aRes.json().catch(() => ({}))
        throw new Error(j.error || `Error ${aRes.status}`)
      }
      setData(await aRes.json())
      setGuests(gRes.ok ? (await gRes.json()).guests : [])
      setTables(tRes.ok ? (await tRes.json()).tables : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false); setRefreshing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => { load() }, [load])

  // --- Modelo derivado -----------------------------------------------------
  const summaryById = useMemo(() => {
    const m = new Map()
    for (const s of data?.summary || []) m.set(s.id, s)
    return m
  }, [data])

  // RSVP por persona, espejo del formulario: attending 1=asiste, 0=no, null=sin
  // responder. Los roles exentos (novios/proveedor) no confirman -> 'na'.
  const personRsvp = (role, attending) => {
    if (!requiresRsvp(role)) return 'na'
    return attending === 1 ? 'yes' : attending === 0 ? 'no' : 'pend'
  }

  const families = useMemo(() => {
    if (!guests) return []
    return guests.map((g) => {
      const s = summaryById.get(g.id) || {}
      const named = (g.members || []).filter((m) => m.name && m.name.trim())
      return {
        id: g.id, group: g.family, role: g.role, link: g.link,
        people: named.map((m) => ({
          id: m.id, name: m.name, kind: m.type === 'menor' ? 'child' : 'adult',
          table_id: m.table_id || null, attending: m.attending, diet: m.diet,
        })),
        // El +1 vive en el principal; solo cuenta cuando fue activado (attending=1).
        plusOnes: named
          .filter((m) => m.plus_one_name && m.plus_one_attending === 1)
          .map((m) => ({ name: m.plus_one_name, diet: m.plus_one_diet })),
        visits: s.visitas || 0,
        first: fmt(s.primer_ingreso), last: fmt(s.ultimo_ingreso),
      }
    })
  }, [guests, summaryById])

  // allPeople: miembros reales (para las mesas: tienen id y pueden sentarse).
  const allPeople = useMemo(
    () => families.flatMap((f) => f.people.map((p) => ({ ...p, fam: f }))),
    [families],
  )

  // peopleRows: una fila por invitado (incluye los +1) para el resumen.
  const peopleRows = useMemo(() => families.flatMap((f) => {
    const rows = f.people.map((p) => ({
      key: p.id, name: p.name, group: f.group, role: f.role, kind: p.kind,
      rsvp: personRsvp(f.role, p.attending), diet: p.diet, last: f.last, link: f.link, isPlus: false,
    }))
    const plusRows = f.plusOnes.map((po, i) => ({
      key: `${f.id}-plus-${i}`, name: po.name, group: f.group, role: f.role, kind: 'adult',
      rsvp: requiresRsvp(f.role) ? 'yes' : 'na', diet: po.diet, last: f.last, link: f.link, isPlus: true,
    }))
    return [...rows, ...plusRows]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [families])

  const stats = data?.stats
  const people = stats?.people || {}
  const groups = stats?.groups || {}
  const stAsisten = Number(people.asisten || 0) + Number(people.acompanantes || 0)
  const grpN = Number(groups.grupos_confirmados || 0)
  const grpT = Number(groups.grupos || 0)

  // --- Filtro / búsqueda (por invitado) ------------------------------------
  const shown = useMemo(() => peopleRows.filter((p) => {
    if (filter !== 'all' && p.rsvp !== filter) return false
    if (query) {
      const hay = (p.name + ' ' + p.group).toLowerCase()
      if (!hay.includes(query)) return false
    }
    return true
  }), [peopleRows, filter, query])

  // --- Acciones ------------------------------------------------------------
  const copy = async (text, label = 'Enlace copiado al portapapeles') => {
    try { await navigator.clipboard.writeText(text) } catch { /* noop */ }
    showToast(label)
  }

  const seat = async (memberId, tableId) => {
    try {
      const res = await fetch(`/api/admin/tables?token=${encodeURIComponent(token)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, tableId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Error')
      showToast(tableId ? 'Invitado sentado' : 'Quitado de la mesa')
      load(true)
    } catch (err) { showToast(err.message) }
  }

  const addTable = async () => {
    try {
      const res = await fetch(`/api/admin/tables?token=${encodeURIComponent(token)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      if (!res.ok) throw new Error('Error')
      showToast('Mesa añadida'); load(true)
    } catch (err) { showToast(err.message) }
  }

  const removeTable = async (id) => {
    try {
      const res = await fetch(`/api/admin/tables?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error')
      showToast('Mesa eliminada'); load(true)
    } catch (err) { showToast(err.message) }
  }

  // --- Gates ---------------------------------------------------------------
  if (token === null) return <Shell><div className="np-loading">Cargando…</div></Shell>
  if (!token) return <Shell><div className="empty"><span className="serif">Acceso restringido</span>Falta el token en la URL (<code>?token=…</code>).</div></Shell>

  return (
    <Shell
      refreshing={refreshing}
      onRefresh={() => load(true)}
      lastSync={loading ? '' : 'Actualizado ahora'}
    >
      <header className="head">
        <div className="eyebrow">Accesos &amp; confirmaciones</div>
        <h1>Quién ya <em>confirmó</em></h1>
        <p className="sub">Sigue las visitas a la invitación, las confirmaciones de asistencia y agrega nuevos invitados con su enlace personal.</p>
      </header>

      {error && <div className="empty"><span className="serif">No se pudo cargar</span>{error}</div>}

      {/* STATS */}
      <div className="stats">
        <div className="stat s-ok">
          <div className="lbl">Personas asisten</div>
          <div className="num">{stAsisten}</div>
          <div className="cap">adultos + menores</div>
        </div>
        <div className="stat s-bad">
          <div className="lbl">No asisten</div>
          <div className="num">{Number(people.no_asisten || 0)}</div>
          <div className="cap">declinaron</div>
        </div>
        <div className="stat s-warn">
          <div className="lbl">Sin responder</div>
          <div className="num">{Number(people.sin_responder || 0)}</div>
          <div className="cap">esperando RSVP</div>
        </div>
        <div className="stat">
          <div className="lbl">Grupos confirmados</div>
          <div className="num">{grpN}<small>/{grpT}</small></div>
          <div className="prog"><i style={{ width: (grpT ? (grpN / grpT * 100) : 0) + '%' }} /></div>
        </div>
      </div>

      {/* GUESTS (por invitado) */}
      <section className="card">
        <div className="sec-head">
          <div>
            <h2>Resumen por invitado</h2>
            <div className="desc">Estado de confirmación de cada persona (dentro de un grupo unos asisten y otros no).</div>
          </div>
          <div className="side"><span className="chip">{peopleRows.length} invitados</span></div>
        </div>
        <div className="toolbar">
          <div className="search">
            <IcoSearch />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value.trim().toLowerCase())} placeholder="Buscar invitado o grupo…" />
          </div>
          <div className="filters">
            {[['all', 'Todos'], ['yes', 'Asisten'], ['pend', 'Sin resp.'], ['no', 'No asisten']].map(([f, lbl]) => (
              <button key={f} className="fbtn" aria-pressed={filter === f} onClick={() => setFilter(f)}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* mobile cards */}
        <div className="flist">
          {shown.length === 0
            ? <div className="empty"><span className="serif">Sin resultados</span>Prueba con otro filtro o búsqueda.</div>
            : shown.map((p) => <PersonCard key={p.key} p={p} onCopy={copy} />)}
        </div>

        {/* desktop table */}
        <div className="fam-table-wrap">
          <div className="twrap">
            <table className="data">
              <thead><tr>
                <th>Invitado</th><th>Grupo</th><th>Rol</th><th>Tipo</th><th>Dieta</th><th>RSVP</th><th></th>
              </tr></thead>
              <tbody>
                {shown.length === 0
                  ? <tr><td colSpan={7} className="empty" style={{ textAlign: 'center' }}>Sin resultados</td></tr>
                  : shown.map((p) => (
                    <tr key={p.key}>
                      <td className="name">{p.name}{p.isPlus && <span className="kbadge adult" style={{ marginLeft: 8 }}>+1</span>}</td>
                      <td>{p.group}</td>
                      <td><RoleBadge role={p.role} /></td>
                      <td><span className={`kbadge ${p.kind}`}>{p.kind === 'child' ? 'Infancia' : 'Adulto'}</span></td>
                      <td className={p.diet ? '' : 'dim'}>{p.diet || '—'}</td>
                      <td><RsvpBadge r={p.rsvp} /></td>
                      <td><button className="mini" onClick={() => copy(p.link)}><IcoCopy />Enlace</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MESAS */}
      <section className="card">
        <div className="sec-head">
          <div>
            <h2>Mesas</h2>
            <div className="desc">Sienta a cada invitado en su mesa. El color indica quién ya confirmó.</div>
          </div>
          <div className="side"><button className="btn btn-ghost" onClick={addTable}><IcoPlus />Añadir mesa</button></div>
        </div>
        <Pool people={allPeople.filter((p) => !p.table_id)} />
        <div className="mesas">
          {tables.map((t) => (
            <Mesa key={t.id} table={t} seated={allPeople.filter((p) => p.table_id === t.id)}
              pool={allPeople.filter((p) => !p.table_id)} onSeat={seat} onUnseat={(mid) => seat(mid, null)} onDelete={removeTable} />
          ))}
          {tables.length === 0 && <div className="mesa-empty" style={{ gridColumn: '1/-1' }}>Aún no hay mesas. Añade la primera.</div>}
        </div>
      </section>

      {/* RECENT ACCESS */}
      <section className="card">
        <div className="sec-head">
          <div>
            <h2>Ingresos recientes</h2>
            <div className="desc">Últimos intentos de acceso a la invitación.</div>
          </div>
          <div className="side"><span className="chip">Tiempo real</span></div>
        </div>
        <div className="log">
          {(data?.recent || []).map((l) => (
            <div className="log-row" key={l.id}>
              <div className={`log-ico ${l.success ? 'ok' : 'fail'}`}>{l.success ? <IcoCheck /> : <IcoX />}</div>
              <div className="log-main">
                <div className={`g ${l.success ? '' : 'tok'}`}>{l.family || 'token inválido'}</div>
                <div className="sub"><span>{fmt(l.created_at)}</span><span>IP {l.ip || '—'}</span></div>
              </div>
              <div className={`log-res ${l.success ? 'ok' : 'fail'}`}>{l.success ? 'ok' : 'fallido'}</div>
            </div>
          ))}
        </div>
        <div className="log-table-wrap">
          <div className="twrap">
            <table className="data">
              <thead><tr><th>Fecha</th><th>Grupo</th><th>Resultado</th><th>IP</th></tr></thead>
              <tbody>
                {(data?.recent || []).map((l) => (
                  <tr key={l.id}>
                    <td className="dim mono" style={{ fontSize: 12 }}>{fmt(l.created_at)}</td>
                    <td className={l.success ? 'name' : 'tok'}>{l.family || 'token inválido'}</td>
                    <td><span className={`res ${l.success ? 'ok' : 'fail'}`}><span className="d" />{l.success ? 'ok' : 'fallido'}</span></td>
                    <td className="dim mono">{l.ip || '—'}</td>
                  </tr>
                ))}
                {data && !data.recent?.length && <tr><td colSpan={4} className="empty" style={{ textAlign: 'center' }}>Sin ingresos aún.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* NEW GUEST */}
      <NewGuest token={token} onCreated={() => load(true)} showToast={showToast} />

      <div className="foot">Hecho con <em>cariño</em> · 07 · noviembre · 2026</div>

      {toast && <div className="toast show"><IcoCheck /><span>{toast}</span></div>}
    </Shell>
  )
}

// --- Shell (topbar + app frame) --------------------------------------------
function Shell({ children, onRefresh, refreshing, lastSync }) {
  return (
    <div className="np-root">
      <div className="topbar">
        <div className="topbar-in">
          <div className="brand">
            <div className="mark">A<em>&amp;</em>C</div>
            <div className="t">
              <div className="k">Panel de novios</div>
              <div className="n">Alejandro &amp; Carmen</div>
            </div>
          </div>
          <div className="topbar-actions">
            {lastSync ? <div className="sync"><span className="dot" /><span>{lastSync}</span></div> : null}
            {onRefresh && (
              <button className="btn btn-primary" onClick={onRefresh} disabled={refreshing}>
                <IcoRefresh className={refreshing ? 'spin' : undefined} />
                <span>{refreshing ? 'Actualizando…' : 'Actualizar'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="app">{children}</div>
    </div>
  )
}

function RoleBadge({ role }) {
  return <span className={`role ${role === 'novios' ? 'novios' : ''}`}>{ROLE_LABEL[role] || role}</span>
}
function RsvpBadge({ r }) {
  return <span className={`rsvp ${r}`}><span className="d" />{RSVP_LABEL[r]}</span>
}

function PersonCard({ p, onCopy }) {
  return (
    <div className="fam">
      <div className="fam-top">
        <div className="fam-name">
          {p.name}
          <span className={`kbadge ${p.kind}`}>{p.kind === 'child' ? 'Infancia' : 'Adulto'}</span>
          {p.isPlus && <span className="kbadge adult">+1</span>}
        </div>
        <RsvpBadge r={p.rsvp} />
      </div>
      <div className="fam-meta">
        <div className="m"><div className="ml">Grupo</div><div className="mv">{p.group}</div></div>
        <div className="m"><div className="ml">Rol</div><div className="mv"><RoleBadge role={p.role} /></div></div>
        {p.diet ? <div className="m"><div className="ml">Dieta</div><div className="mv">{p.diet}</div></div> : null}
      </div>
      <div className="fam-actions">
        <button className="mini" onClick={() => onCopy(p.link)}><IcoCopy />Copiar enlace</button>
      </div>
    </div>
  )
}

function Pool({ people }) {
  if (!people.length) return <div className="pool"><span className="pool-done"><span className="d" />Todos los invitados tienen mesa asignada</span></div>
  return (
    <div className="pool">
      <span className="pl">Por sentar</span>
      {people.map((p) => <span className="poolchip" key={p.id}><span className="d" />{p.name}</span>)}
    </div>
  )
}

function Mesa({ table, seated, pool, onSeat, onUnseat, onDelete }) {
  const used = seated.length
  const conf = seated.filter((p) => p.fam.rsvp === 'yes').length
  const pend = seated.filter((p) => p.fam.rsvp === 'pend').length
  const no = seated.filter((p) => p.fam.rsvp === 'no').length
  const badgeCls = used > table.seats ? 'over' : used === table.seats ? 'full' : ''
  return (
    <div className="mesa">
      <div className="mesa-head">
        <div className="mesa-name">{table.name}</div>
        <span className={`seatbadge ${badgeCls}`}>{used}/{table.seats}</span>
      </div>
      <div className="mesa-conf">
        <span className="cf"><span className="d" style={{ background: 'var(--ok)' }} />{conf} conf.</span>
        <span className="cf"><span className="d" style={{ background: 'var(--warn)' }} />{pend} pend.</span>
        <span className="cf"><span className="d" style={{ background: 'var(--bad)' }} />{no} no</span>
      </div>
      <div className="mesa-chips">
        {seated.length === 0
          ? <div className="mesa-empty">Sin invitados asignados</div>
          : seated.map((p) => (
            <div className="gchip" key={p.id}>
              <span className="d" style={{ background: RSVP_COLOR[p.fam.rsvp] }} title={RSVP_LABEL[p.fam.rsvp]} />
              <span className="gn">{p.name}</span>
              <span className={`kbadge ${p.kind}`}>{p.kind === 'child' ? 'Infancia' : 'Adulto'}</span>
              <button className="x" onClick={() => onUnseat(p.id)} title="Quitar de la mesa"><IcoX /></button>
            </div>
          ))}
      </div>
      {pool.length > 0 && (
        <div className="mesa-assign">
          <select className="assign-sel" value="" onChange={(e) => e.target.value && onSeat(e.target.value, table.id)}>
            <option value="">+ Sentar invitado…</option>
            {pool.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.fam.group}</option>)}
          </select>
        </div>
      )}
      <button className="mesa-del" onClick={() => onDelete(table.id)}>Eliminar mesa</button>
    </div>
  )
}

// --- Alta de invitado ------------------------------------------------------
let pidSeq = 0
function NewGuest({ token, onCreated, showToast }) {
  const [group, setGroup] = useState('')
  const [role, setRole] = useState('invitado')
  const [plus, setPlus] = useState(false)
  const [people, setPeople] = useState(() => [{ pid: ++pidSeq, name: '', kind: 'adult' }])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const adults = people.filter((p) => p.kind === 'adult').length
  const children = people.length - adults

  const setPerson = (pid, patch) => setPeople((ps) => ps.map((p) => p.pid === pid ? { ...p, ...patch } : p))
  const addPerson = () => setPeople((ps) => [...ps, { pid: ++pidSeq, name: '', kind: 'adult' }])
  const removePerson = (pid) => setPeople((ps) => ps.length > 1 ? ps.filter((p) => p.pid !== pid) : ps)

  const submit = async (e) => {
    e.preventDefault()
    if (!group.trim()) { showToast('Escribe el nombre del grupo'); return }
    for (const p of people) if (!p.name.trim()) { showToast('Cada persona necesita un nombre'); return }
    setBusy(true); setResult(null)
    try {
      const members = people.map((p, i) => ({ name: p.name.trim(), type: p.kind === 'child' ? 'menor' : 'adulto', principal: i === 0 }))
      const res = await fetch(`/api/admin/guests?token=${encodeURIComponent(token)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family: group.trim(), role, allowPlusOne: plus, seatsAdults: adults, seatsChildren: children, members }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Error')
      setResult({ name: `${group.trim()} · ${people.length} lugar(es)${plus ? ' · +1' : ''}`, link: j.link })
      setGroup(''); setPlus(false); setPeople([{ pid: ++pidSeq, name: '', kind: 'adult' }])
      showToast('Invitado creado')
      onCreated?.()
    } catch (err) { showToast(err.message) } finally { setBusy(false) }
  }

  return (
    <section className="card">
      <div className="sec-head">
        <div>
          <h2>Nuevo invitado</h2>
          <div className="desc">Crea un grupo y genera su enlace personal de acceso.</div>
        </div>
      </div>
      <div className="form">
        <form onSubmit={submit} autoComplete="off">
          <div className="fgrid">
            <div className="field">
              <label htmlFor="fGroup">Grupo / familia</label>
              <input className="ctrl" id="fGroup" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Ej. Familia Curiel-Ramírez" required />
            </div>
            <div className="row2">
              <div className="field">
                <label htmlFor="fRole">Rol</label>
                <select className="ctrl" id="fRole" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="invitado">Invitado</option>
                  <option value="familia">Familia</option>
                  <option value="padrinos">Padrinos</option>
                  <option value="novios">Novios</option>
                  <option value="proveedor">Proveedor</option>
                </select>
              </div>
              <div className="field">
                <label>&nbsp;</label>
                <label className="switch">
                  <input type="checkbox" checked={plus} onChange={(e) => setPlus(e.target.checked)} />
                  <span className="tog" />
                  <span className="txt">Permite +1</span>
                </label>
              </div>
            </div>
            <div className="field">
              <label>Invitados <span className="hint">· nombre obligatorio · marca adulto o infancia</span></label>
              <div className="people">
                {people.map((p) => (
                  <div className="prow" key={p.pid}>
                    <input className="ctrl pname" placeholder="Nombre completo" value={p.name} onChange={(e) => setPerson(p.pid, { name: e.target.value })} required />
                    <div className="seg" role="group">
                      <button type="button" className="segbtn" aria-pressed={p.kind === 'adult'} onClick={() => setPerson(p.pid, { kind: 'adult' })}>Adulto</button>
                      <button type="button" className="segbtn child" aria-pressed={p.kind === 'child'} onClick={() => setPerson(p.pid, { kind: 'child' })}>Infancia</button>
                    </div>
                    <button type="button" className="prow-x" title="Quitar" disabled={people.length <= 1} onClick={() => removePerson(p.pid)}><IcoX /></button>
                  </div>
                ))}
              </div>
              <button type="button" className="addperson" onClick={addPerson}><IcoPlus />Añadir persona</button>
            </div>
            <div className="capacity">
              <IcoUsers />
              <span><b>{people.length}</b> persona(s) · <b>{adults}</b> adulto(s) · <b>{children}</b> infancia(s)</span>
            </div>
            <button type="submit" className="btn btn-primary submit" disabled={busy}><IcoLink />{busy ? 'Creando…' : 'Crear y generar enlace'}</button>
          </div>
        </form>
        {result && (
          <div className="result">
            <div className="rt"><IcoCheck /> Enlace generado</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>{result.name}</div>
            <div className="link">
              <input readOnly value={result.link} />
              <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(result.link); showToast('Enlace copiado') }}><IcoCopy />Copiar</button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
