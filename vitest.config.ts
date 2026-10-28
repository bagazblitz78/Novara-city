import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The suite runs against a real database — SQLite locally, PostgreSQL in
    // CI. See scripts/run-tests.mjs, which provisions it before running.
    passWithNoTests: false,
  },
});
