import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.',        // use project root
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  plugins: [react()]
})
