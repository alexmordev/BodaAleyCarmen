# CLAUDE.md — A&C Wedding

Sitio web de la boda de Alejandro & Carmen (07.11.2026). **React + Vite**.
El diseño es una réplica fiel del prototipo de Claude Design `A&C Wedding.html`.

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo en http://localhost:5173
npm run build    # build de producción -> dist/
npm run preview  # previsualizar el build
```

## Arquitectura

- `index.html` — punto de entrada de Vite (fuentes de Google + `#root`). **No borrar ni mover**; Vite lo necesita en la raíz para compilar.
- `src/main.jsx` — bootstrap de React.
- `src/App.jsx` — todas las secciones del sitio (un solo archivo, componentes verbatim del diseño).
- `src/styles.css` — estilos (copia fiel del diseño original; no reescribir, solo extender).
- `src/assets/images/` — imágenes empaquetadas por Vite (p. ej. `gato.jfif`).

## Reglas del proyecto

1. **El diseño debe permanecer idéntico al original.** Al tocar `styles.css` o el
   markup de `App.jsx`, no alterar tipografías, colores (`--primary`, paleta), ni
   layout salvo que se pida explícitamente.
2. **Assets de imagen van en `src/assets/images/`**, nunca en `dist/` (se borra en
   cada build por `emptyOutDir`). Importarlos en JS: `import x from './assets/images/x.ext'`.
   `.jfif` está habilitado vía `assetsInclude` en `vite.config.js`.
3. **`base` de Vite es relativo (`./`)** para que los assets carguen servidos desde
   la raíz del dominio. No cambiar a absoluto sin motivo.
4. El **gato que cruza la pantalla al hacer scroll** (componente `CatWalker`, fijo
   abajo) usa `src/assets/images/gato.jfif`. Para cambiarlo, reemplazar ese archivo
   o el import en `App.jsx`.

## Ramas

- **`main`** — código fuente de producción. Cada push dispara el build automático.
- **`develop`** — desarrollo. Se trabaja aquí y se fusiona a `main` para publicar.
- **`production`** — generada por el CI. Contiene **solo el sitio compilado**
  (`index.html` + `assets/` en la raíz). **Nunca editar a mano.**

## Despliegue (Hostinger)

Hostinger sirve archivos estáticos: **no compila**. Por eso el sitio compilado vive
en la rama `production`, que es la que Hostinger clona en `public_html`.

Flujo automático: `push a main` → GitHub Actions (`.github/workflows/deploy.yml`)
ejecuta `npm run build` → publica el resultado en la rama `production`
(`peaceiris/actions-gh-pages`, `force_orphan`) → Hostinger despliega `production`
en `public_html`.

### Configuración en Hostinger (una sola vez)
1. hPanel → **Avanzado → Git** → conectar el repositorio.
2. **Branch:** `production` · **Directorio:** `public_html`.
3. (Opcional) Activar **Auto-deployment** y pegar la *Webhook URL* en
   GitHub → **Settings → Webhooks** para deploy automático en cada push.

## Regenerar la rama `production` a mano (si hace falta sin CI)

```bash
npm run build
git worktree add --orphan -b production ../AleyCarmen-prod   # o reusar si existe
cp -r dist/* ../AleyCarmen-prod/
git -C ../AleyCarmen-prod add -A
git -C ../AleyCarmen-prod commit -m "build: sitio compilado para Hostinger"
git worktree remove ../AleyCarmen-prod
git push origin production --force
```

## Convenciones

- Mensajes de commit en español, imperativo, con prefijo tipo `feat:`, `fix:`,
  `ci:`, `build:`.
- Mantener `main` y `develop` sincronizadas tras cambios de configuración.
- No commitear `dist/` ni `node_modules/` (ya están en `.gitignore`).
