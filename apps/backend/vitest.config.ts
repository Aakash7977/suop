import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/__tests__/**/*.ts'],
    exclude: ['node_modules', 'dist'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/**/index.ts',
        // Smoke test is a temporary Phase 0 verification route, not production code
        'src/routes/smoke-test.ts',
        // Main entry point — exercised only at runtime, not unit-testable
        'src/main.ts',
      ],
      thresholds: {
        // RC1 Fix Pack 1: thresholds reflect current coverage after refactoring.
        // Previous (pre-Fix Pack 1): statements 46.89%, functions 63.54%.
        // Current (post-Fix Pack 1): statements 55%+, functions 68%+.
        // Target for Fix Pack 2: raise to statements 65%, functions 75%.
        statements: 55,
        branches: 50,
        functions: 65,
        lines: 55,
      },
    },
  },
  css: false,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
