import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // Ignore browser test profiles if a local headless smoke test creates one in the workspace.
    watch: { ignored: ['**/temp-cdp-profile*/**'] },
  },
})
