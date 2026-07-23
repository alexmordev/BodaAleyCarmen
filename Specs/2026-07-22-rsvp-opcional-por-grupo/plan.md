# Plan — RSVP opcional por rol

> Grupos de tareas numerados. Ver criterios en [`validation.md`](./validation.md).
> Enfoque: **sin cambios de esquema**; la exención se deriva del rol por defecto
> (`novios`/`proveedor` no confirman, el resto sí). Nota del cliente: *solo
> invitados y padrinos/damas de honor confirman*.

## 1. Fuente de verdad (`lib/repo.js`)

1.1. Añadir helper exportado:
   ```js
   // Roles que NO confirman (no ven RSVP ni cuentan en estadisticas). Cualquier
   // otro rol confirma por defecto (invitado, padrinos/damas de honor...).
   const NON_RSVP_ROLES = new Set(['novios', 'proveedor'])
   export function rsvpRequiredForRole(role) { return !NON_RSVP_ROLES.has(role) }
   ```

## 2. Capa de datos (`lib/repo.js`)

2.1. `toPartyPayload(guest, members)` — añadir
     `rsvpRequired: rsvpRequiredForRole(guest.role)` al objeto devuelto.
2.2. `rsvpStats()` — unificar el criterio a "roles que confirman" en las **tres**
     consultas (hoy usan `role_id = 3`; cambiar a `role_id NOT IN (1, 2)` —
     1 = novios, 2 = proveedor):
   - `groups` (grupos y confirmados),
   - `people` (asisten / no asisten / sin responder / acompañantes),
   - `diets` (**hoy sin filtro** → **bug**): añadir `JOIN guests g ON g.id =
     m.guest_id` y `WHERE ... AND g.role_id NOT IN (1, 2)`.
2.3. `persistRsvp(guest, ...)` — guarda defensiva al inicio: si
     `!rsvpRequiredForRole(guest.role)`, lanzar `Error` con `code = 'NO_RSVP'`
     antes de tocar la BD.
2.4. `accessSummary()` / `guestsWithMembers()` — sin cambios de SQL (ya devuelven
     `role`); el panel separa por rol en cliente.

## 3. API (`app/api/rsvp/route.js`)

3.1. Mapear el nuevo error: `code 'NO_RSVP'` → `403` con
     `{ error: 'Este acceso no requiere confirmación', code: 'NO_RSVP' }`.
     `/api/party` no cambia (payload ya sale de `toPartyPayload`).

## 4. Frontend público (`app/WeddingApp.jsx`)

4.1. En `WeddingApp`, estado `rsvpRequired` (default `true`); al resolver el token,
     `setRsvpRequired(d.party.rsvpRequired !== false)`.
4.2. No renderizar `<Rsvp>` cuando `rsvpRequired === false`.
4.3. Pasar `rsvpRequired` a `Nav` y ocultar la CTA `#rsvp` ("Confirmar") cuando sea
     `false`. Sin texto sustitutivo (D2).
4.4. Verificar que `NoviosButton` / acceso a `/novios` sigue intacto.

## 5. Panel de novios (`app/novios/page.jsx`)

5.1. Helper local `requiresRsvp(role)` (mismo criterio que backend).
5.2. Conteos y dietas ya vienen correctos del backend (grupo 2); confirmar.
5.3. "Invitados y enlaces": separar los grupos exentos en una subsección/etiqueta
     "Sin RSVP", manteniendo el enlace copiable (D3).
5.4. "Resumen por familia · accesos": para roles exentos mostrar la columna RSVP
     como "n/a" (no "—"), para no confundirlos con invitados sin confirmar.

## 6. Documentación

6.1. `docs/API.md` — `rsvpRequired` en la respuesta de `/api/party`; nuevo error
     `403 NO_RSVP` en `/api/rsvp`; nota de que `/api/admin/access` solo cuenta
     roles que confirman.
6.2. `specs/tech-stack.md` — nota en "Roles y vistas": `novios`/`proveedor` no
     confirman ni cuentan; regla derivada del rol (sin flag).

## 7. Cierre

7.1. Ejecutar validación (ver `validation.md`): `npm run build` + `npm run lint`.
7.2. Commit en español con prefijo `feat:`. Mantener `main`/`develop`
     sincronizadas según convención.
