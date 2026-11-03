import { mergeConfig } from 'vite'
import baseConfig from '../vite.config'

// Only the explicit local QA command enables this provider simulator.
export default mergeConfig(baseConfig, {
  define: { 'import.meta.env.VITE_SALES_QA_GATEWAY': JSON.stringify('true') },
  server: { host: '127.0.0.1', port: 5180, strictPort: true,
    proxy: { '/api/sales': { target: 'http://127.0.0.1:5182', changeOrigin: false } } },
})
