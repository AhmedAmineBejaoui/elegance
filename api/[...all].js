// api/[...all].js - Entry point for all API routes
export const config = { runtime: 'nodejs' };

// Robust import that handles both CJS and ESM exports
let app;
try {
  // Try ESM import first
  const mod = await import('../dist/server/index.js');
  app = mod.default ?? mod.app ?? mod.server ?? mod.handler;
} catch (error) {
  // Fallback to CommonJS require if ESM fails
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const mod = require('../dist/server/index.js');
  app = mod.default ?? mod.app ?? mod.server ?? mod.handler ?? mod;
}

if (!app) {
  throw new Error('Failed to load Express app from server bundle');
}

export default app;
