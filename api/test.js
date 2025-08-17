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
    // Vérifier les variables d'environnement
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      SESSION_SECRET: !!process.env.SESSION_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    };

    // Tester la connexion à la base de données
    let dbTest = { success: false, error: null };
    if (process.env.DATABASE_URL) {
      try {
        const { createPool } = await import('@vercel/postgres');
        const db = createPool({ connectionString: process.env.DATABASE_URL });
        
        // Test simple de connexion
        const result = await db.sql`SELECT 1 as test`;
        dbTest = { success: true, message: 'Database connection successful' };
      } catch (error) {
        dbTest = { success: false, error: error.message };
      }
    }

    res.status(200).json({
      message: 'API test endpoint',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbTest,
      headers: {
        host: req.headers.host,
        origin: req.headers.origin,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
