'use client'
// === Wedding site — réplica fiel del diseño "Alejandro & Carmen" (Claude Design) ===
import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase)

// Réplica exacta del easing del diseño: cubic-bezier(.2,.7,.2,1).
const REVEAL_EASE = CustomEase.create('reveal', 'M0,0 C0.2,0.7 0.2,1 1,1')

// Imágenes servidas desde /public/images (Next.js sirve /public en la raíz).
const imgSillon = '/images/nosotros-sillon.jpg'
const imgCena = '/images/nosotros-cena.jpg'
const imgPropuesta = '/images/propuesta.jpg'
const imgAnillo = '/images/anillo-flores.jpg'
const imgHacienda = '/images/hacienda.webp'

const WEDDING_TARGET = new Date('2026-11-07T17:30:00-06:00').getTime()

// Nombre del invitado — el backend puede inyectarlo con window.__INVITADO__,
// o llega por la URL (?invitado=Nombre). Fallback: "Familia González".
function getGuestName() {
  const injected = typeof window !== 'undefined' && window.__INVITADO__
  const fromUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('invitado')
    : null
  return (injected && String(injected).trim()) || (fromUrl && fromUrl.trim()) || 'Familia González'
}

// --- Sobre / Opener (efecto al abrir la página) ---
function Opener() {
  const [guest] = useState(getGuestName)
  const [go, setGo] = useState(false)      // solapa/carta en movimiento
  const [opened, setOpened] = useState(false) // opener desvanecido
  const [gone, setGone] = useState(false)  // opener retirado del DOM

  useEffect(() => {
    document.body.classList.add('locked')
    return () => document.body.classList.remove('locked')
  }, [])

  const open = () => {
    if (go) return
    setGo(true)
    setTimeout(() => {
      setOpened(true)
      document.body.classList.remove('locked')
    }, 2500)
    setTimeout(() => setGone(true), 3400)
  }

  if (gone) return null

  return (
    <div className={`opener ${opened ? 'opened' : ''}`}>
      <div className="halo"></div>
      <div className="op-kicker">07 · XI · 2026</div>
      <div className="env-stage">
        <div
          className={`env ${go ? 'go' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Abrir invitación"
          onClick={open}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
        >
          <div className="env-body"></div>
          <div className="letter">
            <div className="date">Sábado 7 de noviembre 2026</div>
            <h3>Alejandro <em>&amp;</em> Carmen</h3>
            <p className="hi">Con mucho cariño,<br /><b>{guest}</b>,<br />queremos que estés ahí.</p>
          </div>
          <div className="env-front"></div>
          <div className="env-addr">
            <div className="to">Para</div>
            <div className="who">{guest}</div>
          </div>
          <div className="env-flap"></div>
          <div className="seal"><b>A<em>&amp;</em>C</b></div>
        </div>
        <div className="op-hint">
          <span className="tap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11V6a2 2 0 0 1 4 0v5" /><path d="M13 8a2 2 0 0 1 4 0v6a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2l-3-4 1.5-1.2 2.5 1.4V7a2 2 0 0 1 4 0v4" /></svg>
          </span>
          <span>Toca para abrir tu invitación</span>
        </div>
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor"><path d="M0 0l9 5-9 5z" /></svg>
  )
}

function Song({ href, title, subtitle, style }) {
  return (
    <a className="song reveal" href={href} target="_blank" rel="noopener" style={style}>
      <span className="play"><PlayIcon /></span>
      <span className="meta"><b>{title}</b><small>{subtitle}</small></span>
      <span className="eq">
        <i style={{ height: 5 }}></i><i style={{ height: 10 }}></i><i style={{ height: 7 }}></i><i style={{ height: 9 }}></i>
      </span>
    </a>
  )
}

// --- Nav ---
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useGSAP(() => {
    setScrolled(window.scrollY > 20)
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => setScrolled(self.scroll() > 20),
    })
  }, [])
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">A<span className="amp">&amp;</span>C</div>
      <div className="nav-date">07 · XI · 2026</div>
    </nav>
  )
}

// --- Countdown ---
function Countdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])
  let d = Math.max(0, WEDDING_TARGET - now)
  const days = Math.floor(d / 86400000); d -= days * 86400000
  const h = Math.floor(d / 3600000); d -= h * 3600000
  const m = Math.floor(d / 60000); d -= m * 60000
  const s = Math.floor(d / 1000)
  return (
    <div className="count reveal">
      <div className="u"><b>{days}</b><small>Días</small></div>
      <div className="u"><b>{String(h).padStart(2, '0')}</b><small>Horas</small></div>
      <div className="u"><b>{String(m).padStart(2, '0')}</b><small>Min</small></div>
      <div className="u"><b>{String(s).padStart(2, '0')}</b><small>Seg</small></div>
    </div>
  )
}

// --- Hero (Portada) ---
function Hero() {
  return (
    <section className="hero" data-screen-label="Portada">
      <div className="eyebrow reveal">Sábado · 7 de noviembre 2026 · 17:30</div>
      <h1 className="reveal">Alejandro<br /><em>&amp;</em> Carmen</h1>
      <p className="sub reveal">Nos casamos y queremos que estés ahí..</p>
      <div className="heroimg reveal">
        <img src={imgSillon} alt="Alejandro y Carmen" />
      </div>
      <Countdown />
    </section>
  )
}

// --- Primera cita + pedida ---
function Night() {
  return (
    <section className="night" data-screen-label="Primera cita y pedida">
      <div className="glow"></div>
      <div className="k reveal">Cómo empezó todo</div>
      <div className="pull reveal">Tres días<br />y un para siempre.</div>
      <p className="lead reveal">Fue en Santa María la Ribera, todo decorado de Día de Muertos y hasta con gatitos rondando. Él llegó tarde, ella tenía trencitas, y no paramos de reír en toda la cena. El vecino todavía se queja de que nos reímos demasiado en las noches.</p>
      <Song href="https://open.spotify.com/search/A%20Thousand%20Years%20Christina%20Perri" title="A Thousand Years" subtitle="La que suena en nosotros" />
      <div className="imgfull reveal"><img src={imgCena} alt="Alejandro y Carmen" /></div>

      <div className="divider reveal"><span>La pregunta · Valle de Bravo</span></div>

      <h2 className="reveal" style={{ marginTop: 34 }}>Una cena<br /><em>que lo cambió todo.</em></h2>
      <p className="lead reveal">Arriba estaba todo listo: la mesa, las velas, las flores, la bocina esperando. Puse la canción, ella entró y empezó a llorar. Yo temblaba. Entonces dije las palabras que siempre soñó escuchar.</p>
      <div className="twin reveal">
        <img src={imgPropuesta} alt="La propuesta" />
        <img src={imgAnillo} alt="El anillo y las lilis" />
      </div>
      <div className="vow reveal">
        <blockquote>&ldquo;Con esta mano sostendré tus anhelos&hellip;&rdquo;</blockquote>
        <div className="who">— La pregunta, palabra por palabra</div>
      </div>
      <Song href="https://open.spotify.com/search/The%20Story%20Brandi%20Carlile" title="The Story · Brandi Carlile" subtitle="La que también nos cuenta" />
    </section>
  )
}

// --- Boda ---
function Boda() {
  return (
    <section className="boda" data-screen-label="Boda">
      <div className="k reveal">La boda</div>
      <h2 className="reveal">Ahora sí:<br /><em>nos casamos.</em></h2>
      <p className="lead reveal">El 7 de noviembre de 2026 lo hacemos oficial, rodeados de la gente que queremos. Cena, mezcal, brindis y la fiesta que siempre soñamos.</p>
      <div className="reggae reveal">
        <div className="tag">Aviso de la pista</div>
        <p className="big">Aquí solo se baila una cosa: reguetón.</p>
        <p className="small">Ven con los tenis puestos. La fiesta no para hasta que salga el sol.</p>
        <Song href="https://open.spotify.com/search/Compartir%20Carla%20Morrison" title="Compartir · Carla Morrison" subtitle="Antes de que se prenda todo" style={{ marginTop: 16 }} />
      </div>
    </section>
  )
}

// --- Logística ---
function Plan() {
  const rows = [
    ['17:30', 'Ceremonia', 'En los jardines de la hacienda'],
    ['18:30', 'Cóctel de bienvenida', 'Mezcal, música y saludos'],
    ['19:00', 'Cena y brindis', 'Sentados, con los que queremos'],
    ['20:00', 'Se abre la pista', 'Ya sabes qué se baila aquí'],
  ]
  return (
    <section className="plan" data-screen-label="Logística">
      <div className="k reveal">Logística</div>
      <h2 className="reveal">7 de noviembre,<br /><em>minuto a minuto.</em></h2>
      <div className="plan-rows" style={{ marginTop: 24 }}>
        {rows.map(([t, title, desc]) => (
          <div key={t} className="row reveal">
            <b>{t}</b>
            <div className="d">{title}<small>{desc}</small></div>
          </div>
        ))}
      </div>
      <div className="dresscode reveal">
        <div className="tag">Código de vestimenta</div>
        <p className="big">Formal</p>
        <p className="small">Ellas, vestido largo o cóctel; ellos, traje. Un consejo de corazón: trae unos tenis en la bolsa para cuando se abra la pista.</p>
      </div>
    </section>
  )
}

// --- El lugar ---
function Venue() {
  return (
    <section className="venue" data-screen-label="El lugar">
      <div className="k reveal">El lugar</div>
      <img className="reveal" src={imgHacienda} alt="Hacienda La Esmeralda" />
      <h3 className="reveal">Hacienda La Esmeralda</h3>
      <p className="addr reveal">Xochitepetl 422, Santa María Tepepan,<br />Xochimilco, 16020 · Ciudad de México</p>
      <a className="maplink reveal" href="https://maps.google.com/?q=Hacienda+La+Esmeralda+Xochitepetl+422+Santa+Maria+Tepepan+Xochimilco" target="_blank" rel="noopener">Ver en el mapa</a>
    </section>
  )
}

// --- Hospedaje ---
// Opciones de Airbnb económicas y amplias, pensadas para familias grandes que
// viajan juntas. Los enlaces son de búsqueda por zona hasta fijar casas concretas.
function Stay() {
  const stays = [
    ['1', 'Casa amplia en Xochimilco', 'Aprox. 10 min · Hasta 10 personas', 'Casa completa con varias recámaras: ideal para que toda la familia se hospede junta y reparta el costo.', 'https://www.airbnb.mx/s/Xochimilco--CDMX/homes?adults=8&room_types%5B%5D=Entire%20home%2Fapt'],
    ['2', 'Departamento familiar zona sur', 'Aprox. 15 min · Hasta 6 personas', 'Económico y bien ubicado, perfecto para un grupo mediano que quiere estar cerca de la hacienda.', 'https://www.airbnb.mx/s/Tlalpan--CDMX/homes?adults=6&room_types%5B%5D=Entire%20home%2Fapt'],
    ['3', 'Casa con jardín para grupos', 'Aprox. 20 min · Hasta 12 personas', 'Espacio grande con áreas comunes: la opción más rendidora si vienen muchos primos y tíos.', 'https://www.airbnb.mx/s/Coyoacan--CDMX/homes?adults=10&room_types%5B%5D=Entire%20home%2Fapt'],
  ]
  return (
    <section className="stay" data-screen-label="Hospedaje">
      <div className="k reveal">Cerca, para que se queden</div>
      <h2 className="reveal">Dónde<br /><em>quedarse.</em></h2>
      <p className="lead reveal" style={{ marginBottom: 12 }}>Si vienes de fuera y con toda la familia, estas son <b>casas y departamentos completos en Airbnb</b> cerca de la hacienda — económicos y amplios para que se hospeden juntos y compartan gastos.</p>
      <div className="stay-list" style={{ marginTop: 14 }}>
        {stays.map(([no, name, meta, desc, href]) => (
          <a key={no} className="hotel reveal" href={href} target="_blank" rel="noopener">
            <span className="no">{no}</span>
            <div>
              <h3>{name}</h3>
              <div className="meta">{meta}</div>
              <p>{desc}</p>
            </div>
          </a>
        ))}
      </div>
      <p className="note reveal">Enlaces de búsqueda por zona · fijaremos casas concretas recomendadas pronto.</p>
    </section>
  )
}

// --- Regalos ---
function Gifts() {
  return (
    <section className="gifts" data-screen-label="Regalos">
      <div className="k reveal" style={{ justifyContent: 'center' }}>Regalos</div>
      <h2 className="reveal">Tu presencia ya es<br /><em>regalo suficiente.</em></h2>
      <div className="money reveal">
        <div className="ic">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1-5 3.2S9 9.5 12 10s5 1.3 5 3.5-2.2 3.3-5 3.3-5-1-5-3" />
          </svg>
        </div>
        <p>Si de todos modos quieres consentirnos, lo que más nos ayudaría es un <b>regalo en efectivo para nuestra luna de miel</b>. Cada aporte nos acerca al viaje que soñamos juntos.</p>
      </div>
    </section>
  )
}

// --- Valores ---
function Values() {
  return (
    <section className="values" data-screen-label="Valores">
      <div className="glow"></div>
      <div className="eyebrow reveal">Lo que nos mueve</div>
      <p className="manifesto reveal">Creemos en el amor, en la risa fuerte y en un <b>mundo más justo.</b></p>
      <div className="after reveal">Eso también se celebra</div>
    </section>
  )
}

// --- Confeti / pétalos que estallan al confirmar ---
const CONFETTI_PAL = ['#8A6FB8', '#6E5497', '#B79BDE', '#F7F4EF', '#EFEAE2', '#C9A9E8']

function useConfetti(canvasRef) {
  const state = useRef({ parts: [], raf: null, dpr: 1, W: 0, H: 0 })

  return (cx, cy) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const s = state.current

    const resize = () => {
      s.dpr = Math.min(2, window.devicePixelRatio || 1)
      s.W = canvas.width = window.innerWidth * s.dpr
      s.H = canvas.height = window.innerHeight * s.dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }

    const draw = () => {
      ctx.clearRect(0, 0, s.W, s.H)
      let alive = 0
      for (const p of s.parts) {
        p.life++; if (p.life > p.ttl) continue; alive++
        p.vy += p.g; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr
        const fade = Math.max(0, 1 - (p.life / p.ttl))
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col
        if (p.round) { ctx.beginPath(); ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2); ctx.fill() }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (alive > 0) { s.raf = requestAnimationFrame(draw) }
      else { s.raf = null; s.parts = []; ctx.clearRect(0, 0, s.W, s.H); canvas.style.display = 'none' }
    }

    resize(); canvas.style.display = 'block'
    const N = 150
    for (let i = 0; i < N; i++) {
      const ang = Math.random() * Math.PI * 2
      const spd = (4 + Math.random() * 10) * s.dpr
      s.parts.push({
        x: cx * s.dpr, y: cy * s.dpr,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - (5 + Math.random() * 7) * s.dpr,
        g: (0.18 + Math.random() * 0.14) * s.dpr,
        w: (6 + Math.random() * 8) * s.dpr, h: (9 + Math.random() * 10) * s.dpr,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        col: CONFETTI_PAL[(Math.random() * CONFETTI_PAL.length) | 0],
        life: 0, ttl: 90 + Math.random() * 50, round: Math.random() < 0.5,
      })
    }
    if (!s.raf) s.raf = requestAnimationFrame(draw)
  }
}

// --- RSVP ---
// Opciones del dropdown de restricciones alimentarias (solo se muestra si el
// invitado marca que tiene alguna).
const DIET_OPTIONS = [
  'Vegetariano',
  'Vegano',
  'Sin gluten / celíaco',
  'Alergia (especificar)',
  'Otra (especificar)',
]

// Estructura del "party" (grupo del invitado). En producción la inyecta el
// backend en window.__PARTY__ tras resolver el token (?i=<uuid>). Mientras no
// haya backend, se deriva un grupo mínimo del nombre del invitado.
//   party = {
//     family: 'Familia Curiel-Ramírez',   // descripción del enlace
//     allowPlusOne: false,                 // ¿pueden llevar +1?
//     guests: [
//       { id, name, principal?, editable? } // editable => nombre a llenar en el form
//     ],
//   }
function getParty() {
  const injected = typeof window !== 'undefined' && window.__PARTY__
  if (injected && Array.isArray(injected.guests) && injected.guests.length) return injected
  const guest = getGuestName()
  return {
    family: guest,
    allowPlusOne: false,
    guests: [{ id: 'p', name: guest, principal: true }],
  }
}

function initResponses(party) {
  const r = {}
  party.guests.forEach((g) => {
    r[g.id] = { attending: null, name: g.editable ? '' : g.name, hasDiet: false, diet: '' }
  })
  return r
}

// Fila de un invitado en el formulario.
function GuestRow({ guest, value, onChange, onReact }) {
  const setAttend = (v) => { onChange({ attending: v }); onReact(v ? 'happy' : 'sad') }
  return (
    <div className={`grow ${guest.principal ? 'principal' : ''}`}>
      <div className="grow-top">
        <div className="who">
          {guest.editable ? (
            <input
              className="name-in"
              type="text"
              placeholder="Nombre del invitado"
              value={value.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          ) : (
            <span className="name">{guest.name}</span>
          )}
          {guest.principal && <span className="badge">Invitado principal</span>}
        </div>
        <div className="yn" role="group" aria-label={`¿Asistirá ${guest.name}?`}>
          <button type="button" className={`yn-b yes ${value.attending === true ? 'on' : ''}`} onClick={() => setAttend(true)}>Sí</button>
          <button type="button" className={`yn-b no ${value.attending === false ? 'on' : ''}`} onClick={() => setAttend(false)}>No</button>
        </div>
      </div>
      {value.attending === true && (
        <div className="grow-diet">
          <label className="chk-line">
            <input type="checkbox" checked={value.hasDiet} onChange={(e) => onChange({ hasDiet: e.target.checked, diet: '' })} />
            <span>Tiene alguna restricción alimentaria</span>
          </label>
          {value.hasDiet && (
            <select className="diet-sel" value={value.diet} onChange={(e) => onChange({ diet: e.target.value })}>
              <option value="">Selecciona…</option>
              {DIET_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
        </div>
      )}
    </div>
  )
}

function Rsvp() {
  const [party] = useState(getParty)
  const [resp, setResp] = useState(() => initResponses(party))
  const [plus, setPlus] = useState({ enabled: false, name: '', hasDiet: false, diet: '' })
  const [open, setOpen] = useState(false)      // modal "¿Quién asiste?" abierto
  const [step, setStep] = useState('form')     // 'form' | 'review' (leyenda de repaso)
  const [summary, setSummary] = useState({ going: [], notGoing: [] })
  const [done, setDone] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [declined, setDeclined] = useState(false)
  const btnRef = useRef(null)                  // botón que dispara el modal (origen del confeti)
  const canvasRef = useRef(null)
  const burst = useConfetti(canvasRef)

  const setGuest = (id, patch) => setResp((r) => ({ ...r, [id]: { ...r[id], ...patch } }))
  const react = (mood) => {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('cat:react', { detail: { mood } }))
  }

  // Bloquea el scroll del body mientras el cuadro emergente está abierto y
  // permite cerrarlo con la tecla Escape.
  useEffect(() => {
    if (!open) return
    document.body.classList.add('modal-open')
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Paso 1 → 2: valida el formulario y arma la leyenda de repaso (reemplaza al
  // antiguo window.confirm nativo).
  const review = () => {
    if (done) return

    // Validación: todos deben tener respuesta Sí/No.
    const pending = party.guests.filter((g) => resp[g.id].attending == null)
    if (pending.length) {
      window.alert('Por favor indica para cada invitado si asistirá o no antes de confirmar.')
      return
    }
    // Nombres sin llenar en invitados editables.
    const missingName = party.guests.find((g) => g.editable && resp[g.id].attending && !resp[g.id].name.trim())
    if (missingName) { window.alert('Escribe el nombre de cada invitado que asistirá.'); return }
    if (plus.enabled && !plus.name.trim()) { window.alert('Escribe el nombre de tu acompañante.'); return }

    // Construir resumen quién va / quién no ({ name, note, diet }).
    const going = []
    const notGoing = []
    party.guests.forEach((g) => {
      const r = resp[g.id]
      const name = (g.editable ? r.name.trim() : g.name) || g.name
      if (r.attending) going.push({ name, diet: r.hasDiet && r.diet ? r.diet : '' })
      else notGoing.push({ name })
    })
    if (plus.enabled && plus.name.trim()) {
      going.push({ name: plus.name.trim(), note: 'acompañante', diet: plus.hasDiet && plus.diet ? plus.diet : '' })
    }

    setSummary({ going, notGoing })
    setStep('review')
  }

  // Paso 2: envía la confirmación y dispara la animación.
  const submit = () => {
    if (done) return

    // TODO(backend): POST /api/rsvp con { token, resp, plus }. Sin backend aún,
    // solo se ejecuta la animación local.
    const anyGoing = summary.going.length > 0
    setDeclined(!anyGoing)
    setOpen(false)          // cerrar el cuadro emergente
    setDone(true)
    setPulse(true)
    setTimeout(() => setPulse(false), 600)
    react(anyGoing ? 'party' : 'sad')

    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches
    if (anyGoing && !reduce && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      burst(r.left + r.width / 2, r.top + r.height / 2)
      setTimeout(() => {
        if (!btnRef.current) return
        const r2 = btnRef.current.getBoundingClientRect()
        burst(r2.left + r2.width / 2, r2.top + r2.height / 2)
      }, 260)
    }
  }

  return (
    <section className="rsvp" data-screen-label="Confirmar">
      <div className="eyebrow reveal" style={{ color: 'var(--lila)', marginBottom: 16 }}>Confirmación</div>
      <h2 className="reveal">¿Nos acompañas?</h2>
      <p className="invita reveal">
        <b>{party.family}, este día no sería lo mismo sin ustedes.</b>
      </p>
      <p className="invita reveal">
        Esta invitación es válida únicamente para las personas indicadas abajo.
        Les agradecemos su comprensión, ya que por cuestiones de organización
        <b> no podremos recibir invitados adicionales.</b>
      </p>
      <p className="invita adultos reveal">
        Con mucho cariño, esta celebración será <b>exclusiva para adultos.</b>
        <br />Por respeto y cuidado de las infancias.
      </p>

      <button
        ref={btnRef}
        type="button"
        className={`btn reveal ${done ? 'done' : ''} ${pulse ? 'pulse' : ''}`}
        onClick={() => { setStep('form'); setOpen(true) }}
        style={done ? { display: 'none' } : undefined}
      >
        <span className="lbl">¿Quién asiste?</span>
        <svg className="chk" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
      </button>
      <p className="fine reveal" style={done ? { opacity: 0 } : undefined}>Agradecemos tu respuesta antes del 15 de octubre 2026</p>

      {/* Cuadro emergente: ¿Quién asiste? */}
      {open && (
        <div className="rsvp-modal" role="dialog" aria-modal="true" aria-labelledby="rsvp-modal-title" onClick={() => setOpen(false)}>
          <div className="rsvp-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="rsvp-dialog-head">
              <div>
                <div className="rsvp-dialog-k">Confirmación</div>
                <h3 id="rsvp-modal-title">{step === 'review' ? 'Confirma tu respuesta' : '¿Quién asiste?'}</h3>
              </div>
              <button type="button" className="rsvp-close" aria-label="Cerrar" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <div className="rsvp-dialog-body">
              {step === 'form' ? (
                <>
                  <p className="rsvp-dialog-note">Indícanos quién de tu grupo nos acompañará y si tiene alguna restricción alimentaria.</p>
                  <div className="rsvp-form">
                    {party.guests.map((g) => (
                      <GuestRow
                        key={g.id}
                        guest={g}
                        value={resp[g.id]}
                        onChange={(patch) => setGuest(g.id, patch)}
                        onReact={react}
                      />
                    ))}

                    {party.allowPlusOne && (
                      <div className="grow plusone">
                        <label className="chk-line">
                          <input
                            type="checkbox"
                            checked={plus.enabled}
                            onChange={(e) => { setPlus((p) => ({ ...p, enabled: e.target.checked })); react(e.target.checked ? 'happy' : 'sad') }}
                          />
                          <span>Llevaré un acompañante</span>
                        </label>
                        {plus.enabled && (
                          <>
                            <input
                              className="name-in"
                              type="text"
                              placeholder="Nombre de tu acompañante"
                              value={plus.name}
                              onChange={(e) => setPlus((p) => ({ ...p, name: e.target.value }))}
                            />
                            <div className="grow-diet">
                              <label className="chk-line">
                                <input type="checkbox" checked={plus.hasDiet} onChange={(e) => setPlus((p) => ({ ...p, hasDiet: e.target.checked, diet: '' }))} />
                                <span>Tiene alguna restricción alimentaria</span>
                              </label>
                              {plus.hasDiet && (
                                <select className="diet-sel" value={plus.diet} onChange={(e) => setPlus((p) => ({ ...p, diet: e.target.value }))}>
                                  <option value="">Selecciona…</option>
                                  {DIET_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rsvp-review">
                  <p className="rsvp-dialog-note">Revisa que todo esté bien antes de enviarnos tu respuesta.</p>
                  {summary.going.length > 0 && (
                    <div className="rev-group">
                      <div className="rev-group-h yes">
                        <span className="rev-ic" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                        </span>
                        Asistirán ({summary.going.length})
                      </div>
                      <ul className="rev-list">
                        {summary.going.map((p, i) => (
                          <li key={`g${i}`}>
                            <span className="rev-name">
                              {p.name}
                              {p.note && <span className="rev-tag">{p.note}</span>}
                            </span>
                            {p.diet && <span className="rev-diet">{p.diet}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.notGoing.length > 0 && (
                    <div className="rev-group">
                      <div className="rev-group-h no">
                        <span className="rev-ic" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </span>
                        No podrán ({summary.notGoing.length})
                      </div>
                      <ul className="rev-list">
                        {summary.notGoing.map((p, i) => (
                          <li key={`n${i}`}><span className="rev-name">{p.name}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rsvp-dialog-foot">
              {step === 'form' ? (
                <button type="button" className="btn" onClick={review}>
                  <span className="lbl">Continuar</span>
                </button>
              ) : (
                <div className="rsvp-foot-actions">
                  <button type="button" className="btn ghost" onClick={() => setStep('form')}>
                    <span className="lbl">Volver a editar</span>
                  </button>
                  <button type="button" className="btn" onClick={submit}>
                    <span className="lbl">Enviar confirmación</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={`confirmed ${done ? 'show' : ''}`}>
        <div className="seal-ok">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        {declined ? (
          <>
            <p className="msg">Gracias por <em>avisarnos</em>.<br />Los vamos a extrañar.</p>
            <p className="msg-sub">Con cariño, Alejandro &amp; Carmen</p>
          </>
        ) : (
          <>
            <p className="msg">¡Ahí <em>estaremos</em>!<br />Gracias por decir que sí.</p>
            <p className="msg-sub">Nos vemos el 7 de noviembre</p>
          </>
        )}
      </div>
      <canvas id="confetti" ref={canvasRef}></canvas>
    </section>
  )
}

// --- Footer ---
function Footer() {
  return (
    <footer>
      <div className="lg">Alejandro <span className="amp">&amp;</span> Carmen</div>
      <div className="carino">con cariño, de Nayarit a la CDMX</div>
      07 · 11 · 2026
    </footer>
  )
}

// --- Gato estilo "El Cadáver de la Novia" ---
function CatWalker() {
  const ref = useRef(null)
  const wrapRef = useRef(null)

  // Camina (mueve las patas) solo mientras hay scroll; se detiene al quedar quieto.
  // La posición horizontal (6% → 78%) va enganchada al progreso de scroll con
  // scrub; el respeto a prefers-reduced-motion se delega en gsap.matchMedia.
  useGSAP(() => {
    let idle = null
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(ref.current, {
        left: '78%',
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: 'max',
          scrub: 0.3,
          onUpdate: () => {
            const el = wrapRef.current
            if (!el) return
            el.classList.add('walking')
            clearTimeout(idle)
            idle = setTimeout(() => wrapRef.current && wrapRef.current.classList.remove('walking'), 180)
          },
        },
      })
    })
    return () => clearTimeout(idle)
  }, { scope: wrapRef })

  // Reacciones ante las selecciones del RSVP (happy / sad / party).
  useEffect(() => {
    let t = null
    const onReact = (e) => {
      const mood = (e.detail && e.detail.mood) || 'happy'
      const el = wrapRef.current
      if (!el) return
      el.classList.remove('react-happy', 'react-sad', 'react-party')
      // reflow para reiniciar la animación aunque sea el mismo mood
      void el.offsetWidth
      el.classList.add('react-' + mood)
      clearTimeout(t)
      t = setTimeout(() => el && el.classList.remove('react-happy', 'react-sad', 'react-party'), mood === 'party' ? 1600 : 900)
    }
    window.addEventListener('cat:react', onReact)
    return () => { window.removeEventListener('cat:react', onReact); clearTimeout(t) }
  }, [])

  return (
    <div className="catwrap" ref={wrapRef} aria-hidden="true">
      <div className="cat-path"></div>
      <svg ref={ref} className="cat" viewBox="0 0 100 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="tail">
          <path d="M14 66 C 2 62, 0 44, 8 34 C 12 29, 20 30, 20 37 C 20 43, 12 43, 12 50 C 12 58, 22 60, 26 62 Z" fill="#6E5497" stroke="#3A2F48" strokeWidth="1.5" />
        </g>
        <g className="body-bob">
          {/* patas lejanas (lado opuesto) — más oscuras y detrás del cuerpo, en fase diagonal */}
          <g className="legBfar"><rect x="36" y="60" width="5.5" height="22" rx="2.75" fill="#5A4680" stroke="#3A2F48" strokeWidth="1.2" /></g>
          <g className="legFfar"><rect x="52" y="60" width="5.5" height="24" rx="2.75" fill="#5A4680" stroke="#3A2F48" strokeWidth="1.2" /></g>
          {/* patas cercanas */}
          <g className="legB"><rect x="30" y="60" width="6" height="24" rx="3" fill="#6E5497" stroke="#3A2F48" strokeWidth="1.5" /></g>
          <g className="legF"><rect x="58" y="60" width="6" height="26" rx="3" fill="#7B60A6" stroke="#3A2F48" strokeWidth="1.5" /></g>
          <path d="M20 62 C 18 44, 30 34, 50 34 C 72 34, 80 46, 78 64 C 77 74, 66 76, 50 76 C 34 76, 22 74, 20 62 Z" fill="#7B60A6" stroke="#3A2F48" strokeWidth="1.6" />
          <path d="M40 40 v10 M44 39 v12 M48 39 v12 M52 40 v10" stroke="#3A2F48" strokeWidth="1" opacity="0.5" />
          <path d="M56 30 C 56 16, 88 16, 88 32 C 88 46, 74 50, 66 48 C 59 46, 56 40, 56 30 Z" fill="#7B60A6" stroke="#3A2F48" strokeWidth="1.6" />
          <path d="M58 20 L 54 6 L 66 16 Z" fill="#6E5497" stroke="#3A2F48" strokeWidth="1.4" />
          <path d="M80 18 L 86 4 L 88 20 Z" fill="#6E5497" stroke="#3A2F48" strokeWidth="1.4" />
          <ellipse cx="66" cy="30" rx="6.5" ry="8" fill="#F3EEFA" stroke="#3A2F48" strokeWidth="1.2" />
          <ellipse cx="80" cy="30" rx="6.5" ry="8" fill="#F3EEFA" stroke="#3A2F48" strokeWidth="1.2" />
          <g className="pupil" style={{ transformOrigin: '73px 31px' }}>
            <circle cx="67" cy="31" r="2.6" fill="#2C2530" />
            <circle cx="81" cy="31" r="2.6" fill="#2C2530" />
          </g>
          <path d="M72 39 l3 0 l-1.5 2 z" fill="#C24B7A" />
        </g>
      </svg>
    </div>
  )
}

export default function WeddingApp() {
  // Scroll con GSAP: reveal-on-scroll (mismo fade+translateY y stagger que el
  // diseño) + parallax sutil en las imágenes con contenedor overflow:hidden.
  useGSAP(() => {
    document.documentElement.classList.add('js-gsap')
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Reveal: se anima por lotes al entrar en viewport, con stagger de 70 ms.
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: REVEAL_EASE,
          stagger: 0.07,
          overwrite: true,
        }),
      })

      // Parallax sutil. Solo imágenes cuyo contenedor recorta el desborde
      // (.heroimg y .night .imgfull); se escalan un pelín para no ver bordes.
      gsap.utils.toArray('.heroimg img, .night .imgfull img').forEach((img) => {
        gsap.set(img, { scale: 1.12 })
        gsap.fromTo(img,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
          },
        )
      })
    })

    // El opener bloquea el scroll (~3.4 s); al liberarlo cambia la altura útil,
    // así que recalculamos las medidas de ScrollTrigger.
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 3600)
    return () => {
      clearTimeout(refresh)
      document.documentElement.classList.remove('js-gsap')
    }
  }, [])

  return (
    <>
      <Opener />
      <div className="device">
        <Nav />
        <Hero />
        <Night />
        <Boda />
        <Plan />
        <Venue />
        <Stay />
        <Gifts />
        <Values />
        <Rsvp />
        <Footer />
      </div>
      <CatWalker />
    </>
  )
}
