import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // The on-demand Gemma runtime is one 6.1 MB library file. The first page
    // and the Three.js chamber stay under this; the warning only existed
    // because that runtime was bundled into the initial download.
    chunkSizeWarningLimit: 6400,
  },
})
