import { createPool } from '@vercel/postgres';

// Create the database pool only if the environment variable is provided.
// This avoids throwing an exception at import time when the API is executed
// in an environment without a configured database (e.g. preview deployments
// or local demos). Instead of crashing, we'll gracefully return an empty
// result set.
const DATABASE_URL = process.env.DATABASE_URL;
const db = DATABASE_URL ? createPool({ connectionString: DATABASE_URL }) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      if (!db) {
        // If the database isn't configured, return an empty array instead of
        // an error so the front‑end can still render without blowing up.
        res.status(200).json([]);
        return;
      }

      const { rows } = await db.sql`SELECT * FROM categories ORDER BY name`;
      res.status(200).json(rows);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({
      message: 'Database error',
      error: error.message,
      hasDatabase: !!DATABASE_URL
    });
  }
}
