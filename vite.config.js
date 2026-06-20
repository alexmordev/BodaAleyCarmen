import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relativo: el sitio funciona servido desde la raiz del dominio
// (Hostinger sirve la rama `production`, cuyos archivos quedan en public_html).
export default defineConfig({
  base: './',
  plugins: [react()],
  // .jfif es un JPEG; Vite no lo trata como asset por defecto, lo incluimos
  // para poder importar src/assets/images/gato.jfif y que se empaquete/hashee.
  assetsInclude: ['**/*.jfif'],
})
