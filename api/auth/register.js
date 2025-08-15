import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required' });
    }

    // Check if user already exists
    const { rows: existingUsers } = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const { rows: newUsers } = await sql`
      INSERT INTO users (email, password, username, role, created_at, updated_at)
      VALUES (${email}, ${hashedPassword}, ${username}, 'user', NOW(), NOW())
      RETURNING id, email, username, role, created_at
    `;

    const newUser = newUsers[0];

    res.status(201).json({
      message: 'Registration successful',
      user: newUser
    });
  } catch (error) {
    console.error('Register API error:', error);
    res.status(500).json({
      message: 'Database error',
      error: error.message
    });
  }
}
