import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works whether it is served from the domain root
// or from a GitHub Pages project subpath (https://user.github.io/repo/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
