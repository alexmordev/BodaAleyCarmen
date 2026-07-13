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

## Fase 5 — RSVP (requiere decisión de backend)

> Backend natural: **API routes de Next.js** (`app/api/*`), al correr ya como app
> Node en Hostinger. Falta elegir la **capa de datos** (ver `tech-stack.md`).

- [x] **Modelo de datos documentado** en `tech-stack.md`: **token = UUID** opaco
      (no JWT); `Guest` (grupo/enlace con etiqueta libre, p. ej. "Familia
      Curiel-Ramírez") + `GuestMember` (nombre fijo o a llenar, `allowPlusOne`,
      `attending`, `diet`, +1). Campos `openedAt`/`confirmed`/`table`/`role`.
- [ ] Elegir y documentar la **capa de datos** (DB gestionada + Route Handlers vs.
      BaaS). *Decisión pendiente — bloquea el resto de la fase.*
- [ ] **Acceso por token en enlace único** (`?i=<uuid>`): leer el query param y
      resolver el grupo contra el backend; inyectarlo en `window.__PARTY__`.
- [ ] **Bloqueo total del sitio**: sin token válido, pantalla de acceso con una
      **imagen** (a aportar por el cliente, siguiendo `IMAGENES-PENDIENTES.md`); no
      renderizar el contenido.
- [ ] Formulario `Rsvp` **conectado** que persiste respuestas contra el token
      (la UI ya existe; falta el `POST /api/rsvp`).
- [ ] Validación de aforo (no exceder lugares reservados), estados de éxito/error.
- [ ] Panel/proceso para los novios: **carga de invitados**, **generación de
      tokens (UUID)** y **export de la lista de enlaces**.
- [ ] Vista/export de **conteo de confirmaciones**. Considerar **tres roles**:
      novios, proveedores, invitados (alcance de cada vista por definir).

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
- La **Fase 5 (RSVP)** es la única que introduce backend: no persistir respuestas
  hasta cerrar la **capa de datos** en `tech-stack.md`.

## Stoppers (bloqueos actuales)

1. **Capa de datos del RSVP sin elegir.** Bloquea persistir el formulario, el
   bloqueo por token, el panel de novios y el conteo. Backend = API routes de
   Next; falta decidir DB gestionada vs. BaaS. *(Fase 5)*
2. **Enlaces reales de regalos / sobre digital.** No hay URLs ni cuenta; el sobre
   digital probablemente requiere backend. *(Fase 4)*
3. **Casas de Airbnb concretas.** Hoy son enlaces de búsqueda por zona; faltan las
   propiedades recomendadas definitivas. *(Fase 3)*
4. **Imagen de la pantalla de bloqueo** (acceso sin token) a aportar por el cliente.
   *(Fase 5)*
5. **`scroll-snap` por sección es experimental.** Puede sentirse brusco con
   secciones más altas que el viewport; requiere QA en móvil/escritorio y decidir
   si se mantiene, se suaviza o se descarta. *(Fase 6)*
6. **Fotos reales definitivas** (nítidas a ~1200px para hero y hacienda) siguen
   pendientes según `IMAGENES-PENDIENTES.md`. *(Fase 0/1)*

## Next steps (siguiente iteración sugerida)

1. **Elegir la capa de datos** y documentarla en `tech-stack.md` (desbloquea Fase 5).
2. Implementar `app/api/rsvp` (GET resolver token → `window.__PARTY__`, POST
   persistir) y el **bloqueo por token** + pantalla de acceso.
3. **Pase de responsive de escritorio** completo (centrado/tipografía) con revisión
   del cliente, sin romper la identidad del diseño.
4. Redacción **definitiva de la historia** (pareja) y del copy final de `Values`.
5. Fijar **casas de Airbnb** y **enlaces de regalos** reales.
6. QA del `scroll-snap` y de las reacciones del gato en dispositivos reales.

## Decisiones pendientes

1. **Política de menores.** `mission.md` fija *solo adultos*, pero la nota del
   cliente incluye un ejemplo con miembro `menor`. Reconciliar copy (solo adultos)
   vs. modelo de datos (admite `type: menor`) antes de construir el backend.
2. **Capa de datos**: DB gestionada (Postgres/SQLite en Hostinger, Neon/Supabase-DB)
   con Route Handlers **vs.** BaaS (Supabase/Firebase).
3. **Roles y vistas**: alcance concreto de las vistas **novios / proveedores /
   invitados** y qué ve/puede cada token.
4. **`?i=<token>` vs. ruta `/i/<token>`**: se mantiene query param salvo necesidad.
5. **Mantener o no el `scroll-snap`** por sección tras el QA.











