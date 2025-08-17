import cookie from 'cookie';

// Middleware pour parser les cookies
function parseCookies(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return {};
  
  return cookie.parse(cookieHeader);
}

// Middleware pour ajouter les cookies à la requête
export function withCookies(handler) {
  return async (req, res) => {
    req.cookies = parseCookies(req);
    return handler(req, res);
  };
}

export default function handler(req, res) {
  res.status(200).json({ message: 'API is running' });
}