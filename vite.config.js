import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relativo: el sitio funciona servido desde la raiz del dominio
// (Hostinger sirve la rama `production`, cuyos archivos quedan en public_html).
export default defineConfig({
  base: './',
  plugins: [react()],
})
