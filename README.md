# Alejandro & Carmen · 07.11.2026

Sitio web de la boda, construido con **Next.js 15 (App Router)** sobre React 18.
El diseño es una réplica fiel del prototipo de Claude Design (`A&C Wedding.html`).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:3000
npm run build    # build de producción en .next/
npm run start    # sirve el build (app Node, next start)
```

## Estructura

```
app/layout.jsx        Layout raíz (fuentes + metadata)
app/page.jsx          Ruta / — renderiza WeddingApp
app/WeddingApp.jsx    Todas las secciones del sitio ('use client')
app/globals.css       Estilos (copia fiel del diseño original)
public/images/        Imágenes servidas desde la raíz (/images/...)
next.config.mjs       Configuración de Next.js
.github/workflows/    CI — valida que next build compila
```

## Ramas

- **main** — código fuente de producción. Cada push dispara el CI (build check).
- **develop** — desarrollo. Se trabaja aquí y se fusiona a `main` para publicar.
- **production** — rama del flujo estático anterior; **obsoleta tras migrar a la
  app Node de Next.js** (ya no se publica).

## Despliegue (Hostinger) — app Node

Hostinger ejecuta la app Next.js con **Node** (no sirve estáticos). El deploy lo
hace Hostinger desde su integración Git: clona el repo, corre `npm install` +
`npm run build` y arranca con `npm run start` (`next start`).

- **CI (`.github/workflows/deploy.yml`):** solo valida que `next build` compila en
  cada push. No publica ninguna rama; el deploy lo gestiona Hostinger.
- **Rama:** Hostinger sirve `main`. La rama `production` (flujo estático anterior)
  queda obsoleta.

### Configuración en Hostinger (una sola vez)

1. hPanel → **Node.js / Git** → conecta el repo, rama `main`.
2. **Build command:** `npm run build` · **Start command:** `npm run start` · Node 24.
