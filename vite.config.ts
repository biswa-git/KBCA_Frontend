import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/cashfree/orders': {
        target: 'https://sandbox.cashfree.com',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/cashfree/, '/pg'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-client-id', 'TEST11120516a7085bf8ef5c6f0e826661502111');
            proxyReq.setHeader('x-client-secret', 'cfsk_ma_test_8b81b9a311b73024841c47892170be49_ccd3d211');
            proxyReq.setHeader('x-api-version', '2025-01-01');
          });
        },
      },
    },
  },
})
