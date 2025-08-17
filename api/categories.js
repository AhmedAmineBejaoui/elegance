import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!process.env.POSTGRES_URL) {
    return res.status(200).json([{ id: 1, name: 'Test' }]);
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
