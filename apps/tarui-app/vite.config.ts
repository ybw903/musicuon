import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        'audio-player': resolve(__dirname, 'index.html'),
        'play-list': resolve(__dirname, 'play-list/index.html')
      }
    }
  }
})
