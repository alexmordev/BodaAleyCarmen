# Roadmap — A&C Wedding

Enfoque acordado con el cliente: **equilibrado por secciones**. Se avanza sección
por sección (Hero → Nosotros/Night → Boda → Plan → Venue/Stay → Gifts → RSVP),
dejando cada una completa (contenido real + estilo + responsive) antes de pasar a
la siguiente. Las fases son pequeñas y entregables por sí solas.

Leyenda: `[ ]` pendiente · `[~]` en progreso · `[x]` hecho.
Cada fase debería caber en un PR pequeño hacia `develop`.

---

## Fase 0 — Cimientos y saneamiento

- [x] React + Vite en producción, despliegue a Hostinger vía rama `production`.
      (Migrado a Next.js app Node; `production` obsoleta — ver `tech-stack.md`.)
- [x] Actualizar `scripts/process-assets.mjs` a los nombres de asset actuales
      **o** documentarlo como obsoleto. → Documentado obsoleto en
      `IMAGENES-PENDIENTES.md` y `CLAUDE.md`.
- [x] Resolver `IMAGENES-PENDIENTES.md`: inventario de qué fotos reales faltan.
- [~] Verificar build limpio y responsive base en móvil (referencia de diseño).
      `next build` compila; falta QA visual móvil con las fotos reales.

## Fase 1 — Sección Hero + Nav + Countdown

- [x] Foto real del hero (`nosotros-sillon.jpg`) sustituyendo placeholder.
- [x] Verificar cuenta regresiva (`Countdown`) al 2026-11-07 17:30 CST.
      `WEDDING_TARGET = 2026-11-07T17:30:00-06:00` → correcto.
- [x] Nav en móvil. Se **quitó el botón de menú** (no aportaba) y se sustituyó por
      la fecha. Es un sitio de scroll único, no requiere anclas de navegación.

## Fase 2 — Sección "Nuestra historia" (Night + Boda)

- [~] Textos reales de la historia (primera cita / la pedida). Se **reescribió** la
      sección que decía *"Ninguno de los dos quería cenar"* (contradictoria) por
      *"Una cena que lo cambió todo"*. **Falta la redacción definitiva** de la
      pareja (ver Decisiones pendientes).
- [x] Fotos reales: `nosotros-cena.jpg`, `propuesta.jpg`, `anillo-flores.jpg`.
- [~] Ajuste fino de estilo sin alterar la identidad del diseño.
- [ ] **Agregar la canción** de la historia/pedida ("Puse la canción, ella
      entró…"). Existen los estilos `.song` sin usar y el `AudioController` de
      fondo; falta decidir e implementar: reproductor visible con la canción
      concreta, o integrarla en el crossfade de audio. Requiere el MP3 y el
      título/artista definitivos del cliente (colocar en `public/audio/`).

## Fase 3 — Logística: Plan + Venue + Stay

- [x] Agenda del evento (horarios) en `Plan`.
- [x] `Venue`: foto real (`hacienda.webp`), dirección y **mapa / cómo llegar**
      (enlace a Google Maps).
- [x] `Stay`: cambiado a **Airbnb económicos y amplios para familias grandes** cerca
      de la zona (tarjetas ahora enlazan a búsquedas por zona).
      **Falta fijar casas concretas** recomendadas (ver Next steps).
- [x] **Código de vestimenta (dress code)** — colocado como bloque propio y claro
      dentro de `Plan` ("Formal" + guía).
- [x] **Aviso "solo adultos / sin niños"** — comunicado con tacto en el RSVP.
- [x] **Formulario RSVP por invitado (UI, sin persistencia).** Cada miembro del
      grupo con toggle **Sí/No** (énfasis visual en el invitado principal),
      **dropdown de restricciones alimentarias** que solo aparece al marcar el
      checkbox, **+1 opcional** (primero activa el acompañante, luego nombre y
      restricciones), y **`window.confirm` con el resumen quién va / quién no**
      antes de la animación. La persistencia contra el token es Fase 5.
- [x] **Quitar el botón de menú** del nav (no servía).
- [x] **Quitar "Estás invitad@"** de la carta inicial (`Opener`).
- [~] **Mejorar el responsive de escritorio** (texto centrado, etc.). Form RSVP
      centrado y nuevos bloques encajados en la columna; **falta un pase completo**
      de tipografía/centrado de escritorio con el ojo del cliente (ver Next steps).

## Fase 4 — Mesa de regalos (Gifts)

- [~] Copys y estilo de la sección `Gifts` (regalo en efectivo para luna de miel).
- [ ] Enlaces reales: lista de regalos / transferencia / **sobre digital**.
- [ ] Todos los enlaces salientes verificados. El **sobre digital** requiere
      backend (ver Fase 5 y Stoppers).

## Fase 5 — RSVP (backend)

> **Capa de datos decidida y montada:** MySQL gestionada en Hostinger + Route
> Handlers de Next.js (`app/api/*`) con el driver **mysql2** (sin ORM). Esquema,
> migraciones y endpoints documentados en `schema_database.md` y `tech-stack.md`.

- [x] **Modelo de datos documentado** en `tech-stack.md` y `schema_database.md`:
      **token = UUID** opaco; `guests` (grupo/enlace) + `guest_members` (persona)
      + `roles`, `access_logs` y `rsvp_submissions`.
- [x] **Capa de datos elegida y documentada:** MySQL (Hostinger) + `mysql2` +
      migraciones SQL versionadas (`db/migrations/`, runner `scripts/migrate.mjs`).
- [x] **Migraciones creadas** (`001_roles` … `005_rsvp_submissions`) y runner
      idempotente con tabla de control `_migrations`. Semilla en `scripts/seed.mjs`.
- [x] **Acceso por token en enlace único** (`?i=<uuid>`): `GET /api/party` resuelve
      el grupo, registra el ingreso y el front lo inyecta en `window.__PARTY__`.
- [x] Formulario `Rsvp` **conectado**: `POST /api/rsvp` persiste respuestas,
      restricciones y +1 contra el token; guarda auditoría en `rsvp_submissions`.
- [x] **Log de ingresos** (`access_logs`): quién entró, a qué hora y cuántas veces
      (también intentos con token inválido).
- [x] **Roles** (`roles`: novios / proveedor / invitado). El rol **novios** ve un
      botón *Panel de novios* y entra a `/novios`.
- [x] **Panel de novios** (`/novios`): accesos (resumen por familia: veces, primer
      y último ingreso), conteo de confirmaciones, restricciones y **alta de
      invitados con generación de token + enlace** (`/api/admin/*`).
- [ ] **Correr las migraciones contra la BD de Hostinger** (`npm run migrate`) con
      las credenciales reales en `.env`. *Requiere credenciales + Remote MySQL.*
- [ ] **Bloqueo total del sitio**: sin token válido, pantalla de acceso con una
      **imagen** (a aportar por el cliente, `IMAGENES-PENDIENTES.md`); hoy el sitio
      cae a un grupo de respaldo — falta el bloqueo real y la pantalla de acceso.
- [ ] **Validación de aforo** (no exceder `seats_adults`/`seats_children`) y
      estados de éxito/error visibles en el formulario.
- [ ] **Export de la lista de enlaces** (CSV/copiar todo) desde el panel de novios
      (hoy se copia enlace por enlace).
- [ ] Definir el **alcance de la vista de proveedores** (rol `proveedor` ya existe).

## Fase 6 — Valores, cierre y pulido

- [ ] Sección `Values` con contenido final.
- [ ] `Footer` con datos de contacto/agradecimiento.
- [~] Revisar animación del gato (`CatWalker`) en todas las secciones:
  - [x] El gato **solo mueve las patas mientras camina** (al hacer scroll); en
        reposo queda de pie (cola y parpadeo siguen).
  - [x] Se ve un **camino** (`.cat-path`) que recorre el gato al avanzar.
  - [x] **Scroll por sección** con `scroll-snap` (proximity, ≥768px) — *experimental*,
        requiere QA (ver Stoppers).
  - [x] El gato **reacciona** a las selecciones del RSVP (`happy`/`sad`/`party`) vía
        evento `cat:react`.

## Fase 7 — Calidad y lanzamiento

- [ ] Pase de responsive y rendimiento (imágenes optimizadas, LCP móvil).
- [ ] Accesibilidad básica (contraste, foco, textos alternativos).
- [ ] SEO/social: `<title>`, meta y tarjeta al compartir el enlace.
- [ ] QA end-to-end del RSVP en producción.
- [ ] Compartir el enlace final con los invitados.

---

## Notas de dependencias

- Las Fases 1–4 y 6 son **estáticas** y pueden avanzar en cualquier orden.
- La **Fase 5 (RSVP)** introduce el backend. La **capa de datos ya está decidida y
  montada** (MySQL Hostinger + `mysql2` + migraciones); ya no bloquea al resto.

## Backlog consolidado (pendientes de todas las secciones)

Reúne en tareas accionables lo que estaba disperso en *Stoppers*, *Next steps* y
*Decisiones*. Marcar aquí a medida que se cierren.

**Backend / datos (Fase 5)**
- [ ] Correr `npm run migrate` contra Hostinger con credenciales reales en `.env`
      (habilitar *Remote MySQL* si se corre desde fuera del servidor).
- [ ] **Bloqueo total por token** + pantalla de acceso (necesita imagen del cliente).
- [ ] Validación de **aforo** (`seats_adults`/`seats_children`) y estados éxito/error.
- [ ] **Export de enlaces** (CSV / copiar todo) en el panel de novios.
- [ ] Definir **alcance de la vista de proveedores** (rol `proveedor`).
- [ ] Decidir `?i=<token>` vs. ruta `/i/<token>` (por ahora se mantiene query param).

**Contenido y copy**
- [ ] **Agregar la canción** de la historia/pedida (ver Fase 2; requiere MP3 + título).
- [ ] Redacción **definitiva de la historia** (pareja).
- [ ] Copy final de la sección `Values` (Fase 6).
- [ ] `Footer` con datos de contacto/agradecimiento (Fase 6).

**Regalos (Fase 4)**
- [ ] Enlaces reales: lista de regalos / transferencia / **sobre digital**
      (el sobre digital puede requerir backend).

**Logística (Fase 3)**
- [ ] Fijar **casas de Airbnb concretas** (hoy son búsquedas por zona).

**Diseño / QA**
- [ ] **Pase de responsive de escritorio** completo (centrado/tipografía) con el
      cliente, sin romper la identidad del diseño.
- [ ] QA del `scroll-snap` (experimental) y de las reacciones del gato en
      dispositivos reales; decidir si se mantiene, suaviza o descarta.
- [ ] **Fotos reales definitivas** (~1200px nítidas para hero y hacienda) según
      `IMAGENES-PENDIENTES.md`.

**Calidad y lanzamiento (Fase 7)**
- [ ] Rendimiento (imágenes optimizadas, LCP móvil), accesibilidad básica,
      SEO/social, QA end-to-end del RSVP en producción y reparto final de enlaces.

## Decisiones (estado)

1. **Política de menores.** ✅ Resuelto: el **copy público es "solo adultos / sin
   infancias"**, pero el esquema admite `type: menor` y `seats_children` para el
   caso de menores de la familia. Copy y datos quedan reconciliados.
2. **Capa de datos.** ✅ Resuelto: **MySQL gestionada en Hostinger + Route Handlers
   con `mysql2`** (sin ORM), migraciones SQL versionadas. Ver `schema_database.md`.
3. **Roles y vistas.** Parcial: existen **novios / proveedor / invitado**; novios
   con panel `/novios` implementado. Falta definir el **alcance de proveedores**.
4. **`?i=<token>` vs. `/i/<token>`.** Se mantiene el query param salvo necesidad.








