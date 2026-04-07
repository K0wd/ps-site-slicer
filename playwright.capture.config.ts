import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  testMatch: 'capture-*.spec.ts',
  use: {
    baseURL: process.env.BASE_URL || 'https://testserver.betacom.com/',
  },
  projects: [
    {
      name: 'edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
  ],
});
