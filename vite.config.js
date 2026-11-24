import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Относительные пути к js/css в собранном index.html — сайт можно выложить
  // в любую подпапку (GitHub Pages и т. п.) без пересборки под адрес.
  base: './',
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
