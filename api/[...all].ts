import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: any;
async function loadApp() {
  if (cachedApp) return cachedApp;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL/POSTGRES_URL is missing');

  const mod = await import('../dist/server/index.js');
  const app =
    (typeof mod.default === 'function' ? mod.default : (mod as any).app) ||
    (typeof (mod as any).createApp === 'function' ? (mod as any).createApp() : (mod as any).app);

  if (typeof app !== 'function') {
    throw new Error('Express app not found in dist/server. Check build output & export.');
  }

  try {
    const routes = await import('../dist/server/routes.js');
    if (typeof routes.registerRoutes === 'function') {
      await routes.registerRoutes(app);
    }
  } catch (err) {
    console.error('Failed to register routes:', err);
  }

  cachedApp = app;
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await loadApp();
    return app(req, res);
  } catch (e: any) {
    console.error('API handler error', req.method, req.url, e);
    res.status(500).json({ ok: false, error: String(e) });
  }
}
