import { defineConfig } from 'vitest/config';
import { URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
