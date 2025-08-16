import { getUserFromRequest } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Vérifier les variables d'environnement critiques
    if (!process.env.POSTGRES_URL) {
      console.error('[AUTH/USER] POSTGRES_URL not configured');
      return res.status(500).json({ 
        authenticated: false, 
        error: 'Database not configured' 
      });
    }

    if (!process.env.SESSION_SECRET) {
      console.error('[AUTH/USER] SESSION_SECRET not configured');
      return res.status(500).json({ 
        authenticated: false, 
        error: 'Session not configured' 
      });
    }

    const user = await getUserFromRequest(req);
    if (!user) {
      console.log('[AUTH/USER] No authenticated user found');
      return res.status(401).json({ 
        authenticated: false,
        error: 'No valid session found'
      });
    }

    console.log(`[AUTH/USER] User authenticated: ${user.email}`);
    return res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        role: user.role ?? 'user',
      },
    });
  } catch (e) {
    console.error('[AUTH/USER] Error:', e);
    return res.status(500).json({ 
      authenticated: false,
      error: 'Internal server error',
      message: e.message 
    });
  }
}
