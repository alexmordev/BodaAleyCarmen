# Tech Stack — A&C Wedding

## Frontend (actual — migrado a Next.js)

> ✅ **Stack migrado de React+Vite a Next.js 15 (App Router).** Decidido con el
> cliente; Hostinger ya está actualizado para ejecutar Node. La app corre como
> **app Node** (`next start`), lo que habilita **API routes** para el backend de
> RSVP dentro del mismo proyecto.

- **Framework:** Next.js 15 (App Router) sobre React 18.
- **Build/serve:** `next build` → `next start` (runtime Node). Config en
  `next.config.mjs` (`reactStrictMode`). Para export estático futuro:
  `output: 'export'`.
- **Estilos:** CSS plano en `app/globals.css` — copia fiel del diseño `.device`
  mobile-first. Se extiende, no se reescribe.
- **Estructura:**
  - `app/layout.jsx` — layout raíz (`<html lang="es">`, fuentes de Google, metadata).
  - `app/page.jsx` — renderiza `WeddingApp`.
  - `app/WeddingApp.jsx` — `'use client'`; todas las secciones verbatim del diseño:
    `Nav`, `Countdown`, `Hero`, `Night`, `Boda`, `Plan`, `Venue`, `Stay`,
    `Gifts`, `Values`, `Rsvp`, `Footer`, `CatWalker`, `Opener`.
- **Fuentes:** Google Fonts vía `<link>` en `app/layout.jsx`.
- **Assets:** estáticos en `public/images/`, referenciados por ruta absoluta
  (`/images/nombre.ext`). Next sirve `public/` desde la raíz.

## Backend (RSVP — a implementar)

El cliente confirmó **backend propio** para RSVP y datos dinámicos. Al correr ya
como **app Node** en Hostinger, la vía natural son las **API routes de Next.js**
(`app/api/*`) dentro del mismo proyecto — sin servicio ni hosting aparte.

- **API:** rutas `app/api/*` (Route Handlers de Next 15) para resolver el token
  del invitado y persistir la confirmación. Implementadas:
  - `GET  /api/party?i=<token>` — resuelve el grupo, registra el ingreso y
    devuelve el payload que el front inyecta en `window.__PARTY__`.
  - `POST /api/rsvp` — persiste respuestas, restricciones y +1; audita en
    `rsvp_submissions`.
  - `GET  /api/admin/access` — panel de novios: accesos + conteo (rol `novios`).
  - `GET|POST /api/admin/guests` — alta de invitados y **generación de enlaces
    listos para entrar** (`{ link: "<SITE_URL>/?i=<token>" }`). El `POST` acepta
    `role` para fijar el **tipo** del enlace: `novios` (admin, ve `/novios`),
    `proveedor` o `invitado` (por defecto). Así se generan URLs de cada tipo,
    incluida la de los **novios**. Base de la URL vía `NEXT_PUBLIC_SITE_URL`.
- **Persistencia — ✅ DECIDIDA:** **MySQL gestionada en Hostinger + Route Handlers
  con el driver `mysql2`** (sin ORM). Migraciones SQL versionadas en
  `db/migrations/` aplicadas por `scripts/migrate.mjs`. El esquema completo
  (tablas `roles`, `guests`, `guest_members`, `access_logs`, `rsvp_submissions`)
  está documentado en **`schema_database.md`**.

| Opción | Estado |
|---|---|
| **MySQL (Hostinger) + Route Handlers + `mysql2`** | ✅ **Elegida** — menos piezas, misma app/deploy |
| ~~BaaS (Supabase / Firebase)~~ | Descartada |

> ✅ **Bloqueo resuelto.** Hostinger ejecuta Node (`next start`); el RSVP vive en
> el mismo despliegue vía API routes contra la MySQL gestionada. Config por
> variables `DB_*` en `.env` (ver `.env.example`).

## Acceso por invitación (token en enlace único)

Decisión tomada con el cliente (ver `mission.md` → *Acceso por invitación*):

- **Formato de URL:** query param — `boda.com/?i=<token>`. Se mantiene por
  simplicidad; con la app Node también sería viable una ruta `/i/<token>`
  (middleware/route), pero no se cambia sin necesidad.
- **Token:** cadena opaca aleatoria (no secuencial, no adivinable). Es la
  identidad + llave del invitado; **no hay login tradicional**.
- **Bloqueo total:** al cargar, la app lee `?i=` y consulta el backend (API route).
  Token inválido/ausente → pantalla de acceso; no se renderiza el contenido del sitio.
- **Generación/reparto:** lista precargada de invitados en el panel del backend →
  un token por invitado → **export de la lista de enlaces** para repartir.
- ⚠️ El token va en la URL (no es seguridad fuerte, sino control de acceso
  razonable para una boda). No exponer datos sensibles; el backend solo devuelve
  lo necesario para personalizar (nombre, nº de lugares, estado de RSVP).

## Datos (RSVP)

### Modelo de datos (decidido con el cliente)

El **token es un UUID** opaco (no JWT, no secuencial): identidad + llave del
enlace. Un token identifica a un **grupo** (el "invitado principal"), no a una
sola persona. El principal se describe con un nombre o etiqueta libre
(p. ej. *"Familia Curiel-Ramírez"* o *"Norma Curiel"*) y cuelga de él una lista
de invitados asociados.

Entidades:

```
Guest (grupo / enlace)              GuestMember (persona del grupo)
  id            uuid                   id           uuid
  family        text  # etiqueta       guestId      uuid  -> Guest.id
  token         uuid  # UUID opaco      name         text  # puede venir vacío (a llenar en el form)
  role          enum  # novios |        editableName bool  # el invitado escribe el nombre
                      # proveedor |      type         enum  # adulto | menor  (ver nota de política)
                      # invitado         allowPlusOne bool  # este miembro puede sumar +1
  confirmed     bool                    attending    bool|null
  adults        int                     diet         text|null # restricción alimentaria
  children      int   # ver nota         plusOneName  text|null
  table         int|null              # (para el +1: attending/diet propios)
  openedAt      timestamp
```

Esto permite: ver **quién abrió** la invitación (`openedAt`), **quién confirmó**
(`confirmed`), **mostrar distintos nombres/etiquetas** por grupo, **limitar
asistentes** (aforo) y **revocar** un enlace (invalidar el token) si hace falta.

- El **formulario** (ya implementado en `Rsvp`, sin persistencia aún) recorre los
  miembros del grupo con toggle **Sí/No** por persona, **dropdown de restricciones
  alimentarias** que solo aparece si la persona marca el checkbox, y **+1 opcional**
  (primero se activa el acompañante, luego su nombre y restricciones). Al confirmar
  lanza un `window.confirm` con el resumen **quién va / quién no** antes de la
  animación.
- El backend inyectará el grupo resuelto en `window.__PARTY__` (misma forma que el
  fallback documentado en `WeddingApp.jsx`).
- Los novios necesitan **lectura del conteo** (panel simple o export) y la
  **generación/export de enlaces** por invitado.

> ⚠️ **Decisión pendiente — política de menores.** `mission.md` fija el evento como
> *solo adultos / sin infancias*, pero la nota del cliente en el roadmap incluye un
> ejemplo con un miembro `menor` ("Sofía Curiel, 12"). El esquema deja los campos
> `type`/`children` para no bloquear, pero **hay que reconciliar** copy público
> (solo adultos) vs. datos (admite `menor`) antes de construir el backend.

### Roles y vistas

Tabla `roles` (sembrada): **novios**, **proveedor**, **invitado**. `guests.role_id`
apunta a ella.

- **novios** — administración. Al entrar con su token, el front muestra el botón
  *Panel de novios* y da acceso a **`/novios`**: resumen de accesos por familia
  (quién entró, hora, cuántas veces), conteo de confirmaciones, restricciones
  alimentarias y **alta de invitados con generación de token + enlace**.
- **invitado** — RSVP estándar.
- **proveedor** — existe el rol; **alcance de su vista pendiente de definir**.

> **RSVP por rol (sin flag).** Solo confirman los invitados (y un futuro rol de
> padrinos/damas de honor). Los roles `novios` y `proveedor` están **exentos**: no
> ven el formulario ni cuentan en las estadísticas. La regla es la fuente de
> verdad `rsvpRequiredForRole(role)` en `lib/repo.js` (exentos = `novios`,
> `proveedor`; el resto confirma por defecto), reflejada en el payload de
> `/api/party` (`rsvpRequired`) y validada de nuevo en `/api/rsvp` (`403 NO_RSVP`).

El **log de ingresos** vive en `access_logs` (un registro por apertura de enlace,
incluidos intentos con token inválido) y alimenta el panel de novios.

## Servicios externos previstos

- **Mesa de regalos:** enlaces salientes (lista de regalos / transferencia /
  sobre digital) — no requiere backend.
- **Mapa / cómo llegar:** enlace o embed (Google Maps).

## Despliegue

Hostinger ejecuta la app Next.js con **Node** (ya actualizado; no sirve
estáticos). El deploy lo gestiona Hostinger desde su **integración Git**: clona el
repo (`main`), corre `npm install` + `npm run build` y arranca con
`npm run start` (`next start`).

- **CI (`.github/workflows/deploy.yml`):** solo valida que `next build` compila en
  cada push (`main` y `develop`). No publica ninguna rama.
- **Rama servida:** `main`. La rama `production` (flujo estático anterior) queda
  obsoleta.
- **Backend RSVP:** candidato natural ahora son **API routes de Next.js**
  (`app/api/*`), al correr como app Node.

## Ramas

- `main` — código fuente de producción (cada push dispara el build de CI y el
  deploy de Hostinger).
- `develop` — desarrollo; se fusiona a `main` para publicar.
- `production` — **obsoleta** (flujo estático anterior). Ya no se publica; reutilizar
  solo si se vuelve a export estático (`output: 'export'`).

## Pipeline de imágenes

- `scripts/process-assets.mjs` (usa `sharp`) quedó del diseño anterior y **no
  coincide** con los nombres de asset actuales. No ejecutar hasta actualizarlo;
  por ahora las imágenes se colocan a mano en `public/images/` con el nombre
  exacto que referencia `app/WeddingApp.jsx` (`/images/nombre.ext`).

## Convenciones

- Commits en español, imperativo, con prefijo `feat:` / `fix:` / `ci:` / `build:`.
- No commitear `dist/` ni `node_modules/`.
- Mantener `main` y `develop` sincronizadas tras cambios de configuración.
