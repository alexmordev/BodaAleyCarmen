# Requirements — RSVP opcional por rol

> Feature: algunos grupos (novios, proveedores) no deben confirmar asistencia ni
> contar en las estadísticas del evento. **Solo confirman invitados y
> padrinos/damas de honor.**
> Fecha: 2026-07-22 · Relacionado: [`specs/mission.md`](../mission.md),
> [`specs/tech-stack.md`](../tech-stack.md).

## Problema

Hoy el sistema trata a **todos** los grupos por igual respecto al RSVP:

1. **Frontend** — el formulario de confirmación (`Rsvp` en `app/WeddingApp.jsx`) se
   renderiza para cualquier token válido. A los novios y proveedores se les pide
   confirmar asistencia aunque no tenga sentido.
2. **Estadísticas** — `rsvpStats()` en `lib/repo.js` filtra grupos y personas por
   `role_id = 3` (invitado), **pero la consulta de restricciones alimentarias
   (`diets`) no filtra por rol**: cuela las dietas de novios/proveedores.
3. **Panel de novios** (`app/novios/page.jsx`, vía `accessSummary` y
   `guestsWithMembers`) — mezcla novios y proveedores con los invitados reales en
   las tablas, sin distinción.

## Decisiones (acordadas con el cliente)

### D1 — Exención **derivada del rol, por defecto** (sin flag ni columna)
> Nota del cliente: *"Solamente los invitados o damas de honor necesitan confirmar
> su asistencia."* → No se añade columna; se toma por defecto del rol.

Regla única, expresada en una sola función fuente de verdad
(`rsvpRequiredForRole` en `lib/repo.js`):

- **No confirman** (exentos): `novios`, `proveedor`.
- **Confirman** (RSVP requerido): **cualquier otro rol** — hoy `invitado`; y por
  defecto también un futuro rol de `padrinos`/`damas de honor` si se añade.
- Se implementa como *lista de exentos* (`novios`, `proveedor`) y "todo lo demás
  confirma", para que roles nuevos de tipo invitado queden cubiertos sin tocar
  código.

> Por qué así y no un flag por grupo: la política es homogénea por rol (no hay
> excepciones caso por caso), no requiere migración ni UI extra, y evita datos
> redundantes. La regla vive en un solo sitio en vez de esparcir `role_id = 3` por
> las consultas.

### D2 — Grupo exento: **ocultar el RSVP sin mensaje**
Cuando un grupo exento (rol `novios`/`proveedor`) abre su enlace:

- La sección de confirmación **no se renderiza**, ni la CTA "Confirmar" de la
  navegación ni cualquier ancla `#rsvp`.
- **No** se muestra texto sustitutivo.
- El resto del sitio informativo se ve con normalidad.
- Los **novios** conservan su acceso a `/novios` (flujo intacto).

### D3 — Panel: **fuera de conteos, visibles aparte**
- Conteos de cabecera (asisten / no asisten / sin responder / grupos confirmados)
  y **restricciones alimentarias** suman **solo roles que confirman**.
- Los grupos exentos **siguen visibles** en el panel, en una sección/etiqueta
  separada ("Sin RSVP"), para tener sus enlaces a mano.
- El log de "ingresos recientes" no cambia.

## Alcance

**Incluye:**
- `lib/repo.js`: helper `rsvpRequiredForRole`; `toPartyPayload` (exponer
  `rsvpRequired`); `rsvpStats` (filtro consistente, incluida la de dietas);
  `persistRsvp` (guarda defensiva). `accessSummary`/`guestsWithMembers` ya
  devuelven `role`, sin cambio de consulta.
- API: guarda en `/api/rsvp` (rechazo de exentos).
- Frontend público: ocultar `Rsvp` y la CTA según `rsvpRequired`.
- Panel: separar grupos exentos y marcar su fila.
- Docs: `docs/API.md`, `specs/tech-stack.md`.

**Fuera de alcance:**
- Cambios de esquema / migraciones (**no** se añade columna).
- Alta de un rol `padrinos`/`damas de honor` como tal (hoy usan `invitado`); la
  regla ya los cubriría por defecto si se creara.
- Vistas específicas por rol para proveedores.
- Cambiar el modelo de acceso por token o el diseño visual.

## Contexto técnico relevante

- `findGuestByToken` hace `SELECT g.*, r.name AS role`, así que `guest.role` está
  disponible en backend sin trabajo extra.
- El frontend lee el grupo desde `window.__PARTY__` (forma de `toPartyPayload`).
- Roles sembrados (`db/migrations/001_roles.sql`): `1 novios`, `2 proveedor`,
  `3 invitado`.
- Aislamiento de worktrees (CLAUDE.md): trabajar solo en el árbol actual.

## Riesgos / consideraciones

- **Defensa en backend.** Aunque el front oculte el formulario, `/api/rsvp` debe
  rechazar confirmaciones de grupos exentos (no confiar solo en el cliente).
- **Consistencia de la regla.** Todas las consultas de estadística deben usar el
  mismo criterio (`role NOT IN (novios, proveedor)`), no `role_id = 3` suelto, para
  que un futuro rol invitado cuente sin tocar SQL.
- **Fallback de desarrollo.** Sin token (`DEV_OPEN`) no hay `party.role`; el RSVP
  debe seguir mostrándose (default: requiere RSVP).
