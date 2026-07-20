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
    // El click es el gesto de usuario que habilita el autoplay del audio.
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('wedding:start-audio'))
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
      {/* Anclas de escritorio (diseño "Alejandro & Carmen · Web"); ocultas en móvil */}
      <ul className="links">
        <li><a href="#historia">Nuestra historia</a></li>
        <li><a href="#boda">La boda</a></li>
        <li><a href="#lugar">El lugar</a></li>
        <li><a href="#hospedaje">Hospedaje</a></li>
      </ul>
      <div className="nav-date">07 · XI · 2026</div>
      <a className="cta" href="#rsvp">Confirmar</a>
    </nav>
  )
}

// --- Countdown ---
// `now` arranca en null para que el render del servidor y la primera pintura del
// cliente coincidan (placeholder "—"); así evitamos un desajuste de hidratación
// (React #418) por la diferencia horaria entre build y carga. El tiempo real se
// fija ya montados, en el efecto.
function Countdown() {
  const [now, setNow] = useState(null)
  useEffect(() => {
    setNow(Date.now())
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])
  let d = Math.max(0, WEDDING_TARGET - (now ?? 0))
  const days = Math.floor(d / 86400000); d -= days * 86400000
  const h = Math.floor(d / 3600000); d -= h * 3600000
  const m = Math.floor(d / 60000); d -= m * 60000
  const s = Math.floor(d / 1000)
  const ready = now !== null
  return (
    <div className="count reveal">
      <div className="u"><b>{ready ? days : '—'}</b><small>Días</small></div>
      <div className="u"><b>{ready ? String(h).padStart(2, '0') : '—'}</b><small>Horas</small></div>
      <div className="u"><b>{ready ? String(m).padStart(2, '0') : '—'}</b><small>Min</small></div>
      <div className="u"><b>{ready ? String(s).padStart(2, '0') : '—'}</b><small>Seg</small></div>
    </div>
  )
}

// --- Hero (Portada) ---
function Hero() {
  return (
    <section className="hero" id="inicio" data-screen-label="Portada">
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
    <section className="night" id="historia" data-screen-label="Primera cita y pedida">
      <div className="glow"></div>
      {/* .split: apilado en móvil (sin cambios visuales); texto | foto en escritorio */}
      <div className="split">
        <div className="split-txt">
          <div className="k reveal">Cómo empezó todo</div>
          <div className="pull reveal">Tres días<br />y un para siempre.</div>
          <p className="lead reveal">Fue en Santa María la Ribera, todo decorado de Día de Muertos y hasta con gatitos rondando. Él llegó tarde, ella tenía trencitas, y no paramos de reír en toda la cena. El vecino todavía se queja de que nos reímos demasiado en las noches.</p>
        </div>
        <div className="imgfull reveal"><img src={imgCena} alt="Alejandro y Carmen" /></div>
      </div>

      <div className="divider reveal"><span>La pregunta · Valle de Bravo</span></div>

      <h2 className="reveal" style={{ marginTop: 34 }}>En una terraza de<br /><em>Valle de Bravo.</em></h2>
      <p className="lead reveal">El &ldquo;sí&rdquo; para siempre fue en una terraza en Valle de Bravo, en su aniversario de un año de novios. Pero él lo había decidido desde los tres meses de conocerla. Él dijo las únicas palabras con las que ella aceptaría, palabra por palabra. Lo que comenzó a las 7:20 de un 6 de noviembre acabaría esa noche: ya no son novios, ahora son prometidos. Él se arrodilló, ella dijo que sí, y los dos lo sellaron con un beso.</p>
      <div className="twin reveal">
        <img src={imgPropuesta} alt="La propuesta" />
        <img src={imgAnillo} alt="El anillo y las lilis" />
      </div>
      <div className="vow reveal">
        <blockquote>&ldquo;Con esta mano sostendré tus anhelos&hellip;&rdquo;</blockquote>
        <div className="who">— La pregunta, palabra por palabra</div>
      </div>
    </section>
  )
}

// --- Boda ---
function Boda() {
  return (
    <section className="boda" id="boda" data-screen-label="Boda">
      <div className="k reveal">La boda</div>
      <h2 className="reveal">Ahora sí:<br /><em>nos casamos.</em></h2>
      <p className="lead reveal">El 7 de noviembre de 2026 lo hacemos oficial, rodeados de la gente que queremos. Cena, mezcal, brindis y la fiesta que siempre soñamos.</p>
      <div className="reggae reveal">
        <div className="tag">Aviso de la pista</div>
        <p className="big">Aquí solo se baila una cosa: reguetón.</p>
        <p className="small">Ven con los tenis puestos. La fiesta no para hasta que salga el sol.</p>
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
      <p className="lead reveal" style={{ marginTop: 22 }}>Un consejo de corazón: trae unos tenis en la bolsa para cuando se abra la pista.</p>
    </section>
  )
}

// --- Código de vestimenta ---
function Dress() {
  return (
    <section className="dress" data-screen-label="Código de vestimenta">
      <div className="k reveal">Código de vestimenta</div>
      <h2 className="reveal">Vengan muy<br /><em>formales.</em></h2>
      <p className="lead reveal">Es una celebración de etiqueta formal. Nos encantará verlos elegantes de la ceremonia a la pista.</p>
      <div className="reserved">
        <div className="rc reveal"><span className="sw white"></span><div><b>Blanco</b><small>Reservado para la novia</small></div></div>
        <div className="rc reveal"><span className="sw blue"></span><div><b>Azul</b><small>Reservado para el novio</small></div></div>
      </div>
      <p className="free reveal">Fuera de esos dos colores, libertad total: elige lo que te haga sentir increíble.</p>
    </section>
  )
}

// --- El lugar ---
function Venue() {
  return (
    <section className="venue" id="lugar" data-screen-label="El lugar">
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
    <section className="stay" id="hospedaje" data-screen-label="Hospedaje">
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
      <div className="creed reveal">
        <div className="pal" aria-hidden="true"><div className="stripes"></div><div className="tri"></div></div>
        <p className="manifesto">Creemos en el amor, en la risa fuerte y en un <b>mundo más justo.</b></p>
      </div>
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

    // Persistencia contra el backend (POST /api/rsvp). Se envía solo si hay token
    // (enlace ?i=<uuid>); la animación se dispara igual de forma optimista.
    const token = typeof window !== 'undefined' ? window.__TOKEN__ : null
    if (token) {
      const responses = party.guests.map((g) => ({
        memberId: g.id,
        attending: resp[g.id].attending === true,
        name: resp[g.id].name || '',
        diet: resp[g.id].hasDiet ? resp[g.id].diet : '',
      }))
      const plusPayload = { enabled: plus.enabled, name: plus.name, diet: plus.hasDiet ? plus.diet : '' }
      fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, responses, plus: plusPayload }),
      }).catch((err) => console.error('[rsvp] no se pudo guardar:', err))
    }

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
    <section className="rsvp" id="rsvp" data-screen-label="Confirmar">
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
  const layerRef = useRef(null)

  // Gato negro con bufanda lila (diseño "Transiciones"). Camina por la base
  // moviéndose con el usuario y, al entrar a cada sección, hace un movimiento
  // felino (sentado, mirar, lamerse). En la última sección se duerme (zzz).
  useGSAP(() => {
    const layer = layerRef.current
    if (!layer) return
    const catbox = layer.querySelector('#catbox')
    const catflip = layer.querySelector('#catflip')
    const catpose = layer.querySelector('#catpose')
    if (!catbox) return

    // Las secciones viven FUERA de .catlayer (el scope de este useGSAP), así que
    // hay que consultarlas contra el documento, no con el selector scopeado.
    const panels = Array.from(document.querySelectorAll('.device section'))
    const N = panels.length
    if (!N) return

    // Posición inicial aleatoria del gato sobre la base.
    const randX = () => Math.round(16 + Math.random() * Math.max(40, layer.clientWidth - 112))
    let curX = randX()
    gsap.set(catbox, { x: curX })

    // Con "reduce motion" el gato solo se coloca quieto: sin caminata ni poses.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const triggers = []
    const state = { active: -1, idleTl: null }

    const POSE_TARGETS = [catpose, '.cat .body', '.cat .scarf', '.cat .legF', '.cat .head', '.cat .earL', '.cat .earR', '.cat .pupil', '.cat .pupilL', '.cat .pupilR', '#zzz span']

    const resetCat = () => {
      if (state.idleTl) { state.idleTl.kill(); state.idleTl = null }
      gsap.killTweensOf(POSE_TARGETS)
      gsap.set([catpose, '.cat .body', '.cat .scarf', '.cat .legF', '.cat .head', '.cat .earL', '.cat .earR', '.cat .pupil'], { clearProps: 'all' })
      gsap.set('.cat .pupilL', { attr: { x: 54.6 }, clearProps: 'transform' })
      gsap.set('.cat .pupilR', { attr: { x: 76.6 }, clearProps: 'transform' })
      gsap.set('#zzz span', { clearProps: 'all', opacity: 0 })
    }

    const moves = {
      // sentado, atento: micro-inclinaciones de cabeza y giros de oreja (radar)
      sentado() {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 })
        tl.to('.cat .head', { rotation: 3, duration: 1.3, ease: 'sine.inOut' })
          .to('.cat .earL', { rotation: -10, duration: 0.13, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '<0.6')
          .to('.cat .head', { rotation: -2.5, duration: 1.5, ease: 'sine.inOut' }, '+=1.2')
          .to('.cat .earR', { rotation: 10, duration: 0.13, yoyo: true, repeat: 1, ease: 'power1.inOut' }, '<0.7')
          .to('.cat .head', { rotation: 0, duration: 1.1, ease: 'sine.inOut' }, '+=1')
        return tl
      },
      // seguir algo con la mirada: sobre todo pupilas, la cabeza apenas acompaña
      mirar() {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })
        tl.to(['.cat .pupilL', '.cat .pupilR'], { attr: { x: '-=2.6' }, duration: 0.35, ease: 'power2.out' })
          .to('.cat .head', { rotation: -3, duration: 0.7, ease: 'sine.inOut' }, '<')
          .to('.cat .earL', { rotation: -10, duration: 0.14, yoyo: true, repeat: 1 }, '<0.35')
          .to(['.cat .pupilL', '.cat .pupilR'], { attr: { x: '+=5.2' }, duration: 0.45, ease: 'power2.inOut' }, '+=1.1')
          .to('.cat .head', { rotation: 2.5, duration: 0.8, ease: 'sine.inOut' }, '<')
          .to('.cat .earR', { rotation: 11, duration: 0.14, yoyo: true, repeat: 1 }, '<0.4')
          .to(['.cat .pupilL', '.cat .pupilR'], { attr: { x: '-=2.6' }, duration: 0.4, ease: 'sine.inOut' }, '+=1')
          .to('.cat .head', { rotation: 0, duration: 0.7, ease: 'sine.inOut' }, '<')
        return tl
      },
      // lamerse la pata: la levanta, baja la cabeza, lametones cortos y dos pasadas
      lamerse() {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.8 })
        tl.to('.cat .legF', { rotation: -52, duration: 0.7, ease: 'power2.inOut' })
          .to('.cat .head', { rotation: 10, y: 3, duration: 0.55, ease: 'power1.inOut' }, '<0.15')
        for (let i = 0; i < 5; i++) {
          tl.to('.cat .head', { rotation: 13.5, y: 4.5, duration: 0.16, ease: 'sine.in' })
            .to('.cat .legF', { rotation: -47.5, duration: 0.16, ease: 'sine.in' }, '<')
            .to('.cat .head', { rotation: 10.5, y: 3, duration: 0.21, ease: 'sine.out' })
            .to('.cat .legF', { rotation: -52, duration: 0.21, ease: 'sine.out' }, '<')
        }
        tl.to('.cat .legF', { rotation: -66, duration: 0.5, ease: 'power1.inOut' }, '+=0.3')
          .to('.cat .head', { rotation: 14, y: 5, duration: 0.5, ease: 'power1.inOut' }, '<')
          .to('.cat .legF', { rotation: -50, duration: 0.55, ease: 'power1.inOut' })
          .to('.cat .head', { rotation: 9, y: 2.5, duration: 0.55, ease: 'power1.inOut' }, '<')
          .to('.cat .legF', { rotation: -66, duration: 0.5, ease: 'power1.inOut' })
          .to('.cat .head', { rotation: 14, y: 5, duration: 0.5, ease: 'power1.inOut' }, '<')
          .to(['.cat .legF', '.cat .head'], { rotation: 0, y: 0, duration: 0.85, ease: 'power2.inOut' }, '+=0.25')
        return tl
      },
      // acostarse a dormir: se acomoda, se recuesta, cierra los ojos, respira, zzz
      dormir() {
        const tl = gsap.timeline()
        tl.to(catpose, { x: 2, duration: 0.35, ease: 'sine.inOut' })
          .to(catpose, { x: -1.5, duration: 0.4, ease: 'sine.inOut' })
          .to(catpose, { x: 0, duration: 0.35, ease: 'sine.inOut' })
        tl.set('.cat .pupil', { animation: 'none' }, 0.3)
        tl.to('.cat .body', { scaleY: 0.8, transformOrigin: '50% 100%', duration: 1.6, ease: 'power2.inOut' }, 0.5)
          .to('.cat .legF', { scaleY: 0.45, transformOrigin: '50% 100%', duration: 1.6, ease: 'power2.inOut' }, 0.5)
          .to('.cat .scarf', { y: 6, scaleY: 0.92, transformOrigin: '50% 100%', duration: 1.6, ease: 'power2.inOut' }, 0.5)
          .to('.cat .head', { y: 10, rotation: 5, duration: 1.8, ease: 'power2.inOut' }, 0.6)
          .to('.cat .earL', { rotation: -7, duration: 1.3, ease: 'sine.inOut' }, 0.9)
          .to('.cat .earR', { rotation: 7, duration: 1.3, ease: 'sine.inOut' }, 0.9)
          .to('.cat .pupil', { scaleY: 0.07, duration: 1.5, ease: 'power2.inOut' }, 0.8)
        const breathe = gsap.timeline({ repeat: -1 })
        breathe.to('.cat .body', { scaleY: 0.835, duration: 1.9, ease: 'sine.inOut' })
          .to('.cat .body', { scaleY: 0.8, duration: 1.9, ease: 'sine.inOut' })
        const nod = gsap.timeline({ repeat: -1 })
        nod.to('.cat .head', { y: 11, duration: 1.9, ease: 'sine.inOut' })
          .to('.cat .head', { y: 10, duration: 1.9, ease: 'sine.inOut' })
        tl.add(breathe, 2.4).add(nod, 2.4)
        const zs = gsap.utils.toArray('#zzz span')
        const loop = gsap.timeline({ repeat: -1 })
        zs.forEach((z, i) => {
          loop.to(z, { opacity: 1, y: -14, duration: 1.4, ease: 'sine.out' }, i * 0.65)
            .to(z, { opacity: 0, y: -26, duration: 1, ease: 'sine.in' }, 1.2 + i * 0.65)
        })
        tl.add(loop, 2.6)
        return tl
      },
    }

    const shuffle = (a) => {
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
      return a
    }
    // un movimiento por sección; el gato se duerme en la última
    const pool = shuffle(['sentado', 'mirar', 'lamerse'])
    const assigned = []
    for (let i = 0; i < N - 1; i++) assigned.push(pool[i % pool.length])
    assigned.push('dormir')

    const walkTo = (x) => {
      const dir = x >= curX ? 1 : -1
      gsap.to(catflip, { scaleX: dir, duration: 0.18 })
      const dist = Math.abs(x - curX)
      const dur = Math.max(0.55, Math.min(1.7, dist / 210))
      const steps = Math.max(3, Math.round(dur * 5))
      const bob = gsap.timeline()
      for (let s = 0; s < steps; s++) {
        bob.to(catpose, { y: -2.6, duration: (dur / steps) * 0.5, ease: 'sine.out' })
          .to(catpose, { y: 0, duration: (dur / steps) * 0.5, ease: 'sine.in' })
      }
      curX = x
      return gsap.to(catbox, { x, duration: dur, ease: 'sine.inOut' })
    }

    const activate = (i) => {
      if (i === state.active || i < 0 || i >= N) return
      state.active = i
      resetCat()
      const walk = walkTo(randX())
      walk.eventCallback('onComplete', () => {
        if (state.active === i) state.idleTl = moves[assigned[i]]()
      })
    }

    panels.forEach((p, i) => {
      triggers.push(ScrollTrigger.create({
        trigger: p, start: 'top 55%', end: 'bottom 45%',
        onEnter: () => activate(i), onEnterBack: () => activate(i),
      }))
    })

    ScrollTrigger.refresh()
    activate(0)

    return () => {
      triggers.forEach((t) => t.kill())
      if (state.idleTl) state.idleTl.kill()
      gsap.killTweensOf(POSE_TARGETS)
      gsap.killTweensOf([catbox, catflip])
    }
  }, { scope: layerRef })

  return (
    <div className="catlayer" aria-hidden="true" ref={layerRef}>
      <div className="catbox" id="catbox">
        <div className="catflip" id="catflip">
          <div className="catpose" id="catpose">
            <svg className="cat" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g className="tail">
                <path d="M34 90 C 16 88, 8 72, 12 54 C 15 41, 27 36, 30 44 C 32 50, 25 52, 23 59 C 20 70, 28 80, 42 83 Z" fill="#4A443A" stroke="#262220" strokeWidth="3" strokeLinejoin="round" />
              </g>
              <path className="body" d="M32 94 C 27 78, 31 60, 45 51 C 55 45, 68 49, 73 61 C 77 71, 78 84, 78 94 Z" fill="#4A443A" stroke="#262220" strokeWidth="3" strokeLinejoin="round" />
              <path d="M36 92 C 36 79, 41 71, 49 68" stroke="#262220" strokeWidth="2.4" strokeLinecap="round" />
              <g className="legF">
                <path d="M61 94 L61 72 C 61 68, 70 68, 70 72 L70 94 Z" fill="#4A443A" stroke="#262220" strokeWidth="2.6" strokeLinejoin="round" />
              </g>
              <g className="scarf">
                <path d="M47 47 C 49 55, 78 55, 82 44 C 83 52, 78 59, 65 59 C 53 59, 47 54, 47 47 Z" fill="#C9A6DC" stroke="#262220" strokeWidth="2.6" strokeLinejoin="round" />
                <path d="M55 56 L52 72 C 51.5 76, 61 76, 61 72 L61 58 Z" fill="#C9A6DC" stroke="#262220" strokeWidth="2.6" strokeLinejoin="round" />
                <path d="M54 60 c 2 1.5, 4 1.5, 6 0 M53.4 64 c 2 1.5, 4.4 1.5, 6.6 0 M52.8 68 c 2 1.5, 4.8 1.5, 7.2 0" stroke="#8E6AA8" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
                <path d="M56 49 c 2 2, 4 2, 6 0 M64 51 c 2 2, 4 2, 6 0 M72 50 c 2 1.6, 4 1.6, 6 -0.5" stroke="#8E6AA8" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
              </g>
              <g className="head">
                <path d="M44 28 C 44 12, 54 7, 65 7 C 76 7, 87 12, 87 28 C 87 38, 79 45, 65 45 C 51 45, 44 38, 44 28 Z" fill="#4A443A" stroke="#262220" strokeWidth="3" strokeLinejoin="round" />
                <g className="earL"><path d="M47 18 L44 2 L60 9 Z" fill="#4A443A" stroke="#262220" strokeWidth="3" strokeLinejoin="round" /><path d="M49 14 L47.5 7 L54.5 10 Z" fill="#E8E4D8" /></g>
                <g className="earR"><path d="M84 18 L87 2 L71 9 Z" fill="#4A443A" stroke="#262220" strokeWidth="3" strokeLinejoin="round" /><path d="M82 14 L83.5 7 L76.5 10 Z" fill="#E8E4D8" /></g>
                <ellipse cx="56" cy="26" rx="6.6" ry="7.4" fill="#A8E6AC" stroke="#262220" strokeWidth="2.4" />
                <ellipse cx="78" cy="26" rx="6.6" ry="7.4" fill="#A8E6AC" stroke="#262220" strokeWidth="2.4" />
                <g className="pupil">
                  <rect className="pupilL" x="54.6" y="21.5" width="3" height="9" rx="1.5" fill="#262220" />
                  <rect className="pupilR" x="76.6" y="21.5" width="3" height="9" rx="1.5" fill="#262220" />
                </g>
                <path d="M64 35 l6 0 l-3 4 z" fill="#262220" />
                <path d="M44 31 h-9 M45 35 h-8 M87 31 h9 M86 35 h8" stroke="#262220" strokeWidth="2" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
        <div className="zzz" id="zzz"><span>z</span><span style={{ left: 10, bottom: 10 }}>z</span><span style={{ left: 20, bottom: 20 }}>z</span></div>
      </div>
    </div>
  )
}

// --- Audio de fondo con fundido cruzado ---
// "Compartir" suena desde que se abre el sobre (gesto del usuario que habilita
// el autoplay) y hace crossfade a "Tropicoqueta" al llegar a la sección Boda
// ("Ahora sí: nos casamos"). Los MP3 van en /public/audio/.
const AUDIO_VOL = 0.55

function AudioController() {
  const [muted, setMuted] = useState(false)
  const [visible, setVisible] = useState(false) // se muestra tras abrir el sobre
  const aRef = useRef(null)   // Compartir
  const bRef = useRef(null)   // Tropicoqueta
  const startedRef = useRef(false)
  const phaseRef = useRef('a')
  const mutedRef = useRef(false)

  useEffect(() => { mutedRef.current = muted }, [muted])

  // Crea los dos elementos de audio (loop, volumen inicial 0).
  useEffect(() => {
    const a = new Audio('/audio/compartir.mp3')
    const b = new Audio('/audio/tropicoqueta.mp3')
    a.loop = true; b.loop = true
    a.volume = 0; b.volume = 0
    a.preload = 'auto'; b.preload = 'auto'
    aRef.current = a; bRef.current = b
    return () => { a.pause(); b.pause(); aRef.current = null; bRef.current = null }
  }, [])

  // Arranca al abrir el sobre (evento disparado dentro del gesto de click).
  useEffect(() => {
    const start = () => {
      if (startedRef.current) return
      startedRef.current = true
      setVisible(true)
      const a = aRef.current
      if (!a) return
      a.play().then(() => {
        gsap.to(a, { volume: mutedRef.current ? 0 : AUDIO_VOL, duration: 1.4, ease: 'sine.out' })
      }).catch(() => {})
    }
    window.addEventListener('wedding:start-audio', start)
    return () => window.removeEventListener('wedding:start-audio', start)
  }, [])

  const crossfade = (to) => {
    phaseRef.current = to
    const a = aRef.current, b = bRef.current
    if (!a || !b || !startedRef.current) return
    const vol = mutedRef.current ? 0 : AUDIO_VOL
    const [inEl, outEl] = to === 'b' ? [b, a] : [a, b]
    inEl.play().catch(() => {})
    // `overwrite: true` mata cualquier tween de volumen previo sobre el mismo
    // elemento. Sin esto, un crossfade en vuelo peleaba con el fundido del
    // botón de silencio y volvía a subir el volumen (la canción "no se apagaba").
    gsap.to(inEl, { volume: vol, duration: 1.6, ease: 'sine.inOut', overwrite: true })
    gsap.to(outEl, { volume: 0, duration: 1.6, ease: 'sine.inOut', overwrite: true, onComplete: () => outEl.pause() })
  }

  // Fundido cruzado enganchado a la sección Boda.
  useGSAP(() => {
    const boda = document.querySelector('.boda')
    if (!boda) return
    const st = ScrollTrigger.create({
      trigger: boda, start: 'top 60%', end: 'max',
      onEnter: () => crossfade('b'),
      onLeaveBack: () => crossfade('a'),
    })
    return () => st.kill()
  }, [])

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m
      mutedRef.current = next
      const active = phaseRef.current === 'b' ? bRef.current : aRef.current
      if (next) {
        // `muted` nativo además del fundido: es inmediato y ningún tween en
        // vuelo puede revertirlo, así que el silencio siempre se respeta.
        for (const el of [aRef.current, bRef.current]) {
          if (!el) continue
          el.muted = true
          gsap.to(el, { volume: 0, duration: 0.4, overwrite: true })
        }
      } else if (active) {
        for (const el of [aRef.current, bRef.current]) { if (el) el.muted = false }
        active.play().catch(() => {})
        gsap.to(active, { volume: AUDIO_VOL, duration: 0.4, overwrite: true })
      }
      return next
    })
  }

  return (
    <button
      type="button"
      className={`audio-btn ${visible ? 'show' : ''} ${muted ? 'muted' : ''}`}
      onClick={toggleMute}
      aria-label={muted ? 'Activar música' : 'Silenciar música'}
      aria-pressed={muted}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M22 9l-6 6M16 9l6 6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" />
        </svg>
      )}
    </button>
  )
}

// Botón flotante que solo ven los novios (rol resuelto por su token): lleva al
// panel de accesos y confirmaciones.
function NoviosButton({ token }) {
  if (!token) return null
  return (
    <a className="novios-fab" href={`/novios?token=${encodeURIComponent(token)}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 4-5" />
      </svg>
      <span>Panel de novios</span>
    </a>
  )
}

export default function WeddingApp() {
  // Token del enlace (?i=<uuid>). Al resolverlo contra el backend se registra el
  // acceso (log de ingresos) y se personaliza el grupo. `dataKey` remonta el
  // sobre (Opener) y el RSVP cuando llegan los datos reales, sin tocar el árbol
  // que monta las animaciones GSAP (que corre una sola vez).
  const [dataKey, setDataKey] = useState('boot')
  const [noviosToken, setNoviosToken] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('i') || params.get('token')
    if (!token) return
    window.__TOKEN__ = token
    let cancel = false
    fetch(`/api/party?i=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancel || !d || !d.party) return
        window.__PARTY__ = d.party
        window.__INVITADO__ = d.party.family
        setDataKey(d.party.id)
        if (d.party.role === 'novios') setNoviosToken(token)
      })
      .catch((err) => console.error('[party] no se pudo resolver el token:', err))
    return () => { cancel = true }
  }, [])

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
      <Opener key={`op-${dataKey}`} />
      <AudioController />
      <NoviosButton token={noviosToken} />
      <div className="device">
        <Nav />
        <Hero />
        <Night />
        <Boda />
        <Plan />
        <Dress />
        <Venue />
        <Stay />
        <Gifts />
        <Values />
        <Rsvp key={`rsvp-${dataKey}`} />
        <Footer />
      </div>
      <CatWalker />
    </>
  )
}
