import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ plugins: [react()], base: '/DrawSteel/', build: { rollupOptions: { output: { manualChunks(id) { if (id.endsWith('/ability-catalog.ts')) return 'abilities' } } } } })
