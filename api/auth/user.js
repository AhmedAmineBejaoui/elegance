// /api/auth/user.js
import jwt from "jsonwebtoken";

function getCookie(name, cookieHeader = "") {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req, res) {
  try {
    const token = getCookie("session", req.headers.cookie || "");
    if (!token) return res.status(401).json({ authenticated: false });

    const secret = process.env.SESSION_SECRET;
    const decoded = jwt.verify(token, secret);

    return res.status(200).json({
      authenticated: true,
      user: { id: decoded.sub, email: decoded.email }
    });
  } catch (e) {
    console.error("[AUTH/USER]", e);
    return res.status(401).json({ authenticated: false });
  }
}
