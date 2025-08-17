import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Vérifier si la base de données est configurée
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        message: 'Database not configured',
        error: 'DATABASE_URL missing'
      });
    }

    // Créer la connexion à la base de données
    const db = createPool({ connectionString: process.env.DATABASE_URL });
    
    // Test simple de connexion
    try {
      const testResult = await db.sql`SELECT 1 as test`;
      console.log('Database connection test:', testResult);
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({
        message: 'Database connection failed',
        error: dbError.message
      });
    }

    // Requête simple pour les produits
    try {
      const products = await db.sql`
        SELECT * FROM products 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 8
      `;

      res.status(200).json({ 
        items: products.rows,
        count: products.rows.length
      });
    } catch (queryError) {
      console.error('Products query failed:', queryError);
      res.status(500).json({
        message: 'Products query failed',
        error: queryError.message
      });
    }

  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}
