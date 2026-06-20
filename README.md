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

- **main** — producción. Cada push dispara el deploy automático.
- **develop** — desarrollo. Se trabaja aquí y se fusiona a `main` para publicar.

## Despliegue automático

El workflow `.github/workflows/deploy.yml` compila y publica el sitio en
**GitHub Pages** en cada push a `main`. Para activarlo, en GitHub:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Haz push a `main` (o fusiona `develop` → `main`).

El `base` de Vite está configurado como relativo (`./`), por lo que el sitio
funciona tanto en un dominio raíz como en una ruta de proyecto de GitHub Pages.
