# Validation — RSVP opcional por rol

> Cómo saber que la implementación está completa y lista para fusionar.
> Enfoque sin cambios de esquema: la exención se deriva del rol. Helper de BD:
> `node scripts/db.mjs "<SQL>"`.

## Datos de prueba

Con `npm run seed` ya hay 1 grupo **novios** (exento) y 1 **invitado**. Útil añadir
1 grupo **proveedor** para probar el otro rol exento.

## 1. Fuente de verdad y estadísticas (backend)

- [ ] `GET /api/admin/access?token=<novios>` → `stats.groups` y `stats.people`
      **no** incluyen novios/proveedores.
- [ ] **Regresión del bug de dietas:** una dieta en un miembro de un grupo exento
      **no** aparece en `stats.diets`. (Prueba: fija una dieta a un miembro de
      novios por SQL, confirma que no sale.)
- [ ] Los conteos coinciden con:
      `node scripts/db.mjs "SELECT COUNT(*) FROM guests WHERE role_id NOT IN (1,2)"`.

## 2. Guarda de `/api/rsvp` (backend)

- [ ] `POST /api/rsvp` con token de grupo **exento** (novios/proveedor) → `403`
      con `{ code: 'NO_RSVP' }`; no modifica `guests.confirmed` ni inserta en
      `rsvp_submissions`.
- [ ] `POST /api/rsvp` con token de **invitado** → sigue en `200 { ok: true }`,
      sin regresión.

## 3. Payload de `/api/party`

- [ ] `GET /api/party?i=<invitado>` → `party.rsvpRequired === true`.
- [ ] `GET /api/party?i=<novios|proveedor>` → `party.rsvpRequired === false`.

## 4. Frontend público

- [ ] Token **invitado**: la sección RSVP aparece y funciona; la CTA "Confirmar"
      de la navegación está presente.
- [ ] Token **exento**: la sección RSVP **no se renderiza** y la CTA "Confirmar"
      **no aparece**. Sin mensaje sustitutivo.
- [ ] Token **novios**: el acceso al `Panel de novios` sigue disponible.
- [ ] Dev sin token (`DEV_OPEN`): el RSVP se muestra (default requiere RSVP).

## 5. Panel de novios

- [ ] Los grupos exentos aparecen **separados** ("Sin RSVP"), no mezclados con
      invitados pendientes; su enlace se copia igual.
- [ ] En "Resumen por familia", los exentos muestran RSVP como "n/a".
- [ ] Las tarjetas de conteo coinciden con el punto 1.

## 6. Calidad y build

- [ ] `npm run build` compila sin errores ni warnings nuevos.
- [ ] `npm run lint` limpio.
- [ ] `docs/API.md` y `specs/tech-stack.md` actualizados.

## Criterio de "listo para merge"

Todas las casillas marcadas, build/lint en verde, y revisión manual del panel
confirmando que **el conteo del evento solo refleja invitados/padrinos** y que
**ningún grupo exento ve el formulario de RSVP**.

## Nota de revisión (resuelta)

En la primera prueba la tarjeta "Sin responder" mostraba **3** para un solo grupo
invitado (Familia Curiel-Ramírez). El filtro por rol ya era correcto (novios
excluidos: "Grupos confirmados 0/1"); el sobrante era el **miembro editable sin
nombre** del seed (`{ name: '', editable: true }`), una plaza vacía a rellenar por
el invitado. Se corrigió `rsvpStats().people` para excluir miembros sin nombre
(`m.name IS NULL OR m.name = ''`) de todos los cubos. Ahora "Sin responder" = **2**
(Norma + Roberto).

- [ ] Verificar en el panel que "Sin responder" ya no cuenta huecos editables
      vacíos (solo miembros con nombre).