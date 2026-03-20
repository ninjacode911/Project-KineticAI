import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Workaround: MediaPipe's package.json has a malformed exports field
      // that mixes subpath keys with condition keys. Point directly to the ESM bundle.
      '@mediapipe/tasks-vision': path.resolve(
        __dirname,
        'node_modules/@mediapipe/tasks-vision/vision_bundle.mjs',
      ),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // pdfmake is ~975KB but dynamically imported
  },
})
