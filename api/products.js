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

  try {
    if (req.method === 'GET') {
      const { isFeatured, limit = 8 } = req.query;
      
      let query = `SELECT p.*, c.name as category_name FROM products p 
                   LEFT JOIN categories c ON p.category_id = c.id 
                   WHERE p.is_active = true`;
      
      if (isFeatured === 'true') {
        query += ` AND p.is_featured = true`;
      }
      
      query += ` ORDER BY p.created_at DESC LIMIT ${parseInt(limit)}`;
      
      const products = await sql.unsafe(query);
      res.status(200).json({ items: products.rows });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({
      message: 'Database error',
      error: error.message,
      hasDatabase: !!process.env.POSTGRES_URL
    });
  }
}
