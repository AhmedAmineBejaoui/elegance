import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export const config = { runtime: 'nodejs' };

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  // Early return if database is not configured
  if (!process.env.POSTGRES_URL) {
    res.status(503).json({ message: 'Database not configured' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const { rows } = await sql`SELECT id, password_hash, first_name, last_name, email, role FROM users WHERE email = ${email} LIMIT 1`;
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.setHeader('Set-Cookie', `token=${user.id}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login API error:', error);
    res.status(500).json({ message: 'Internal error' });
  }
}
