import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    alias: {
      // Mock CSS imports for Tailwind/PostCSS
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
  },
})