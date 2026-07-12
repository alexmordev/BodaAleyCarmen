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
- [x] Actualizar `scripts/process-assets.mjs` a los nombres de asset actuales
      (`nosotros-sillon.jpg`, `nosotros-cena.jpg`, `propuesta.jpg`,
      `anillo-flores.jpg`, `hacienda.webp`) **o** documentarlo como obsoleto.
- [x] Resolver `IMAGENES-PENDIENTES.md`: inventario de qué fotos reales faltan.
- [ ] Verificar build limpio y responsive base en móvil (referencia de diseño).

## Fase 1 — Sección Hero + Nav + Countdown

- [x] Foto real del hero (`nosotros-sillon.jpg`) sustituyendo placeholder.
- [ ] Verificar cuenta regresiva (`Countdown`) al 2026-11-07 17:30 CST.
- [ ] Nav y anclas a secciones funcionando en móvil.

## Fase 2 — Sección "Nuestra historia" (Night + Boda)

- [ ] Textos reales de la historia (primera cita / la pedida).
- [x] Fotos reales: `nosotros-cena.jpg`, `propuesta.jpg`, `anillo-flores.jpg`.
- [ ] Ajuste fino de estilo sin alterar la identidad del diseño.
Nota: Hay que cambiar el texto de toda la seccion de ninguno de los dos quería cenar. 
## Fase 3 — Logística: Plan + Venue + Stay

- [x] Agenda del evento (horarios) en `Plan`.
- [x] `Venue`: foto real (`hacienda.webp`), dirección y **mapa / cómo llegar**
      (enlace o embed de Google Maps).
- [ ] `Stay`: opciones de hospedaje.  nota: cambiar por air b&b baratos para familias grandes cerca de la zona.
- [ ] **Código de vestimenta (dress code)** — ubicar en la sección adecuada. 
- [x] **Aviso "solo adultos / sin niños"** — comunicarlo con tacto en la sección
      adecuada (ver política en `mission.md`).
Nota: quiero un form con cada invitado por asociado a la familia indicando si asistiran. enfasis en invitado principal. dropdawn con restricciones alimentarias, que se activan solo si tienen alguna, es decir algun checkbox por ejemplo al presionar confirmar mandar un alert antes de la animacion para confirmar quien va y quien no. 
Quitar el boton de menu, no sirve de nada. 
Quitar estas invidat@ en carta al inicio. 

## Fase 4 — Mesa de regalos (Gifts)

- [ ] Enlaces reales: lista de regalos / transferencia / sobre digital.
- [ ] Copys y estilo de la sección `Gifts`.
- [ ] Todos los enlaces salientes verificados (sin backend). nota: crear backend

## Fase 5 — RSVP (requiere decisión de backend)

> Bloqueada por la decisión de `tech-stack.md` (dónde vive la API y cómo convive
> con el despliegue estático de Hostinger). Resolver **antes** de construir.

- [ ] Elegir y documentar la solución de backend (VPS Node / serverless / BaaS).
- [ ] **Acceso por token en enlace único** (`?i=<token>`): al cargar, leer el
      query param y resolver el invitado contra el backend.  nota: Token único por invitado, En vez de JWT usaría un UUID. en bd: quiero el invitado principal con un nombre o descripcion, por ejemplo "Familia Curiel-Ramirez" o "Norma Curiel". Ellos tendrán una lista de invitados determinadas en algunos casos: Menor: "Sofia Curiel", f, 12, menor. O  alguien sin nombre establecido pero con datos a llenar en form, algunos tendrán la opcion de llevar más uno. En el form llenaran primero si activan su opcion de más uno. Luego el nombre y restricciones alimentarias.
	    Guests
		id
		family
		token
		confirmed
		adults
		children
		table
		openedAt
		Esto te permite:

- Ver quién abrió la invitación.
- Saber quién confirmó.
- Mostrar distintos nombres.
- Limitar asistentes.
- Incluso revocar un enlace si fuera necesario.
  
  
  
- [ ] **Bloqueo total del sitio**: sin token válido, mostrar pantalla de acceso;
      no renderizar el contenido.
- [ ] Modelo de datos: `Invitado` (token único, nombre, **nº de lugares — solo
      adultos**) + `Confirmación` (asistencia, nº que asisten, restricciones
      alimentarias, mensaje). **Sin acompañantes menores.**
- [ ] Formulario `Rsvp` conectado que persiste respuestas contra el token.
- [ ] Validación (no exceder los lugares reservados), estados de éxito/error y
      confirmación al invitado.
- [ ] Panel/proceso para los novios: **carga de invitados**, **generación de
      tokens** y **export de la lista de enlaces** para repartir.
- [ ] Vista/export de **conteo de confirmaciones** para los novios.

## Fase 6 — Valores, cierre y pulido

- [ ] Sección `Values` con contenido final.
- [ ] `Footer` con datos de contacto/agradecimiento.
- [ ] Revisar animación del gato (`CatWalker`) en todas las secciones.

## Fase 7 — Calidad y lanzamiento

- [ ] Pase de responsive y rendimiento (imágenes optimizadas, LCP móvil).
- [ ] Accesibilidad básica (contraste, foco, textos alternativos).
- [ ] SEO/social: `<title>`, meta y tarjeta al compartir el enlace.
- [ ] QA end-to-end del RSVP en producción.
- [ ] Compartir el enlace final con los invitados.

---

## Notas de dependencias

- Las Fases 1–4 y 6 son **estáticas** y pueden avanzar en cualquier orden.
- La **Fase 5 (RSVP)** es la única que introduce backend: no empezar a codificar
  hasta cerrar la decisión de infraestructura en `tech-stack.md`.
