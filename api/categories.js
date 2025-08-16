import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Early return if database is not configured
  if (!process.env.POSTGRES_URL) {
    res.status(503).json({ message: 'Database not configured' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM categories ORDER BY name`;
      res.status(200).json(rows);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({
      message: 'Database error',
      error: error.message,
      hasDatabase: !!process.env.POSTGRES_URL
    });
  }
}
