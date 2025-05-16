import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 👈 Rutas relativas para que funcione en Amplify
  plugins: [react()],
})


