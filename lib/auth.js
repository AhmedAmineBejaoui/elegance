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
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.SESSION_SECRET);
    const { rows } = await sql`
      SELECT id, email, first_name, last_name, avatar_url, role
      FROM users
      WHERE id = ${payload.sub}
      LIMIT 1
    `;
    return rows[0] || null;
  } catch {
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
