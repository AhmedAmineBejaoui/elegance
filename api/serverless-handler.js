// Serverless wrapper for Express app
import { app } from '../dist/server/index.js';

// Store middleware initialization state
let isInitialized = false;

// Initialize the app once
const initializeApp = async () => {
  if (!isInitialized) {
    // Only register routes if we have DATABASE_URL
    if (process.env.DATABASE_URL) {
      try {
        const { registerRoutes } = await import('../dist/server/routes.js');
        await registerRoutes(app);
        console.log('Routes registered successfully');
      } catch (error) {
        console.error('Failed to register routes:', error);
        // Don't throw, just log - let the app start without routes
      }
    } else {
      console.warn('DATABASE_URL not set, skipping route registration');
    }
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