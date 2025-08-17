import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!process.env.DATABASE_URL) {
    return res.status(200).json({ items: [] });
  }

  try {
    if (req.method === 'GET') {
      const { isFeatured, limit } = req.query;
      const limitValue = Number.parseInt(limit, 10) || 8;

      const products = await sql`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
        ${isFeatured === 'true' ? sql`AND p.is_featured = true` : sql``}
        ORDER BY p.created_at DESC
        LIMIT ${limitValue}
      `;

      res.status(200).json({ items: products.rows });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({
      message: 'Database error',
      error: error.message,
      hasDatabase: !!process.env.DATABASE_URL
    });
  }
}
