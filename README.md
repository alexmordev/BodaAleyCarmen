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

## Despliegue (Hostinger) — pendiente de re-cablear

Con Next.js como **app Node** (`next start`) el flujo anterior (publicar `dist/`
estático en `production` → Hostinger lo clona en `public_html`) ya no aplica: se
necesita runtime de Node en el servidor.

- **CI actual:** solo valida que `next build` compila en cada push. No publica.
- **Deploy real:** por definir según la config de Node ya activada en Hostinger
  (Node app manager / Git deploy + `next start`, o PM2).
- **Alternativa:** `output: 'export'` en `next.config.mjs` para volver a un sitio
  estático (pero se pierden las API routes para el RSVP).
