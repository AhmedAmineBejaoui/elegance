# 🔧 Guide de Dépannage - Erreurs 500

## Problème actuel
Votre application affiche des erreurs 500 pour les API `/api/auth/user` et `/api/products`. Cela indique un problème de configuration ou de connexion à la base de données.

## Étapes de diagnostic

### 1. Test de l'API de diagnostic
Visitez cette URL pour diagnostiquer le problème :
```
https://elegance-ten.vercel.app/api/test
```

Cette API vous dira :
- Si les variables d'environnement sont configurées
- Si la connexion à la base de données fonctionne
- Les détails de configuration

### 2. Vérification des variables d'environnement sur Vercel

Allez dans votre dashboard Vercel :
1. Ouvrez votre projet
2. Allez dans "Settings" → "Environment Variables"
3. Vérifiez que ces variables sont définies :

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=votre_secret_tres_long_et_complexe
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
PUBLIC_BASE_URL=https://elegance-ten.vercel.app
```

### 3. Vérification de la base de données

Si l'API de test indique un problème de base de données :

1. **Vérifiez que votre base de données est active**
2. **Vérifiez que l'URL de connexion est correcte**
3. **Vérifiez que les tables existent** :
   ```sql
   SELECT * FROM users LIMIT 1;
   SELECT * FROM products LIMIT 1;
   SELECT * FROM categories LIMIT 1;
   ```

### 4. Redéploiement

Après avoir corrigé les variables d'environnement :

1. Allez dans votre dashboard Vercel
2. Cliquez sur "Deployments"
3. Cliquez sur "Redeploy" sur le dernier déploiement

## Solutions courantes

### Problème : DATABASE_URL manquant
**Solution :** Ajoutez la variable `DATABASE_URL` dans les paramètres Vercel

### Problème : SESSION_SECRET manquant
**Solution :** Générez un secret et ajoutez-le :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Problème : Base de données inaccessible
**Solutions possibles :**
1. Vérifiez que votre base de données est active
2. Vérifiez les paramètres de sécurité (IP whitelist)
3. Vérifiez que l'URL de connexion est correcte

### Problème : Tables manquantes
**Solution :** Exécutez les migrations Drizzle :
```bash
npm run db:migrate
```

## Test après correction

1. Visitez `https://elegance-ten.vercel.app/api/test`
2. Vérifiez que tous les tests passent
3. Testez l'authentification Google
4. Vérifiez que les produits s'affichent

## Logs Vercel

Pour voir les logs d'erreur détaillés :
1. Allez dans votre dashboard Vercel
2. Cliquez sur "Functions"
3. Regardez les logs des fonctions `/api/auth/user` et `/api/products`

## Contact

Si le problème persiste après avoir suivi ce guide, partagez :
1. Le résultat de `/api/test`
2. Les logs d'erreur de Vercel
3. La configuration de vos variables d'environnement (sans les valeurs sensibles)
