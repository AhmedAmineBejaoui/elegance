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
    res.status(200).json({
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'not configured',
        SESSION_SECRET: process.env.SESSION_SECRET ? 'configured' : 'not configured'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      message: 'Health check failed',
      error: error.message 
    });
  }
}
