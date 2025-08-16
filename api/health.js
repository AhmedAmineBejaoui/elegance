// /api/health.js - Endpoint de diagnostic
import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  // Vérifier les variables d'environnement critiques
  health.checks.environment = {
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    SESSION_SECRET: !!process.env.SESSION_SECRET,
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || 'auto-detected'
  };

  // Vérifier la connexion à la base de données
  try {
    if (process.env.POSTGRES_URL) {
      const result = await sql`SELECT 1 as test`;
      health.checks.database = {
        status: 'connected',
        test: result.rows[0]?.test === 1
      };
    } else {
      health.checks.database = {
        status: 'not_configured',
        error: 'POSTGRES_URL not set'
      };
    }
  } catch (error) {
    health.checks.database = {
      status: 'error',
      error: error.message
    };
    health.status = 'error';
  }

  // Vérifier la configuration OAuth
  health.checks.oauth = {
    client_id_configured: !!process.env.GOOGLE_CLIENT_ID,
    client_secret_configured: !!process.env.GOOGLE_CLIENT_SECRET,
    callback_url: `${process.env.PUBLIC_BASE_URL || 'auto'}/api/callback`
  };

  // Vérifier les tables de base de données
  try {
    if (process.env.POSTGRES_URL) {
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'sessions')
      `;
      health.checks.tables = {
        users: tablesResult.rows.some(row => row.table_name === 'users'),
        sessions: tablesResult.rows.some(row => row.table_name === 'sessions')
      };
    }
  } catch (error) {
    health.checks.tables = {
      error: error.message
    };
  }

  // Déterminer le statut global
  const hasCriticalErrors = !health.checks.environment.POSTGRES_URL || 
                           !health.checks.environment.GOOGLE_CLIENT_ID ||
                           !health.checks.environment.GOOGLE_CLIENT_SECRET ||
                           !health.checks.environment.SESSION_SECRET ||
                           health.checks.database?.status === 'error';

  if (hasCriticalErrors) {
    health.status = 'error';
    res.status(500);
  } else if (health.checks.database?.status === 'not_configured') {
    health.status = 'warning';
    res.status(200);
  } else {
    res.status(200);
  }

  return res.json(health);
}