import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // For basic auth, check Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(200).json({ 
        user: null, 
        authenticated: false 
      });
    }

    // Extract user ID from token (simplified)
    const token = authHeader.substring(7);
    
    // In a real implementation, you'd verify the JWT token here
    // For now, treat token as user ID for simplicity
    const users = await sql`SELECT id, email, username, role FROM users WHERE id = ${token} LIMIT 1`;
    const user = users[0];

    if (!user) {
      return res.status(200).json({ 
        user: null, 
        authenticated: false 
      });
    }

    res.status(200).json({ 
      user: user, 
      authenticated: true 
    });
  } catch (error) {
    console.error('Auth user API error:', error);
    res.status(200).json({ 
      user: null, 
      authenticated: false 
    });
  }
}