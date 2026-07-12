/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Node completa (SSR + futuras API routes para el RSVP). En Hostinger se
  // ejecuta con `next start`. Si se necesitara export estático, añadir:
  //   output: 'export'
  reactStrictMode: true,
}

export default nextConfig
