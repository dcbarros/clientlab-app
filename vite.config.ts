import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Hash routes and relative assets work in any GitHub Pages project path.
  base: loadEnv(mode, '.', '').VITE_BASE_PATH || './'
}))
