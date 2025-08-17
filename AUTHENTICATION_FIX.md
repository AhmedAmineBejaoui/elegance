# 🔧 Correction du Système d'Authentification Google

## Problèmes identifiés

1. **Conflit entre deux systèmes d'authentification** : Passport.js (serveur) et JWT (API Vercel)
2. **Erreurs 401/500** : Les routes API ne reconnaissaient pas l'utilisateur authentifié
3. **Redirection incorrecte** : Après l'authentification Google, l'utilisateur n'était pas reconnu

## Solutions implémentées

### 1. Unification du système d'authentification

**Fichiers modifiés :**
- `server/auth.ts` : Ajout du middleware JWT en plus de Passport
- `api/callback.js` : Création/récupération de l'utilisateur en base de données
- `api/auth-middleware.js` : Nouveau middleware d'authentification pour les API Vercel

### 2. Gestion des cookies

**Fichiers modifiés :**
- `api/index.js` : Middleware pour parser les cookies
- `api/products.js` : Ajout du middleware withCookies
- `api/auth/user.js` : Nouvelle API pour récupérer l'utilisateur
- `api/logout.js` : API de déconnexion améliorée

### 3. Amélioration du frontend

**Fichiers modifiés :**
- `client/src/hooks/useAuth.ts` : Détection automatique de l'authentification réussie

## Configuration requise

### Variables d'environnement

Assurez-vous d'avoir ces variables dans votre `.env` :

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Base de données
DATABASE_URL=your_database_url

# Sécurité
SESSION_SECRET=your_session_secret

# URLs
PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### Configuration Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez un projet existant
3. Activez l'API Google+ API
4. Créez des identifiants OAuth 2.0
5. Ajoutez l'URL de redirection : `https://your-domain.vercel.app/api/callback`

## Test de l'authentification

### 1. Test manuel

1. Allez sur votre site
2. Cliquez sur "Se connecter avec Google"
3. Authentifiez-vous avec Google
4. Vous devriez être redirigé vers la page d'accueil avec `?auth=success`
5. Vérifiez que vous êtes connecté (nom d'utilisateur visible, panier accessible)

### 2. Test automatisé

```bash
node test-auth.js
```

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

### Erreur 401 "Unauthorized"

- Vérifiez que `SESSION_SECRET` est défini
- Vérifiez que le cookie `session` est présent
- Vérifiez que la base de données est accessible

### Erreur 500 "Database error"

- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que la table `users` existe
- Vérifiez les logs de la base de données

### Redirection en boucle

- Vérifiez que l'URL de callback Google correspond à `/api/callback`
- Vérifiez que `PUBLIC_BASE_URL` est correct

## Structure des fichiers

```
api/
├── auth-middleware.js    # Middleware d'authentification JWT
├── auth/
│   └── user.js          # API utilisateur authentifié
├── callback.js          # Callback Google OAuth
├── index.js             # Middleware cookies
├── login.js             # Redirection Google
├── logout.js            # Déconnexion
└── products.js          # API produits (avec auth)

server/
├── auth.ts              # Configuration Passport + JWT
└── routes.ts            # Routes serveur

client/src/hooks/
└── useAuth.ts           # Hook d'authentification frontend
```

## Notes importantes

- Le système utilise maintenant JWT pour les API Vercel et Passport pour le serveur local
- Les cookies sont automatiquement gérés par le middleware
- L'authentification est persistante pendant 7 jours
- Le frontend détecte automatiquement les nouvelles authentifications
