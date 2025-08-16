
# Elegance - Application E-commerce

Une application e-commerce moderne avec authentification Google OAuth, construite avec Express.js, React, et PostgreSQL.

## 🚨 Problèmes d'authentification Google - SOLUTIONS

### Problèmes identifiés et corrigés :

1. **Erreur `missing_connection_string`** ✅ CORRIGÉ
   - Problème : `POSTGRES_URL` non configuré
   - Solution : Configuration de la base de données PostgreSQL

2. **Erreur `invalid_grant` sur `/api/callback`** ✅ CORRIGÉ
   - Problème : Configuration OAuth incorrecte
   - Solution : Vérification des variables d'environnement

3. **Erreur 401 sur `/api/auth/user`** ✅ CORRIGÉ
   - Problème : Gestion des sessions défaillante
   - Solution : Amélioration de la gestion des sessions JWT

## 🛠️ Configuration requise

### Variables d'environnement critiques :

```bash
# Base de données PostgreSQL (Recommandé: Neon)
POSTGRES_URL=postgres://username:password@host:port/database
# Exemple Neon: postgres://user:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Sessions
SESSION_SECRET=your_long_random_secret_key

# Application
PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## 🚀 Installation et configuration

### 1. Vérifier la configuration

```bash
# Vérifier que toutes les variables d'environnement sont configurées
npm run check-env
```

### 2. Initialiser la base de données

```bash
# Créer les tables nécessaires pour l'authentification
npm run init-db
```

### 3. Vérifier l'état de l'application

```bash
# Tester l'endpoint de santé
curl https://your-domain.vercel.app/api/health
```

## 🔧 Configuration Google OAuth

### 1. Créer un projet Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ API

### 2. Configurer les identifiants OAuth

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configurez l'application :
   - **Application type** : Web application
   - **Authorized redirect URIs** : `https://your-domain.vercel.app/api/callback`
   - **Authorized JavaScript origins** : `https://your-domain.vercel.app`

### 3. Récupérer les identifiants

- Copiez le **Client ID** et **Client Secret**
- Ajoutez-les à vos variables d'environnement

## 🗄️ Configuration de la base de données

### Option 1 : Neon PostgreSQL (Recommandé pour Vercel) ⭐

1. Allez sur [Neon Console](https://console.neon.tech/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Copiez l'URL de connexion dans `POSTGRES_URL`
4. **Avantages Neon :**
   - Hébergement serverless optimisé
   - Intégration native avec Vercel
   - Connexions automatiquement gérées
   - Monitoring et logs intégrés

### Option 2 : Vercel Postgres

1. Dans votre dashboard Vercel, allez dans "Storage"
2. Créez une nouvelle base de données PostgreSQL
3. Copiez l'URL de connexion dans `POSTGRES_URL`

### Option 3 : Base de données externe

1. Créez une base de données PostgreSQL
2. Configurez l'URL de connexion
3. Assurez-vous que l'utilisateur a les permissions nécessaires

## 🔍 Diagnostic des problèmes

### Endpoint de santé

```bash
GET /api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "checks": {
    "environment": {
      "POSTGRES_URL": true,
      "GOOGLE_CLIENT_ID": true,
      "GOOGLE_CLIENT_SECRET": true,
      "SESSION_SECRET": true
    },
    "database": {
      "status": "connected",
      "test": true
    },
    "oauth": {
      "client_id_configured": true,
      "client_secret_configured": true,
      "callback_url": "https://your-domain.vercel.app/api/callback"
    },
    "tables": {
      "users": true,
      "sessions": true
    }
  }
}
```

### Logs de debugging

Les logs suivants vous aideront à diagnostiquer les problèmes :

- `[LOGIN] Redirecting to Google OAuth with callback: ...`
- `[CALLBACK ERROR] Missing Google OAuth credentials`
- `[AUTH] User authenticated: user@example.com`
- `[AUTH/USER] No authenticated user found`

## 🐛 Résolution des problèmes courants

### Erreur 500 sur `/api/callback`

**Cause** : Variables d'environnement manquantes
**Solution** :
```bash
npm run check-env
```

### Erreur `invalid_grant`

**Cause** : URL de callback incorrecte dans Google Console
**Solution** :
1. Vérifiez que l'URL de callback dans Google Console correspond exactement à `https://your-domain.vercel.app/api/callback`
2. Assurez-vous que le domaine est autorisé

### Erreur 401 sur `/api/auth/user`

**Cause** : Session invalide ou base de données non accessible
**Solution** :
1. Vérifiez la connexion à la base de données : `npm run init-db`
2. Vérifiez que `SESSION_SECRET` est configuré
3. Testez l'endpoint de santé : `/api/health`

### Erreur de connexion à la base de données

**Cause** : `POSTGRES_URL` incorrect ou base de données inaccessible
**Solution** :
1. Vérifiez l'URL de connexion
2. Testez la connexion : `npm run init-db`
3. Vérifiez les permissions de l'utilisateur de base de données

**Pour Neon spécifiquement :**
1. Vérifiez que l'URL de connexion Neon est correcte
2. Assurez-vous que le projet Neon est actif
3. Vérifiez les paramètres de sécurité dans Neon Console
4. Testez la connexion depuis le dashboard Neon

## 📝 Scripts utiles

```bash
# Vérifier la configuration
npm run check-env

# Initialiser la base de données
npm run init-db

# Tester l'authentification
npm run test-auth

# Générer un secret de session
npm run generate-secret

# Tester l'endpoint de santé
curl https://your-domain.vercel.app/api/health

# Vérifier les logs en temps réel (Vercel)
vercel logs --follow
```

## 🔒 Sécurité

- Utilisez des secrets forts pour `SESSION_SECRET`
- Ne committez jamais les variables d'environnement
- Utilisez HTTPS en production
- Configurez correctement les domaines autorisés dans Google Console

## 📞 Support

Si vous rencontrez encore des problèmes après avoir suivi ces instructions :

1. Vérifiez les logs de l'application
2. Testez l'endpoint `/api/health`
3. Vérifiez la configuration Google OAuth
4. Assurez-vous que la base de données est accessible

**Pour Neon :**
- Surveillez l'utilisation dans Neon Console
- Vérifiez les paramètres de sécurité Neon
- Utilisez les logs Neon pour le debugging

---

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```
