import { sql } from '@vercel/postgres';

export const config = { runtime: 'nodejs' };

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getToken(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;)\s*token=([^;]+)/);
  return match ? match[1] : null;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const token = getToken(req);

    if (!token) {
      return res.status(200).json({
        user: null,
        authenticated: false,
      });
    }

    const { rows } = await sql`SELECT id, email, first_name, last_name, role FROM users WHERE id = ${token} LIMIT 1`;
    const user = rows[0];

    if (!user) {
      return res.status(200).json({
        user: null,
        authenticated: false,
      });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      authenticated: true,
    });
  } catch (error) {
    console.error('Auth user API error:', error);
    res.status(200).json({
      user: null,
      authenticated: false,
    });
  }
}
