import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build: npx vite build --config vite.widget.config.js
// Output: dist-widget/widget.js  -> host this on a CDN / static server
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-widget',
    emptyOutDir: true,
    lib: {
      entry: 'src/widget/embed.jsx',
      name: 'ChatWidget',
      formats: ['iife'],
      fileName: () => 'widget.js',
    },
    rollupOptions: {
      output: { extend: true },
    },
  },
})
