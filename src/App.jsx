// === Wedding components ===
import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react'

// --- Logo / Monogram ---
function Monogram({ size = 22, style = "serif", className = "" }) {
  return (
    <span className={`logo-wrap ${className}`} data-style={style} style={{ fontSize: size }}>
      A<span className="amp">&</span>C
    </span>
  );
}

// --- Cat SVG silhouettes ---
const CatSvg = ({ size = 28, color = "#1A1714" }) => (
  <svg width={size} height={size * 0.68} viewBox="0 0 100 68" fill="none">
    {/* sitting cat silhouette */}
    <path d="M22 22 L18 6 L28 16 L40 14 Q50 13 60 14 L72 16 L82 6 L78 22 Q88 30 88 44 Q88 58 78 60 L22 60 Q12 58 12 44 Q12 30 22 22 Z" fill={color}/>
    <circle cx="38" cy="32" r="2" fill="#FAF8F5"/>
    <circle cx="62" cy="32" r="2" fill="#FAF8F5"/>
  </svg>
);

const CatWalkSvg = ({ size = 36 }) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 160 100" fill="none">
    {/* walking cat */}
    <path d="M20 70 Q20 50 40 48 L100 48 Q130 48 135 60 L142 50 L140 70 L150 75 L138 78 Q132 85 120 85 L40 85 Q20 85 20 70 Z" fill="#1A1714"/>
    <path d="M20 70 L8 76 L12 84 L22 80" fill="#1A1714"/>
    <path d="M132 48 L130 32 L136 38 L142 30 L142 46" fill="#1A1714"/>
    <path d="M148 30 L150 18 L154 28 L160 24 L158 40" fill="#1A1714"/>
    <circle cx="148" cy="58" r="1.5" fill="#FAF8F5"/>
    <rect x="35" y="85" width="3" height="10" fill="#1A1714"/>
    <rect x="55" y="85" width="3" height="10" fill="#1A1714"/>
    <rect x="95" y="85" width="3" height="10" fill="#1A1714"/>
    <rect x="115" y="85" width="3" height="10" fill="#1A1714"/>
  </svg>
);

const PawSvg = ({ size = 16, color = "#CD96D6" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="12" cy="16" rx="5" ry="4"/>
    <ellipse cx="6" cy="10" rx="2" ry="2.5"/>
    <ellipse cx="18" cy="10" rx="2" ry="2.5"/>
    <ellipse cx="9" cy="6" rx="1.7" ry="2.2"/>
    <ellipse cx="15" cy="6" rx="1.7" ry="2.2"/>
  </svg>
);

// --- Countdown ---
function Countdown({ target }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const units = [
    { n: d, l: "Días" },
    { n: h, l: "Horas" },
    { n: m, l: "Min" },
    { n: s, l: "Seg" },
  ];
  return (
    <div className="countdown">
      {units.map((u, i) => (
        <Fragment key={u.l}>
          <div className="countdown-unit">
            <div className="countdown-num">{String(u.n).padStart(2, "0")}</div>
            <div className="countdown-label">{u.l}</div>
          </div>
          {i < units.length - 1 && <span className="countdown-sep">·</span>}
        </Fragment>
      ))}
    </div>
  );
}

// --- Nav ---
function Nav({ logoStyle }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["#galeria", "Galería"],
    ["#historia", "Historia"],
    ["#cuando", "Detalles"],
    ["#itinerario", "Itinerario"],
    ["#hoteles", "Hoteles"],
    ["#regalos", "Regalos"],
    ["#rsvp", "RSVP"],
  ];
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <a href="#top" aria-label="Inicio">
        <Monogram size={22} style={logoStyle} />
      </a>
      <div className="nav-links">
        {links.map(([h, l]) => (
          <a key={h} href={h}>{l}</a>
        ))}
      </div>
      <div className="nav-date">07.11.2026</div>
    </nav>
  );
}

// --- Hero ---
function Hero({ logoStyle }) {
  const target = new Date("2026-11-07T17:00:00-06:00").getTime();
  return (
    <section className="hero" id="top">
      <div className="hero-left">
        <div className="hero-meta">
          <div className="eyebrow">Sábado<span className="dot"></span>7 nov 2026<span className="dot"></span>17:00</div>
          <div className="serif-italic" style={{ fontSize: "20px", color: "var(--ink-soft)" }}>
            Hacienda Esmeralda · Ciudad de México
          </div>
        </div>
        <div className="hero-title">
          <h1 className="h1">
            Alejandro<br/>
            <span className="amp">&</span> Carmen
          </h1>
        </div>
        <div className="hero-bottom">
          <Countdown target={target} />
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Confirma asistencia</div>
            <a href="#rsvp" className="serif-italic" style={{ fontSize: 18, color: "var(--primary-deep)", borderBottom: "1px solid var(--primary)" }}>antes del 15 de octubre →</a>
          </div>
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-img-wrap">
          <div className="placeholder"><span>Foto principal · Pedida</span></div>
          <div className="hero-img-tag">VALLE DE BRAVO · 2026</div>
        </div>
      </div>
    </section>
  );
}

// --- Gallery ---
function Gallery() {
  const photos = [
    { tag: "01", cap: "“No podíamos posar.”", loc: "Valle de Bravo" },
    { tag: "02", cap: "Justo antes del sí.", loc: "Mirador" },
    { tag: "03", cap: "Risa de la buena.", loc: "" },
    { tag: "04", cap: "El anillo.", loc: "" },
    { tag: "05", cap: "Mil años, una canción.", loc: "" },
    { tag: "06", cap: "Inseparables.", loc: "" },
    { tag: "07", cap: "Y el resto fue ayer.", loc: "06.11.2024" },
  ];
  return (
    <section className="section" id="galeria">
      <div className="shell">
        <div className="sec-head">
          <div>
            <div className="sec-num">01 · La pedida</div>
          </div>
          <div>
            <h2 className="h2">Un fin de semana<br/><span className="serif-italic">en Valle de Bravo.</span></h2>
            <p className="lead" style={{ marginTop: 20 }}>
              Siete fotos del día que decidimos no soltarnos nunca.
            </p>
          </div>
        </div>
        <div className="gallery">
          {photos.map((p, i) => (
            <div key={i} className={`gal gal-${i + 1}`}>
              <div className="gal-tag">{p.tag}{p.loc ? ` · ${p.loc}` : ""}</div>
              <div className="gal-cap">{p.cap}</div>
              {i === 4 && (
                <span className="egg-cat" data-egg style={{ bottom: 18, right: 18 }}>
                  <CatSvg size={26} color="#1A1714" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Story ---
function Story() {
  return (
    <section className="section" id="historia" style={{ background: "var(--bg-warm)" }}>
      <div className="shell">
        <div className="sec-head">
          <div><div className="sec-num">02 · Nuestra historia</div></div>
          <div>
            <h2 className="h2">Tres días<br/><span className="serif-italic">y un para siempre.</span></h2>
          </div>
        </div>
        <div className="story-grid">
          <div className="story-text">
            <p>
              Nos conocimos el 6 de noviembre de 2024. Lo que iba a ser un café se convirtió
              en una primera cita de tres días seguidos — y, sin darnos cuenta, en la única
              cita que necesitamos. Desde entonces no hemos vuelto a soltarnos.
            </p>
            <p>
              Dos años después, en Valle de Bravo, sonó <em>I love you for a thousand years</em>
              de fondo. Intentamos posar para la foto y no pudimos: nos dio risa, como siempre.
              Entre carcajadas — porque entre nosotros casi todo es un chiste — apareció el anillo.
            </p>
            <p>
              Ahora queremos celebrarlo con ustedes. Sin guion, sin pose, con la misma risa
              de siempre.
            </p>
          </div>
          <div className="story-aside">
            <div className="story-fact">
              <div className="label">Primer día</div>
              <div className="val">06 · 11 · <span className="accent">2024</span></div>
            </div>
            <div className="story-fact">
              <div className="label">Pedida</div>
              <div className="val">Valle de Bravo<br/><span className="accent serif-italic">a mil años de distancia</span></div>
            </div>
            <div className="story-fact">
              <div className="label">Nuestra canción</div>
              <div className="val serif-italic">A Thousand Years</div>
            </div>
            <div className="story-fact">
              <div className="label">Tercer integrante</div>
              <div className="val serif-italic">Mishka <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 6 }}><PawSvg size={16}/></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- When/Where ---
function WhenWhere() {
  const mapSrc = "https://www.openstreetmap.org/export/embed.html?bbox=-99.1180%2C19.2630%2C-99.0980%2C19.2780&layer=mapnik&marker=19.2705%2C-99.1080";
  return (
    <section className="section" id="cuando">
      <div className="shell">
        <div className="sec-head">
          <div><div className="sec-num">03 · Cuándo y dónde</div></div>
          <div>
            <h2 className="h2">Hacienda<br/><span className="serif-italic">Esmeralda.</span></h2>
            <p className="lead" style={{ marginTop: 20 }}>
              Una sola sede para la ceremonia religiosa, la civil y la fiesta. Te recomendamos llegar 30 minutos antes.
            </p>
          </div>
        </div>
        <div className="venue-grid">
          <div className="venue-info">
            <div className="venue-row">
              <div className="k">Fecha</div>
              <div className="v">Sábado 7 de noviembre, 2026<small>Llegada sugerida: 16:30 hrs</small></div>
            </div>
            <div className="venue-row">
              <div className="k">Ceremonia</div>
              <div className="v">Religiosa & Civil<small>17:00 — 18:30 hrs · misma sede</small></div>
            </div>
            <div className="venue-row">
              <div className="k">Recepción</div>
              <div className="v">Cóctel, cena y baile<small>19:00 — 03:00 hrs</small></div>
            </div>
            <div className="venue-row">
              <div className="k">Dirección</div>
              <div className="v">Hacienda Esmeralda<small>Xochitepetl 422, Santa María Tepepan,<br/>Xochimilco, 16020 CDMX</small></div>
            </div>
            <div className="venue-actions">
              <a className="btn btn-primary" href="https://maps.google.com/?q=Xochitepetl+422+Santa+Maria+Tepepan+Xochimilco" target="_blank" rel="noopener">
                Cómo llegar →
              </a>
              <a className="btn btn-ghost" href="https://haciendalaesmeralda.mx/" target="_blank" rel="noopener">
                Ver el lugar
              </a>
            </div>
          </div>
          <div className="map-wrap">
            <iframe src={mapSrc} title="Mapa Hacienda Esmeralda" loading="lazy"></iframe>
            <div className="map-pin"><div className="dot"></div><div className="stick"></div></div>
            <div className="map-overlay">
              <div className="name">Hacienda Esmeralda</div>
              <div className="coords">19.270°N · 99.108°W</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Itinerary ---
function Itinerary() {
  const items = [
    { t: "16:30", title: "Llegada", desc: "Recibimiento con agua de jamaica fría" },
    { t: "17:00", title: "Ceremonia religiosa", desc: "Capilla principal" },
    { t: "18:00", title: "Ceremonia civil", desc: "Jardín central" },
    { t: "18:45", title: "Cóctel", desc: "Mezcales, mocktails y canapés" },
    { t: "20:00", title: "Cena", desc: "Mesa asignada · ver sección de mesas" },
    { t: "21:30", title: "Primer baile", desc: "“A Thousand Years”" },
    { t: "22:00", title: "Pista abierta", desc: "DJ + banda en vivo" },
    { t: "00:30", title: "Tornaboda", desc: "Tacos, pozole y café" },
    { t: "03:00", title: "Despedida", desc: "Hasta siempre" },
  ];
  return (
    <section className="section" id="itinerario" style={{ background: "var(--bg-warm)" }}>
      <div className="shell">
        <div className="sec-head">
          <div><div className="sec-num">04 · Itinerario</div></div>
          <div><h2 className="h2">El día,<br/><span className="serif-italic">hora por hora.</span></h2></div>
        </div>
        <div className="itinerary">
          {items.map((it, i) => (
            <div key={i} className="itin-row">
              <div className="itin-time">{it.t}</div>
              <div className="itin-evt">
                <div className="t">{it.title}</div>
                <div className="d">{it.desc}</div>
              </div>
              <div className="itin-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="#CD96D6" strokeWidth="1"/>
                  <circle cx="10" cy="10" r="2" fill="#CD96D6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Hotels ---
function Hotels() {
  const hotels = [
    { tier: "Recomendado", name: "Hotel Boutique Xochimilco", meta: ["A 8 min · 4.2 km", "Código: BODA-AC2026"], price: "$2,400", note: "MXN / noche", link: "#" },
    { tier: "Cercano", name: "Hacienda La Noria", meta: ["A 12 min · 6.1 km", "Hospedaje colonial"], price: "$1,950", note: "MXN / noche", link: "#" },
    { tier: "Económico", name: "Hostal del Barrio", meta: ["A 15 min · 7.4 km", "Habitaciones privadas"], price: "$1,200", note: "MXN / noche", link: "#" },
  ];
  return (
    <section className="section" id="hoteles">
      <div className="shell">
        <div className="sec-head">
          <div><div className="sec-num">05 · Dónde quedarse</div></div>
          <div>
            <h2 className="h2">Cerca,<br/><span className="serif-italic">para que se queden.</span></h2>
            <p className="lead" style={{ marginTop: 20 }}>
              Tres opciones con tarifa preferencial para invitados. Reserva con el código <code style={{fontFamily:"var(--mono)", color:"var(--primary-deep)"}}>BODA-AC2026</code>.
            </p>
          </div>
        </div>
        <div className="hotels">
          {hotels.map((h, i) => (
            <a key={i} href={h.link} className="hotel-card">
              <div className="hotel-img"><div className="label">Hotel · {String(i+1).padStart(2,"0")}</div></div>
              <div className="hotel-tier">{h.tier}</div>
              <div className="hotel-name">{h.name}</div>
              <div className="hotel-meta">
                {h.meta.map((m, j) => <span key={j}>{m}</span>)}
              </div>
              <div className="hotel-foot">
                <div className="hotel-price">{h.price}<small> {h.note}</small></div>
                <div className="hotel-link">Reservar →</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Dress code ---
function DressCode() {
  const palette = [
    { hex: "#AD96D6", name: "Lavanda" },
    { hex: "#CD96D6", name: "Lila" },
    { hex: "#D696BF", name: "Rosa" },
    { hex: "#BFD696", name: "Verde" },
    { hex: "#96D6AD", name: "Menta" },
  ];
  return (
    <section className="section" id="dress" style={{ background: "var(--bg-warm)" }}>
      <div className="shell">
        <div className="sec-head">
          <div><div className="sec-num">06 · Dress code</div></div>
          <div><h2 className="h2">Etiqueta<br/><span className="serif-italic">por confirmar.</span></h2></div>
        </div>
        <div className="dress-grid">
          <div>
            <div className="dress-pending">
              <small>Estamos finalizando</small>
              Te avisaremos pronto, pero ve apartando algo elegante para una boda al atardecer.
            </div>
            <div style={{ marginTop: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Paleta sugerida<span className="dot"></span>para los invitados</div>
              <div className="swatch-row">
                {palette.map(p => (
                  <div key={p.hex} className="swatch">
                    <div className="chip" style={{ background: p.hex }}></div>
                    <div className="hex">{p.hex.replace("#", "")}</div>
                  </div>
                ))}
              </div>
              <p className="body" style={{ maxWidth: "44ch", marginTop: 16 }}>
                Inspiración para tu outfit: tonos lila, rosa pálido y verdes suaves combinan con la decoración del día.
              </p>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Lo que sí queremos<span className="dot"></span>y lo que no</div>
            <ul className="dress-list">
              <li><span className="check">✓</span><span><b>Sí:</b> traje, vestido largo o midi, tonos suaves de la paleta.</span></li>
              <li><span className="check">✓</span><span><b>Sí:</b> zapato cómodo — habrá pista, jardín y mucha pista.</span></li>
              <li><span className="check">✗</span><span><b>No:</b> blanco, marfil o crema (gracias por reservarlos para la novia).</span></li>
              <li><span className="check">✗</span><span><b>No:</b> jeans, tenis blancos ni shorts.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Tables ---
function Tables() {
  const guests = [
    { name: "Ana López", table: 1 },
    { name: "Andrés García", table: 4 },
    { name: "Carlos Hernández", table: 6 },
    { name: "Diana Ruiz", table: 2 },
    { name: "Familia Mendoza", table: 3 },
    { name: "Familia Torres", table: 8 },
    { name: "Fernando Castro", table: 5 },
    { name: "Gabriela Vega", table: 7 },
    { name: "Jorge Pérez", table: 1 },
    { name: "Laura Domínguez", table: 9 },
    { name: "Luis Ramírez", table: 11 },
    { name: "María Fernández", table: 10 },
    { name: "Mauricio Soto", table: 12 },
    { name: "Patricia Núñez", table: 4 },
    { name: "Rodrigo Aguilar", table: 6 },
    { name: "Sofía Reyes", table: 2 },
    { name: "Valeria Ortiz", table: 8 },
    { name: "Víctor Salazar", table: 3 },
  ];
  const [q, setQ] = useState("");
  const found = useMemo(() => {
    if (!q.trim()) return null;
    return guests.find(g => g.name.toLowerCase().includes(q.trim().toLowerCase()));
  }, [q]);
  return (
    <section className="section" id="mesas">
      <div className="shell">
        <div className="sec-head">
          <div><div className="sec-num">07 · Mesas</div></div>
          <div>
            <h2 className="h2">Encuentra<br/><span className="serif-italic">tu mesa.</span></h2>
            <p className="lead" style={{ marginTop: 20 }}>
              Escribe tu nombre completo (o el de quien te invitó) para ver dónde te tocó.
            </p>
          </div>
        </div>
        <div className="tables-wrap">
          <div className="tables-search">
            <span className="icn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-4.35-4.35"/></svg>
            </span>
            <input
              type="text"
              placeholder="Tu nombre · ej: Ana López"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          {found && (
            <div className="tables-result show">
              <div className="label">Te toca</div>
              <div className="name">{found.name}</div>
              <div className="table-num">Mesa {String(found.table).padStart(2, "0")}<small>Salón principal · 8 lugares</small></div>
            </div>
          )}
          {q.trim() && !found && (
            <div className="tables-result show">
              <div className="label">Sin resultados</div>
              <div className="name serif-italic" style={{ fontStyle: "italic" }}>No encontramos ese nombre.</div>
              <p className="body" style={{ marginTop: 12 }}>Escríbenos por WhatsApp y lo resolvemos al instante.</p>
            </div>
          )}
          <div style={{ marginTop: 32 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Mapa de salón<span className="dot"></span>vista superior</div>
            <div className="tables-grid">
              {Array.from({ length: 12 }).map((_, i) => {
                const num = i + 1;
                const isActive = found && found.table === num;
                return (
                  <div key={num} className={`tbl ${isActive ? "active" : ""}`}>
                    {String(num).padStart(2, "0")}<small>mesa</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Gifts ---
function Gifts() {
  const gifts = [
    { num: "01", name: "Liverpool", desc: "Mesa de regalos tradicional con artículos para nuestra primera casa.", code: "Evento: 5147892", link: "#" },
    { num: "02", name: "Amazon", desc: "Lista curada con todo lo que nos hace falta — desde lo práctico hasta el capricho.", code: "Lista: A&C-2026", link: "#" },
    { num: "03", name: "Luna de miel", desc: "Si prefieres aportar al viaje que estamos planeando, este es el sobre digital.", code: "Vía transferencia", link: "#" },
  ];
  return (
    <section className="section" id="regalos" style={{ background: "var(--bg-warm)" }}>
      <div className="shell">
        <div className="sec-head">
          <div><div className="sec-num">08 · Mesa de regalos</div></div>
          <div>
            <h2 className="h2">Tu presencia<br/><span className="serif-italic">ya es regalo.</span></h2>
            <p className="lead" style={{ marginTop: 20 }}>
              Pero si quieres consentirnos, dejamos tres opciones — la que prefieras está bien.
            </p>
          </div>
        </div>
        <div className="gifts-grid">
          {gifts.map(g => (
            <a key={g.num} href={g.link} className="gift-card">
              <div className="num">{g.num}</div>
              <div className="name">{g.name}</div>
              <div className="desc">{g.desc}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.08em" }}>{g.code}</div>
              <div className="link">Ver opciones <span className="arrow">→</span></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- App ---
function PhotoApp() {
  return (
    <section className="section" id="app">
      <div className="shell">
        <div className="sec-head">
          <div><div className="sec-num">09 · App de fotos</div></div>
          <div>
            <h2 className="h2">Tus fotos,<br/><span className="serif-italic">en un solo álbum.</span></h2>
          </div>
        </div>
        <div className="app-grid">
          <div className="app-info">
            <h3>Toda la noche, con todos.</h3>
            <p className="body-lg">
              Descarga la app, ingresa el código del evento y todas las fotos que tomes esa noche
              entran al álbum compartido en tiempo real. Sin etiquetas, sin perderse nada.
            </p>
            <div className="app-steps">
              <div className="app-step">
                <div className="n">01</div>
                <div className="t">Descarga <b>POV</b> en App Store o Google Play.</div>
              </div>
              <div className="app-step">
                <div className="n">02</div>
                <div className="t">Abre la app e ingresa el código <b>AYC1107</b>.</div>
              </div>
              <div className="app-step">
                <div className="n">03</div>
                <div className="t">Toma fotos durante la boda — se suben automáticamente.</div>
              </div>
              <div className="app-step">
                <div className="n">04</div>
                <div className="t">Al día siguiente recibes el álbum completo en tu correo.</div>
              </div>
            </div>
            <div className="app-cta-row">
              <a className="btn btn-primary" href="#">Descargar iOS →</a>
              <a className="btn" href="#">Descargar Android →</a>
            </div>
          </div>
          <div>
            <div className="app-phone">
              <div className="app-screen">
                <div className="top">
                  <div className="lg">A & C · 7 nov</div>
                  <div className="sm">128 fotos · en vivo</div>
                </div>
                <div className="photogrid">
                  {Array.from({ length: 12 }).map((_, i) => <div key={i}></div>)}
                </div>
                <div className="cta">+ Tomar foto</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- RSVP ---
function RSVP() {
  const phone = "5215512345678"; // placeholder
  const msg = encodeURIComponent("¡Hola! Confirmo asistencia a la boda de A&C el 7 de noviembre.\n\nNombre:\nAcompañantes:\nRestricciones alimenticias:");
  return (
    <section className="section" id="rsvp" style={{ padding: "0", background: "var(--bg)" }}>
      <div className="shell" style={{ padding: 0 }}>
        <div className="rsvp-wrap">
          <div>
            <div className="eyebrow">RSVP<span className="dot"></span>Confirmación</div>
            <h2 className="h2" style={{ marginTop: 16 }}>¿Vienes<br/><span className="serif-italic">a celebrarnos?</span></h2>
            <p className="lead">
              Necesitamos confirmar tu lugar y el de tus acompañantes para acomodar todo
              con calma. Nos escribes por WhatsApp y listo.
            </p>
            <div className="rsvp-deadline">Confirma antes del 15 de octubre 2026</div>
          </div>
          <div className="rsvp-actions">
            <a className="rsvp-btn" href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noopener">
              <span className="l">
                <span className="lt">Sí, ahí estaremos</span>
                <span className="ls">Whatsapp · respuesta inmediata</span>
              </span>
              <span style={{ fontSize: 22 }}>→</span>
            </a>
            <a className="rsvp-btn" href={`https://wa.me/${phone}?text=${encodeURIComponent("Hola, lamentablemente no podré asistir a la boda. ¡Mucha felicidad!")}`} target="_blank" rel="noopener">
              <span className="l">
                <span className="lt">No podré ir</span>
                <span className="ls">Te mandaremos un abrazo</span>
              </span>
              <span style={{ fontSize: 22 }}>→</span>
            </a>
            <a className="rsvp-btn" href={`https://wa.me/${phone}?text=${encodeURIComponent("Hola, tengo una duda sobre la boda...")}`} target="_blank" rel="noopener">
              <span className="l">
                <span className="lt">Tengo una pregunta</span>
                <span className="ls">Sobre logística, hoteles, etc.</span>
              </span>
              <span style={{ fontSize: 22 }}>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Footer ---
function Footer({ logoStyle }) {
  return (
    <footer className="footer">
      <div className="footer-mark">
        <Monogram size={56} style={logoStyle} />
      </div>
      <div className="footer-date">07 · 11 · 2026 · Ciudad de México</div>
      <div className="footer-fine">
        Hecho con <span className="heart">♥</span> en CDMX · y supervisado por Mishka <PawSvg size={11}/>
      </div>
    </footer>
  );
}

// --- Music control ---
function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  useEffect(() => {
    audioRef.current = new Audio();
    // No actual audio source — but we expose toggle and a note
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
  }, []);
  const toggle = () => {
    setPlaying(p => {
      const next = !p;
      // No real source; just visual indication
      return next;
    });
  };
  return (
    <button className={`music-toggle ${playing ? "playing" : ""}`} onClick={toggle} title='“A Thousand Years”'>
      <span className="bars">
        <span></span><span></span><span></span><span></span>
      </span>
      {playing ? "A Thousand Years · pausar" : "Reproducir nuestra canción"}
    </button>
  );
}

// --- Cat walker on scroll ---
function CatWalker() {
  const [x, setX] = useState(-200);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let lastScroll = window.scrollY;
    let timer;
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (Math.abs(dy) > 5) {
        setVisible(true);
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = window.scrollY / docH;
        setX(-160 + pct * (window.innerWidth + 320));
      }
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 1500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={`cat-walker ${visible ? "visible" : ""}`} style={{ transform: `translateX(${x}px)` }}>
      <CatWalkSvg size={40} />
    </div>
  );
}

// --- Egg modal ---
function EggModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="egg-found" onClick={onClose}>
      <div style={{ fontSize: 80 }}><CatSvg size={100} color="#CD96D6"/></div>
      <h3>Encontraste a Mishka.</h3>
      <p>
        Nuestro tercer integrante. Estará feliz de verlos esa noche — bueno, en realidad estará
        durmiendo en casa, pero estará espiritualmente presente.
      </p>
      <button className="btn btn-primary" onClick={onClose}>Seguir explorando</button>
    </div>
  );
}

export default function WeddingApp() {
  const logoStyle = "serif";
  const [eggOpen, setEggOpen] = useState(false);

  // Egg click delegation
  useEffect(() => {
    const onClick = (e) => {
      const t = e.target.closest("[data-egg]");
      if (t) { e.preventDefault(); setEggOpen(true); }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Reveal-on-scroll
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("in");
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".section").forEach(el => {
      el.classList.add("reveal");
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Nav logoStyle={logoStyle} />
      <Hero logoStyle={logoStyle} />
      <Gallery />
      <Story />
      <WhenWhere />
      <Itinerary />
      <Hotels />
      <DressCode />
      <Tables />
      <Gifts />
      <PhotoApp />
      <RSVP />
      <Footer logoStyle={logoStyle} />
      <MusicToggle />
      <CatWalker />
      <EggModal open={eggOpen} onClose={() => setEggOpen(false)} />
    </>
  );
}
