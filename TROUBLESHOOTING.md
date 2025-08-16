# 🔧 Guide de dépannage - Authentification Google

## 🚨 Problèmes critiques identifiés et solutions

### 1. Erreur `missing_connection_string` (500 sur `/api/callback`)

**Symptômes :**
- Erreur 500 sur `/api/callback`
- Message : "You did not supply a 'connectionString'"

**Solution :**
```bash
# 1. Vérifier la configuration
npm run check-env

# 2. Configurer POSTGRES_URL dans .env
POSTGRES_URL=postgres://username:password@host:port/database

# 3. Initialiser la base de données
npm run init-db
```

**Pour Neon spécifiquement :**
1. Allez sur https://console.neon.tech/
2. Créez un nouveau projet ou sélectionnez un existant
3. Copiez l'URL de connexion (format : `postgres://user:password@ep-xxx-xxx-xxx.region.aws.neon.tech/database`)

### 2. Erreur `invalid_grant` (400 sur `/api/callback`)

**Symptômes :**
- Erreur 400 sur `/api/callback`
- Message : "invalid_grant" dans la réponse JSON

**Solution :**
1. Vérifiez l'URL de callback dans Google Console :
   - Allez sur https://console.cloud.google.com/
   - APIs & Services > Credentials
   - Modifiez votre OAuth 2.0 Client ID
   - **Authorized redirect URIs** doit être exactement : `https://your-domain.vercel.app/api/callback`

2. Vérifiez les domaines autorisés :
   - **Authorized JavaScript origins** : `https://your-domain.vercel.app`

### 3. Erreur 401 sur `/api/auth/user`

**Symptômes :**
- Erreur 401 sur `/api/auth/user`
- Utilisateur non authentifié après Google OAuth

**Solution :**
```bash
# 1. Vérifier SESSION_SECRET
npm run generate-secret
# Ajoutez le secret généré à votre .env

# 2. Vérifier la base de données
npm run init-db

# 3. Tester l'endpoint de santé
curl https://your-domain.vercel.app/api/health
```

## 🔍 Diagnostic étape par étape

### Étape 1 : Vérifier la configuration
```bash
npm run check-env
```

### Étape 2 : Tester l'authentification
```bash
npm run test-auth
```

### Étape 3 : Initialiser la base de données
```bash
npm run init-db
```

### Étape 4 : Tester l'endpoint de santé
```bash
curl https://your-domain.vercel.app/api/health
```

## 📋 Checklist de configuration

- [ ] `POSTGRES_URL` configuré et accessible
- [ ] `GOOGLE_CLIENT_ID` configuré
- [ ] `GOOGLE_CLIENT_SECRET` configuré
- [ ] `SESSION_SECRET` configuré (généré avec `npm run generate-secret`)
- [ ] `PUBLIC_BASE_URL` configuré (optionnel, auto-détecté)
- [ ] URL de callback configurée dans Google Console
- [ ] Tables `users` et `sessions` créées
- [ ] Endpoint `/api/health` retourne `status: "ok"`

## 🐛 Logs de debugging

### Logs utiles à surveiller :

**Authentification réussie :**
```
[LOGIN] Redirecting to Google OAuth with callback: https://domain.vercel.app/api/callback
[AUTH] User authenticated: user@example.com
[AUTH/USER] User authenticated: user@example.com
```

**Erreurs courantes :**
```
[CALLBACK ERROR] Missing Google OAuth credentials
[CALLBACK ERROR] Missing SESSION_SECRET
[AUTH] No session token found
[AUTH] POSTGRES_URL not configured
[AUTH/USER] No authenticated user found
```

## 🔧 Scripts de diagnostic

```bash
# Vérifier la configuration complète
npm run check-env

# Tester la configuration OAuth
npm run test-auth

# Initialiser/réparer la base de données
npm run init-db

# Générer un nouveau secret de session
npm run generate-secret

# Tester l'endpoint de santé
curl https://your-domain.vercel.app/api/health
```

## 📞 Support

Si les problèmes persistent :

1. **Vérifiez les logs Vercel :**
   ```bash
   vercel logs --follow
   ```

2. **Testez l'endpoint de santé :**
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

3. **Vérifiez la configuration Google OAuth :**
   - URL de callback exacte
   - Domaines autorisés
   - API Google+ activée

4. **Vérifiez la base de données :**
   - Connexion accessible
   - Tables créées
   - Permissions utilisateur

**Pour Neon spécifiquement :**
- Surveillez l'utilisation dans Neon Console
- Vérifiez les paramètres de sécurité Neon
- Utilisez les logs Neon pour le debugging
- Testez la connexion depuis le dashboard Neon

## 🚀 Déploiement sur Vercel avec Neon

### Variables d'environnement Vercel :

1. Allez dans votre projet Vercel
2. Settings > Environment Variables
3. Ajoutez toutes les variables du fichier `.env.example`

### Ordre de configuration recommandé :

1. **Configurez Neon PostgreSQL :**
   - Allez sur https://console.neon.tech/
   - Créez un nouveau projet
   - Copiez l'URL de connexion dans `POSTGRES_URL`

2. **Configurez Google OAuth :**
   - Configurez `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET`
   - Vérifiez l'URL de callback dans Google Console

3. **Configurez les sessions :**
   - Générez et configurez `SESSION_SECRET` avec `npm run generate-secret`

4. **Configurez l'application :**
   - Configurez `PUBLIC_BASE_URL` (optionnel)

5. **Déployez et testez :**
   - Redéployez l'application sur Vercel
   - Testez avec `/api/health`
   - Testez l'authentification Google

### Avantages de Neon avec Vercel :

- ✅ Hébergement serverless optimisé
- ✅ Intégration native avec Vercel
- ✅ Connexions automatiquement gérées
- ✅ Monitoring et logs intégrés
- ✅ Pas de configuration de pool de connexions
- ✅ Mise à l'échelle automatique

---

**💡 Conseil :** Commencez toujours par `npm run check-env` pour identifier les variables manquantes !

**🌟 Recommandation :** Neon PostgreSQL est la solution optimale pour Vercel !