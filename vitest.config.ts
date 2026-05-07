import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'sm-certs',
          include: ['tests/unit/sm-certs/**/*.test.ts'],
          environment: 'node',
        },
        resolve: {
          alias: { '@': path.resolve(__dirname, './app/sm-certs/src') },
        },
      },
      {
        test: {
          name: 'sm-pwa',
          include: ['tests/unit/sm-pwa/**/*.test.ts'],
          environment: 'node',
        },
        resolve: {
          alias: { '@': path.resolve(__dirname, './app/sm-pwa/src') },
        },
      },
      {
        test: {
          name: 'sm-spa',
          include: ['tests/unit/sm-spa/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'testgenerator',
          include: ['tests/unit/testgenerator/**/*.test.ts'],
          environment: 'node',
          pool: 'forks',
        },
      },
    ],
  },
});
