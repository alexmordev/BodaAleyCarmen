# CLAUDE.md — A&C Wedding

Sitio web de la boda de Alejandro & Carmen (07.11.2026). **Next.js 15 (App Router)**
sobre React 18. El diseño es una réplica fiel del prototipo de Claude Design
`A&C Wedding.html`.

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo en http://localhost:3000
npm run build    # build de producción -> .next/
npm run start    # servir el build (app Node, next start)
```

## Arquitectura

- `app/layout.jsx` — layout raíz de Next (`<html lang="es">`, fuentes de Google en
  `<head>`, `metadata`/`viewport`). Sustituye al antiguo `index.html`.
- `app/page.jsx` — ruta `/`; renderiza `WeddingApp`.
- `app/WeddingApp.jsx` — `'use client'`. Todas las secciones del sitio (un solo
  archivo, componentes verbatim del diseño mobile-first "Alejandro & Carmen").
  Es cliente porque usa `window`, `scroll`, `IntersectionObserver` y `canvas`.
- `app/globals.css` — estilos (copia fiel del diseño `.device` mobile-first; no
  reescribir, solo extender). Importado en `app/layout.jsx`.
- `public/images/` — imágenes servidas por Next desde la raíz, referenciadas por
  ruta absoluta (`/images/...`): `nosotros-sillon.jpg` (hero), `nosotros-cena.jpg`
  (cena primera cita), `propuesta.jpg` y `anillo-flores.jpg` (pedida),
  `hacienda.webp` (lugar). Sustituir por las fotos reales usando el mismo nombre
  de archivo para que el sitio las recoja automáticamente.

## Reglas del proyecto

1. **El diseño debe permanecer idéntico al original.** Al tocar `styles.css` o el
   markup de `App.jsx`, no alterar tipografías, colores (`--primary`, paleta), ni
   layout salvo que se pida explícitamente.
2. **Assets de imagen van en `public/images/`** y se referencian por ruta absoluta
   (`/images/x.ext`). Next sirve `public/` desde la raíz del dominio.
3. **App Node (`next start`)**: la app corre con runtime de Node (SSR + futuras
   API routes para el RSVP). Para export estático, añadir `output: 'export'` en
   `next.config.mjs`.
4. El **gato que cruza la pantalla al hacer scroll** (componente `CatWalker`, fijo
   abajo) es un SVG inline estilo "El Cadáver de la Novia" (sin imagen externa),
   tal cual viene del diseño. Su posición horizontal se actualiza con el scroll.
5. **Pipeline de imágenes** (`scripts/process-assets.mjs`, usa `sharp`): quedó del
   diseño anterior (generaba `hero.jpg`, `gallery/g1..g7`, `gato.png`) y **ya no
   coincide con los nombres de asset actuales** (`nosotros-sillon.jpg`, etc.). No
   ejecutar hasta actualizarlo; por ahora las imágenes se colocan a mano en
   `public/images/` con el nombre exacto que referencia `app/WeddingApp.jsx`.

## Ramas

- **`main`** — código fuente de producción. Cada push dispara el CI (build check).
- **`develop`** — desarrollo. Se trabaja aquí y se fusiona a `main` para publicar.
- **`production`** — rama del flujo estático anterior. **Obsoleta tras migrar a la
  app Node de Next.js** (ya no se publica). Reutilizar solo si se vuelve a export
  estático (`output: 'export'`).

## Despliegue (Hostinger) — app Node

Hostinger está configurado para **ejecutar la app Next.js con Node** (no sirve
estáticos). El despliegue lo hace Hostinger desde su **integración Git**: clona el
repo, ejecuta `npm install` + `npm run build` y arranca la app con
`npm run start` (`next start`).

- **CI (`.github/workflows/deploy.yml`):** solo valida que `next build` compila en
  cada push (`main` y `develop`). **No publica** ninguna rama; el deploy lo
  gestiona Hostinger.
- **Rama que sirve Hostinger:** `main` (código fuente). Ya **no** se usa la rama
  `production` (era del flujo estático anterior).

### Configuración en Hostinger (una sola vez)
1. hPanel → **Node.js / Git** → conectar el repositorio, rama `main`.
2. **Build command:** `npm run build` · **Start command:** `npm run start`.
3. Node 24. La app escucha el puerto que Hostinger inyecte (`$PORT`).

## Aislamiento entre worktrees

El repo tiene dos worktrees de git activos:

- **Padre:** `website/` (rama `main`)
- **Hijo:** `website/firstTree/` (rama `firstTree`) — una carpeta por debajo del padre

Reglas (aplican a la sesión de Claude que se abra en **cualquiera** de los dos):

1. **Trabaja solo en tu propio worktree.** Todo cambio de código, config, assets o
   documentación que se pida se aplica en el árbol donde está abierta la sesión.
   Nunca editar, mover ni borrar archivos del otro worktree, aunque sean
   accesibles por ruta relativa (`../` desde el hijo, `firstTree/` desde el padre).
2. **Lectura sí, escritura no.** Está permitido leer el otro árbol para consultar
   o comparar. Está prohibido escribir en él, y también ejecutar ahí comandos que
   modifiquen estado (`git checkout`, `npm install`, builds, scripts).
3. **Excepción: las specs son compartidas.** El contenido de `Spec/` es común a
   ambos árboles. Aun así, se edita **en el árbol actual** y se propaga por git
   (commit + merge), nunca escribiendo directamente en la carpeta `Spec/` del otro
   worktree.
4. **Si una petición exige tocar el otro árbol**, no hacerlo: avisar al usuario y
   pedir que abra una sesión de Claude en ese worktree.

## Convenciones

- Mensajes de commit en español, imperativo, con prefijo tipo `feat:`, `fix:`,
  `ci:`, `build:`.
- Mantener `main` y `develop` sincronizadas tras cambios de configuración.
- No commitear `dist/` ni `node_modules/` (ya están en `.gitignore`).
