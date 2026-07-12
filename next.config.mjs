/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Node completa (SSR + API routes para el RSVP). Hostinger ejecuta la app
  // con Node: `next build` + `next start`. No es export estático.
  reactStrictMode: true,
}

export default nextConfig
