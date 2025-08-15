// Serverless wrapper for Express app
import { app } from '../dist/server/index.js';

// Store middleware initialization state
let isInitialized = false;

// Initialize the app once
const initializeApp = async () => {
  if (!isInitialized) {
    // Import and register routes only once
    const { registerRoutes } = await import('../dist/server/routes.js');
    await registerRoutes(app);
    isInitialized = true;
  }
  return app;
};

export default async function handler(req, res) {
  try {
    const expressApp = await initializeApp();
    return expressApp(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}