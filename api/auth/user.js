import jwt from 'jsonwebtoken';
import { createPool } from '@vercel/postgres';
import cookie from 'cookie';

// Initialize the database connection lazily. If the environment variable is
// missing (e.g. in demo environments), we don't want to throw an error at
// module import time. Instead we'll simply treat the user as unauthenticated.
const DATABASE_URL = process.env.DATABASE_URL;
const db = DATABASE_URL ? createPool({ connectionString: DATABASE_URL }) : null;

// Middleware pour parser les cookies
function parseCookies(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return {};
  return cookie.parse(cookieHeader);
}

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
    // Parser les cookies
    const cookies = parseCookies(req);
    const token = cookies.session;

    // Si pas de token, retourner null (utilisateur non connecté)
    if (!token) {
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ user: null });
    }

    // Vérifier le token JWT
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      console.error('SESSION_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      const decoded = jwt.verify(token, secret);
      if (!decoded || !decoded.sub) {
        res.setHeader('Cache-Control', 'no-store');
        return res.json({ user: null });
      }

      // Récupérer l'utilisateur depuis la base de données si disponible.
      if (!db) {
        // Pas de base de données configurée → considérer l'utilisateur comme non connecté.
        res.setHeader('Cache-Control', 'no-store');
        return res.json({ user: null });
      }

      const userResult = await db.sql`
        SELECT id, email, first_name, last_name, profile_image_url, role, created_at, updated_at
        FROM users
        WHERE id = ${decoded.sub}
      `;

      if (userResult.rows.length === 0) {
        res.setHeader('Cache-Control', 'no-store');
        return res.json({ user: null });
      }

      const user = userResult.rows[0];
      res.setHeader('Cache-Control', 'private, max-age=60');
      return res.json({ user });

    } catch (jwtError) {
      console.warn('JWT verification failed:', jwtError.message);
      res.setHeader('Cache-Control', 'no-store');
      return res.json({ user: null });
    }

  } catch (error) {
    console.error('User API error:', error);
    res.setHeader('Cache-Control', 'no-store');
    // En cas d'erreur, retourner simplement "user: null" afin d'éviter un 500
    // côté client lorsque la base de données est indisponible.
    return res.json({ user: null });
  }
}
