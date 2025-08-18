# Tests API

Ce dossier contient des scripts PowerShell pour tester les routes CRUD de l'API.

## Configuration

- Modifier l'URL de base dans chaque script si besoin :
  ```powershell
  $BASE_URL = "https://elegance-ten.vercel.app"
  ```
- Pour les routes nécessitant une session, coller vos cookies dans la variable `$COOKIE` :
  ```powershell
  $COOKIE = "sid=...; other=..."
  ```

## Exécution

Depuis PowerShell :

```powershell
cd scripts\api-tests
# exemple
.\products_list.ps1
```

Pour lancer les tests de base :

```powershell
.\run_all.ps1
```

## Codes HTTP courants

- **401** : non connecté → ajouter `$COOKIE`.
- **404/405** : problème de routing Vercel → vérifier catch-all `/api/[...all]` et `vercel.json`.
- **500** : erreur serveur (DB/validation) → vérifier `DATABASE_URL` (host `-pooler` + `?sslmode=require`) et les logs Vercel.

> Si `categories_delete.ps1 -Id 1` échoue, utiliser un identifiant de catégorie existant.
