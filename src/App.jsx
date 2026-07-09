// === Wedding site — réplica fiel del diseño "Alejandro & Carmen" (Claude Design) ===
import React, { useEffect, useRef, useState } from 'react'
import imgSillon from './assets/images/nosotros-sillon.jpg'
import imgCena from './assets/images/nosotros-cena.jpg'
import imgPropuesta from './assets/images/propuesta.jpg'
import imgAnillo from './assets/images/anillo-flores.jpg'
import imgHacienda from './assets/images/hacienda.webp'

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
      <div className="op-kicker">Estás invitad@ · 07 · XI · 2026</div>
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
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">A<span className="amp">&amp;</span>C</div>
      <button className="menu" aria-label="Menú"><i></i><i></i><i></i></button>
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
      <p className="sub reveal">Nos casamos donde todo se siente en calma. Y queremos que estés ahí.</p>
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

      <h2 className="reveal" style={{ marginTop: 34 }}>Ninguno de los dos<br /><em>quería cenar.</em></h2>
      <p className="lead reveal">Pero dije &ldquo;vamos a cenar&rdquo; y ella dijo que sí. Arriba estaba todo listo: la mesa, las velas, las flores, la bocina. Puse la canción, ella entró y empezó a llorar. Yo temblaba. Entonces dije las palabras que siempre soñó escuchar.</p>
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
      <p className="lead reveal" style={{ marginTop: 22 }}>Código de vestimenta: formal. Un consejo de corazón — trae unos tenis en la bolsa para la pista.</p>
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
function Stay() {
  const hotels = [
    ['1', 'Fiesta Inn Perisur', 'Aprox. 15 min · Zona sur', 'Cómodo y confiable, ideal para venir en familia.'],
    ['2', 'City Express Insurgentes Sur', 'Aprox. 20 min · Céntrico', 'Práctico y bien ubicado, perfecto para una noche.'],
    ['3', 'Radisson Paraíso Perisur', 'Aprox. 15 min · Zona sur', 'Un poco más de lujo para consentirse el fin de semana.'],
  ]
  return (
    <section className="stay" data-screen-label="Hospedaje">
      <div className="k reveal">Cerca, para que se queden</div>
      <h2 className="reveal">Dónde<br /><em>quedarse.</em></h2>
      <p className="lead reveal" style={{ marginBottom: 12 }}>Si vienes de fuera, aquí tres opciones cerca de la hacienda para que la fiesta te quede a un paso.</p>
      <div className="stay-list" style={{ marginTop: 14 }}>
        {hotels.map(([no, name, meta, desc]) => (
          <div key={no} className="hotel reveal">
            <span className="no">{no}</span>
            <div>
              <h3>{name}</h3>
              <div className="meta">{meta}</div>
              <p>{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="note reveal">Sugerencias cerca de la hacienda · confirmaremos tarifas y código de descuento pronto.</p>
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
function Rsvp() {
  const [guest] = useState(getGuestName)
  const [done, setDone] = useState(false)
  const [pulse, setPulse] = useState(false)
  const btnRef = useRef(null)
  const canvasRef = useRef(null)
  const burst = useConfetti(canvasRef)

  const confirm = () => {
    if (done) return
    setDone(true)
    setPulse(true)
    setTimeout(() => setPulse(false), 600)
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches
    if (!reduce && btnRef.current) {
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
        <b>{guest}, este día no sería lo mismo sin ustedes.</b>
      </p>
      <p className="invita reveal">
        Con mucho cariño hemos preparado esta celebración pensando en cada uno
        de nuestros invitados. Por ello, <b>esta invitación es válida únicamente
        para las personas indicadas en ella.</b> Les agradecemos su comprensión,
        ya que por cuestiones de organización <b>no podremos recibir invitados
        adicionales.</b>
      </p>
      <p className="invita adultos reveal">
        Con mucho cariño, esta celebración será <b>exclusiva para adultos.</b>
        <br />Por respeto y cuidado de las infancias.
      </p>
      <button
        ref={btnRef}
        type="button"
        className={`btn reveal ${done ? 'done' : ''} ${pulse ? 'pulse' : ''}`}
        onClick={confirm}
      >
        <span className="lbl">Confirmar asistencia</span>
        <svg className="chk" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
      </button>
      <p className="fine reveal" style={done ? { opacity: 0 } : undefined}>Agradecemos tu respuesta antes del 15 de octubre 2026</p>
      <div className={`confirmed ${done ? 'show' : ''}`}>
        <div className="seal-ok">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="msg">¡Ahí <em>estaremos</em>!<br />Gracias por decir que sí.</p>
        <p className="msg-sub">Nos vemos el 7 de noviembre</p>
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
  useEffect(() => {
    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight)
      const f = Math.min(1, Math.max(0, window.scrollY / max))
      if (ref.current) ref.current.style.left = (6 + f * 72) + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="catwrap" aria-hidden="true">
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
  // Reveal-on-scroll (idéntico al script del diseño)
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      })
    }, { threshold: 0.12 })
    const els = document.querySelectorAll('.reveal')
    els.forEach((el, i) => {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms'
      io.observe(el)
    })
    return () => io.disconnect()
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
