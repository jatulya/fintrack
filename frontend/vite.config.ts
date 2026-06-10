import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE_PATH;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        [apiBase]: {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
