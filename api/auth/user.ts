export default function handler(req: any, res: any) {
  // Simule un utilisateur non connecté
  res.status(200).json({ authenticated: false, user: null });
}
