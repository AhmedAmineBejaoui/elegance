import { getUserFromRequest } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ authenticated: false });

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
    console.error('[AUTH/USER]', e);
    return res.status(401).json({ authenticated: false });
  }
}
