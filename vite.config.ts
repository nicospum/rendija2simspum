import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  appType: 'mpa',
  server: { host: '127.0.0.1', port: 1020, strictPort: true },
  preview: { host: '127.0.0.1', port: 1020, strictPort: true },
  optimizeDeps: {
    include: [
      '@react-three/fiber',
      '@react-three/drei/core/OrbitControls',
      '@react-three/drei/core/Edges',
      '@react-three/drei/core/Line',
    ],
  },
  build: {
    rollupOptions: {
      input: {
        portal: 'index.html',
        rendija: 'doble-rendija/index.html',
        prisma: 'prisma/index.html',
        hawking: 'hawking/index.html',
        lente: 'lente-gravitacional/index.html',
      },
      output: {
        manualChunks(id) {
          const path = id.replaceAll('\\', '/')
          if (path.endsWith('/three/build/three.core.js')) return 'three-core'
          if (path.endsWith('/three/build/three.module.js')) return 'three-webgl'
        },
      },
    },
  },
})
