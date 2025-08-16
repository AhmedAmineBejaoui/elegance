import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';

function getCookie(name, cookieHeader = '') {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function readSessionToken(req) {
  if (req.cookies?.session) return req.cookies.session;
  return getCookie('session', req.headers.cookie || '');
}

export async function getUserFromRequest(req) {
  const token = readSessionToken(req);
  if (!token) {
    console.log('[AUTH] No session token found');
    return null;
  }
  
  try {
    // Vérifier que SESSION_SECRET est configuré
    if (!process.env.SESSION_SECRET) {
      console.error('[AUTH] SESSION_SECRET not configured');
      return null;
    }

    const payload = jwt.verify(token, process.env.SESSION_SECRET);
    
    // Vérifier que POSTGRES_URL est configuré
    if (!process.env.POSTGRES_URL) {
      console.error('[AUTH] POSTGRES_URL not configured');
      return null;
    }

    const { rows } = await sql`
      SELECT id, email, first_name, last_name, avatar_url, role
      FROM users
      WHERE id = ${payload.sub}
      LIMIT 1
    `;
    
    if (rows.length === 0) {
      console.log(`[AUTH] User not found in database: ${payload.sub}`);
      return null;
    }
    
    console.log(`[AUTH] User authenticated: ${rows[0].email}`);
    return rows[0];
  } catch (jwtError) {
    console.error('[AUTH] JWT verification failed:', jwtError.message);
    return null;
  } catch (dbError) {
    console.error('[AUTH] Database error:', dbError.message);
    return null;
  }
}

export async function requireAdmin(req, res) {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ message: 'Auth required' });
    return null;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Admins only' });
    return null;
  }
  return user;
}
