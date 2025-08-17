import { createPool } from '@vercel/postgres';

// Lazily create the pool only if a database URL is provided. This avoids
// crashing the API at import time when running in environments without a
// database configured (e.g. local demos).
const DATABASE_URL = process.env.DATABASE_URL;
const db = DATABASE_URL
  ? createPool({ connectionString: DATABASE_URL })
  : null;

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!db) {
    console.error('Database not configured - DATABASE_URL missing');
    res.status(500).json({ 
      message: 'Database not configured', 
      hasDatabase: false,
      error: 'DATABASE_URL environment variable is not set'
    });
    return;
  }

  try {
    if (req.method === 'GET') {
      const { isFeatured, limit } = req.query;
      const limitValue = Number.parseInt(limit, 10) || 8;

      // Vérifier que la base de données est accessible
      try {
        const products = await db.sql`
          SELECT p.*, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_active = true
          ${isFeatured === 'true' ? db.sql`AND p.is_featured = true` : db.sql``}
          ORDER BY p.created_at DESC
          LIMIT ${limitValue}
        `;

        res.status(200).json({ items: products.rows });
      } catch (dbError) {
        console.error('Database query error:', dbError);
        res.status(500).json({
          message: 'Database query failed',
          error: dbError.message,
          hasDatabase: true
        });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      hasDatabase: !!DATABASE_URL
    });
  }
}
