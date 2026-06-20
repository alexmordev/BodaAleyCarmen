import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relativo: el sitio funciona servido desde la raiz del dominio.
// outDir = public_html porque la conexion git de Hostinger sirve esa carpeta
// directamente. El build escribe ahi el index.html + assets ya compilados.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'public_html',
    emptyOutDir: true,
  },
})
