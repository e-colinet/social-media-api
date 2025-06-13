# Quick Start - API Mock Server

## Installation rapide

```bash
# Aucune installation requise, PHP 7.4+ suffit
cd api-mock
```

## Démarrage en 30 secondes

```bash
# 1. Démarrer le serveur
php start.php

# 2. Tester le health check
curl http://localhost:8080/health

# 3. Tester l'API complète
php test.php
```

## Commandes essentielles

```bash
# Gestion du serveur
php manage.php start --port 8080    # Démarrer
php manage.php stop                  # Arrêter
php manage.php status                # État du serveur
php manage.php restart               # Redémarrer

# Gestion des stubs
php manage.php validate              # Valider tous les stubs
php manage.php list-stubs            # Lister les stubs
php manage.php test                  # Tester l'API

# Aide
php manage.php help                  # Aide complète
```

## Configuration rapide

```bash
# Copier la configuration d'exemple
cp .env.example .env

# Éditer la configuration
nano .env
```

## Utilisation avec différents répertoires de stubs

```bash
# Stubs par défaut (complets)
php start.php --stubs ./stubs

# Stubs minimaux (pour tests rapides)
php start.php --stubs ./stubs-minimal

# Stubs personnalisés
php start.php --stubs /path/to/custom/stubs
```

## Endpoints disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/health` | GET | Health check |
| `/auth/login` | POST | Connexion utilisateur |
| `/auth/register` | POST | Inscription utilisateur |
| `/auth/logout` | POST | Déconnexion |
| `/user` | GET | Profil utilisateur |
| `/social-media-profiles` | GET | Liste des profils |
| `/social-media-profiles` | POST | Créer un profil |
| `/social-media-profiles/{id}` | GET | Voir un profil |
| `/social-media-profiles/{id}` | PUT | Modifier un profil |
| `/social-media-profiles/{id}` | DELETE | Supprimer un profil |
| `/social-media-profiles/{id}/sync` | POST | Synchroniser un profil |
| `/social-media-profiles/platform/{platform}` | GET | Profils par plateforme |

## Exemples d'utilisation

### Test avec curl

```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'

# Liste des profils (avec token)
curl http://localhost:8080/social-media-profiles \
  -H "Authorization: Bearer your-token-here"
```

### Intégration frontend

```javascript
// Modifier l'URL de base de votre client API
const apiClient = new ApiClient('http://localhost:8080');
```

## Créer un nouveau stub

1. **Créer un fichier JSON** dans `stubs/`
2. **Suivre la syntaxe WireMock** :

```json
{
  "priority": 1,
  "request": {
    "method": "GET",
    "url": "/my-endpoint"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "message": "Hello World",
      "timestamp": "{{now}}"
    }
  }
}
```

3. **Valider** : `php manage.php validate`
4. **Tester** : `curl http://localhost:8080/my-endpoint`

## Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier si le port est libre
php manage.php status

# Changer de port
php start.php --port 8081
```

### Stub non reconnu
```bash
# Valider la syntaxe
php manage.php validate

# Vérifier les priorités
php manage.php list-stubs
```

### Réponse inattendue
```bash
# Activer le debug
php start.php --debug

# Vérifier les logs dans la console
```

## Support

- 📖 **Documentation complète** : `README.md`
- 🔧 **Compatibilité WireMock** : `WIREMOCK_COMPATIBILITY.md`
- 💡 **Exemples** : Répertoire `stubs/`
- 🧪 **Tests** : `php test.php`