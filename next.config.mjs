/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Node completa (SSR + API routes para el RSVP). Hostinger ejecuta la app
  // con Node: `next build` + `next start`. No es export estático.
  reactStrictMode: true,

  // El CDN de Hostinger (hcdn) cacheaba el HTML de `/` durante días porque Next
  // envía `s-maxage=31536000` en las páginas preprerenderizadas. Tras cada build
  // los chunks viejos desaparecen del servidor, así que el HTML cacheado pedía
  // `/_next/static/chunks/app/page-<hash-viejo>.js` → 404 → ChunkLoadError y el
  // sitio en blanco (sobre todo en móviles, que reusan más el caché).
  // Los documentos HTML no se cachean; `/_next/static/*` sí (su hash ya invalida).
  async headers() {
    return [
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/novios',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ]
  },
}

export default nextConfig
