import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), { name: 'sales-entry', configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url) req.url = req.url.replace(/^\/sales\/?(?=\?|$)/, '/sales.html')
      next()
    })
  } }],
  build: { rollupOptions: { input: {
    main: fileURLToPath(new URL('index.html', import.meta.url)),
    sales: fileURLToPath(new URL('sales.html', import.meta.url)),
  } } },
  server: { proxy: process.env.SALES_DEV_API_PROXY ? { '/api/sales': { target: process.env.SALES_DEV_API_PROXY, changeOrigin: false } } : undefined },
})
