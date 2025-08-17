# 🔧 Correction du Système d'Authentification Google

## Problèmes identifiés

1. **Erreurs 500 sur Vercel** : Les API Vercel ne fonctionnaient pas correctement
2. **Conflit entre systèmes d'authentification** : Passport.js (serveur) et JWT (API Vercel)
3. **Problèmes de middleware** : Les middlewares ne fonctionnaient pas sur Vercel

## Solutions implémentées

### 1. Simplification des API Vercel

**Fichiers modifiés :**
- `api/auth/user.js` : API autonome sans middleware
- `api/products.js` : API autonome sans middleware
- `api/callback.js` : Callback Google simplifié
- `api/login.js` : Redirection Google simplifiée
- `api/logout.js` : Déconnexion simplifiée
- `api/test.js` : Nouvelle API de diagnostic

### 2. Suppression des middlewares complexes

**Fichiers supprimés :**
- `api/index.js` : Middleware cookies
- `api/auth-middleware.js` : Middleware d'authentification

### 3. Gestion directe des cookies

Chaque API gère maintenant directement :
- Le parsing des cookies
- La vérification JWT
- La gestion des erreurs

## Configuration requise

### Variables d'environnement

Assurez-vous d'avoir ces variables dans Vercel :

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base de données
DATABASE_URL=your_database_url

# Sécurité
SESSION_SECRET=your_session_secret

# URLs
PUBLIC_BASE_URL=https://elegance-ten.vercel.app
```

## Diagnostic

### Test de l'API de diagnostic

Visitez cette URL pour diagnostiquer les problèmes :
```
https://elegance-ten.vercel.app/api/test
```

Cette API vérifie :
- Variables d'environnement
- Connexion à la base de données
- Configuration générale

## Flux d'authentification

1. **Clic sur "Se connecter avec Google"** → `/api/login`
2. **Redirection vers Google** → Authentification Google
3. **Callback Google** → `/api/callback`
   - Récupération du profil Google
   - Création/récupération de l'utilisateur en base
   - Création du token JWT
   - Définition du cookie de session
4. **Redirection vers l'accueil** → `/?auth=success`
5. **Détection automatique** → Rafraîchissement des données d'authentification

## Dépannage

### Erreur 500 "Internal Server Error"

1. **Vérifiez l'API de test** : `https://elegance-ten.vercel.app/api/test`
2. **Vérifiez les variables d'environnement** dans Vercel
3. **Vérifiez la connexion à la base de données**
4. **Redéployez l'application** après correction

### Erreur 401 "Unauthorized"

- Vérifiez que `SESSION_SECRET` est défini
- Vérifiez que le cookie `session` est présent
- Vérifiez que la base de données est accessible

### Erreur de base de données

- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que les tables existent
- Vérifiez les logs de la base de données

## Structure des fichiers

```
api/
├── auth/
│   └── user.js          # API utilisateur authentifié
├── callback.js          # Callback Google OAuth
├── login.js             # Redirection Google
├── logout.js            # Déconnexion
├── products.js          # API produits
└── test.js              # API de diagnostic

server/
├── auth.ts              # Configuration Passport + JWT
└── routes.ts            # Routes serveur

client/src/hooks/
└── useAuth.ts           # Hook d'authentification frontend
```

## Notes importantes

- Les API Vercel sont maintenant autonomes et ne dépendent plus de middlewares
- Chaque API gère directement ses propres erreurs
- L'authentification est persistante pendant 7 jours
- Le frontend détecte automatiquement les nouvelles authentifications
- Utilisez `/api/test` pour diagnostiquer les problèmes

## Prochaines étapes

1. Redéployez votre application sur Vercel
2. Testez l'API de diagnostic : `/api/test`
3. Corrigez les variables d'environnement si nécessaire
4. Testez l'authentification Google
5. Vérifiez que les produits s'affichent correctement
