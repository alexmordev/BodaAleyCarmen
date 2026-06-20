# Alejandro & Carmen · 07.11.2026

Sitio web de la boda, construido con **React + Vite**. El diseño es una réplica
fiel del prototipo de Claude Design (`A&C Wedding.html`).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # genera la versión de producción en dist/
npm run preview  # previsualiza el build de producción
```

## Estructura

```
index.html            Punto de entrada (fuentes + #root)
src/main.jsx          Bootstrap de React
src/App.jsx           Todas las secciones del sitio
src/styles.css        Estilos (copia fiel del diseño original)
.github/workflows/    CI/CD — deploy automático a GitHub Pages
```

## Ramas

- **main** — código fuente de producción. Cada push dispara el build.
- **develop** — desarrollo. Se trabaja aquí y se fusiona a `main` para publicar.
- **production** — generada por el CI. Contiene **solo el sitio ya compilado**
  (index.html + assets en la raíz). **No se edita a mano.**

## Despliegue automático (Hostinger)

Hostinger sirve archivos estáticos: **no compila el proyecto**. Por eso el CI
construye el sitio y publica el resultado en la rama `production`, que es la que
Hostinger clona en `public_html`.

Flujo: `push a main` → GitHub Actions compila → actualiza la rama `production`
→ Hostinger despliega esa rama en `public_html`.

### Configuración en Hostinger (una sola vez)

1. hPanel → **Avanzado → Git** → conecta este repositorio.
2. **Branch:** `production`  ·  **Directorio de despliegue:** `public_html`.
3. (Opcional) Activa **Auto-deployment** y copia la *Webhook URL* en
   GitHub → **Settings → Webhooks** para que Hostinger actualice solo en cada push.

El `base` de Vite es relativo (`./`), por lo que los assets cargan bien servidos
desde la raíz del dominio.
