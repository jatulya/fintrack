import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function normalizeBasePath(path: string): string {
  const trimmed = path.trim().replace(/^\/+|\/+$/g, '')
  return `/${trimmed}`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_URL
    ? normalizeBasePath(env.VITE_API_URL)
    : normalizeBasePath(env.VITE_API_BASE_PATH || 'summary/money/mine')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        [apiBase]: {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
