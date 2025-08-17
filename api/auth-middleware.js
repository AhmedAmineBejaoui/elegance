import jwt from 'jsonwebtoken';
import { createPool } from '@vercel/postgres';

// Middleware pour vérifier l'authentification JWT
export function withAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.cookies?.session;
      
      if (!token) {
        return res.status(401).json({ message: 'No session token found' });
      }

      const secret = process.env.SESSION_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'SESSION_SECRET not configured' });
      }

      const decoded = jwt.verify(token, secret);
      if (!decoded || !decoded.sub) {
        return res.status(401).json({ message: 'Invalid session token' });
      }

      // Récupérer les informations complètes de l'utilisateur depuis la base de données
      const db = createPool({ connectionString: process.env.DATABASE_URL });
      const userResult = await db.sql`
        SELECT id, email, first_name, last_name, profile_image_url, role, created_at, updated_at
        FROM users 
        WHERE id = ${decoded.sub}
      `;

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = userResult.rows[0];
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(500).json({ message: 'Authentication error' });
    }
  };
}

// Middleware pour vérifier l'authentification optionnelle (ne bloque pas si pas connecté)
export function withOptionalAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.cookies?.session;
      
      if (token) {
        const secret = process.env.SESSION_SECRET;
        if (secret) {
          try {
            const decoded = jwt.verify(token, secret);
            if (decoded && decoded.sub) {
              // Récupérer les informations complètes de l'utilisateur
              const db = createPool({ connectionString: process.env.DATABASE_URL });
              const userResult = await db.sql`
                SELECT id, email, first_name, last_name, profile_image_url, role, created_at, updated_at
                FROM users 
                WHERE id = ${decoded.sub}
              `;

              if (userResult.rows.length > 0) {
                req.user = userResult.rows[0];
              }
            }
          } catch (error) {
            // Token invalide, mais on continue sans authentification
            console.warn('Invalid token in optional auth:', error.message);
          }
        }
      }
      
      return handler(req, res);
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      return handler(req, res);
    }
  };
}
