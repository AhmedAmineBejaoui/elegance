// /api/auth/user.js
import { withCookies } from '../index.js';
import { withOptionalAuth } from '../auth-middleware.js';

async function userHandler(req, res) {
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
    // Si l'utilisateur est authentifié, retourner ses informations
    if (req.user) {
      res.set('Cache-Control', 'private, max-age=60');
      return res.json({ user: req.user });
    }

    // Sinon, retourner null (utilisateur non connecté)
    res.set('Cache-Control', 'no-store');
    return res.json({ user: null });
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default withOptionalAuth(withCookies(userHandler));
