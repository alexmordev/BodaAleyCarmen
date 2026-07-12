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

## Backend (nuevo — a definir e implementar)

El cliente confirmó **backend propio** para RSVP y datos dinámicos. Esto es una
decisión estructural nueva respecto al despliegue estático actual en Hostinger.
Pendiente de elegir en la **Fase de RSVP** del roadmap; opciones candidatas:

| Opción | Encaje | Notas |
|---|---|---|
| **Node/Express + SQLite/Postgres** en Hostinger (VPS) | Requiere plan que ejecute Node | Control total; más mantenimiento |
| **Serverless (Vercel/Netlify Functions) + DB gestionada** | Frontend estático + API aparte | Menos ops; separa hosting del sitio |
| **BaaS (Supabase / Firebase)** | "Backend propio" gestionado | RSVP + panel rápido; menor esfuerzo |

> ⚠️ **Decisión abierta.** El hosting actual (Hostinger sirviendo estáticos desde
> la rama `production`) **no compila ni ejecuta Node**. Antes de construir el RSVP
> hay que decidir dónde vive la API y cómo convive con el despliegue estático.
> Documentar la elección aquí cuando se tome.

## Acceso por invitación (token en enlace único)

Decisión tomada con el cliente (ver `mission.md` → *Acceso por invitación*):

- **Formato de URL:** query param — `boda.com/?i=<token>`. Elegido porque funciona
  tal cual en el **hosting estático actual de Hostinger sin reescrituras**
  (`.htaccess`). No cambiar a ruta `/i/<token>` sin resolver el rewrite del SPA.
- **Token:** cadena opaca aleatoria (no secuencial, no adivinable). Es la
  identidad + llave del invitado; **no hay login tradicional**.
- **Bloqueo total:** al cargar, el SPA lee `?i=` y consulta el backend. Token
  inválido/ausente → pantalla de acceso; no se renderiza el contenido del sitio.
- **Generación/reparto:** lista precargada de invitados en el panel del backend →
  un token por invitado → **export de la lista de enlaces** para repartir.
- ⚠️ El token va en la URL (no es seguridad fuerte, sino control de acceso
  razonable para una boda). No exponer datos sensibles; el backend solo devuelve
  lo necesario para personalizar (nombre, nº de lugares, estado de RSVP).

## Datos (RSVP)

- Entidad `Invitado`: **token** (único), nombre, **nº de lugares reservados (solo
  adultos)**, y su `Confirmación`: asistencia (sí/no), nº que asisten,
  restricciones alimentarias, mensaje.
- **Sin opción de acompañantes menores** (política *solo adultos*, ver `mission.md`).
- Los novios necesitan **lectura del conteo** (panel simple o export) y la
  **generación/export de enlaces** por invitado.

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

- `main` — código fuente de producción (cada push dispara el build).
- `develop` — desarrollo; se fusiona a `main` para publicar.
- `production` — **solo el sitio compilado**, generada por CI. Nunca editar a mano.

## Pipeline de imágenes

- `scripts/process-assets.mjs` (usa `sharp`) quedó del diseño anterior y **no
  coincide** con los nombres de asset actuales. No ejecutar hasta actualizarlo;
  por ahora las imágenes se colocan a mano en `public/images/` con el nombre
  exacto que referencia `app/WeddingApp.jsx` (`/images/nombre.ext`).

## Convenciones

- Commits en español, imperativo, con prefijo `feat:` / `fix:` / `ci:` / `build:`.
- No commitear `dist/` ni `node_modules/`.
- Mantener `main` y `develop` sincronizadas tras cambios de configuración.
