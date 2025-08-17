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
  if (!process.env.DATABASE_URL) {
    res.status(503).json({ message: 'Database not configured' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const { rows: existingUsers } = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows: newUsers } = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at)
      VALUES (${email}, ${hashedPassword}, ${firstName}, ${lastName}, 'customer', NOW(), NOW())
      RETURNING id, email, first_name, last_name, role
    `;

    const user = newUsers[0];

    res.setHeader('Set-Cookie', `token=${user.id}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register API error:', error);
    res.status(500).json({ message: 'Internal error' });
  }
}
