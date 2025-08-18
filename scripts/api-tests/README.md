# Tests API

- Modifier `BASE_URL` si besoin. Pour routes protégées, coller les cookies dans `$COOKIE`.
- Exemples : `.\products_list.ps1`, `.\products_create.ps1 -Name "X" -Price 10 -CategoryId 1`, `.\profile_update.ps1 -FirstName "Ahmed"`.
- Interprétation : **401** (non connecté), **404/405** (routing Vercel à corriger), **500** (serveur/DB → revoir `DATABASE_URL` + logs).
- `GET $BASE_URL/api/healthz` doit renvoyer `{ ok: true }`.
