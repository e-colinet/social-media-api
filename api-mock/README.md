# API Mock Server

Serveur de bouchon PHP sans framework qui simule l'API Social Media basé sur le fichier OpenAPI YAML avec une syntaxe compatible WireMock.

## Fonctionnalités

- ✅ **Compatible WireMock** : Syntaxe identique aux bouchons WireMock
- ✅ **Sans framework** : PHP pur, aucune dépendance externe
- ✅ **Configuration flexible** : Répertoire de stubs configurable
- ✅ **CORS intégré** : Support CORS pour les applications web
- ✅ **Templating** : Variables dynamiques dans les réponses
- ✅ **Pattern matching** : Support des regex et JSONPath
- ✅ **Priorités** : Gestion des priorités de stubs
- ✅ **Délais simulés** : Simulation de latence réseau

## Installation

Aucune installation requise, PHP 7.4+ suffit.

```bash
cd api-mock
php start.php
```

## Utilisation

### Démarrage rapide

```bash
# Démarrage avec configuration par défaut
php start.php

# Démarrage avec options personnalisées
php start.php --host 0.0.0.0 --port 8080 --stubs ./stubs --debug
```

### Options de ligne de commande

```bash
php start.php [OPTIONS]

Options:
  -h, --host HOST     Host to bind to (default: 0.0.0.0)
  -p, --port PORT     Port to listen on (default: 8080)
  -s, --stubs DIR     Stubs directory (default: ./stubs)
  -d, --debug         Enable debug mode
  --help              Show this help message
```

### URLs d'accès

- **Serveur** : http://localhost:8080
- **Health Check** : http://localhost:8080/health
- **API** : http://localhost:8080/api/*

## Structure des stubs

Les stubs suivent la syntaxe WireMock standard :

```json
{
  "priority": 1,
  "request": {
    "method": "GET",
    "url": "/api/endpoint",
    "headers": {
      "Authorization": {
        "matches": "Bearer .*"
      }
    },
    "queryParameters": {
      "param": "value"
    },
    "bodyPatterns": [
      {
        "matchesJsonPath": "$.field"
      }
    ]
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "success": true,
      "data": "{{now}}"
    },
    "fixedDelayMilliseconds": 500
  }
}
```

## Matchers supportés

### URL Matching

```json
{
  "url": "/exact/path",                    // Correspondance exacte
  "urlPattern": "/users/\\d+",             // Pattern regex
  "urlPath": "/api/users",                 // Path exact
  "urlPathPattern": "/api/users/.*"        // Path pattern
}
```

### Header Matching

```json
{
  "headers": {
    "Content-Type": "application/json",    // Correspondance exacte
    "Authorization": {
      "matches": "Bearer .*",              // Pattern regex
      "contains": "Bearer",                // Contient
      "equalTo": "Bearer token123"         // Égal à
    }
  }
}
```

### Body Matching

```json
{
  "bodyPatterns": [
    {
      "equalTo": "exact body content"      // Corps exact
    },
    {
      "equalToJson": {"key": "value"}      // JSON exact
    },
    {
      "matchesJsonPath": "$.user.email"    // JSONPath
    },
    {
      "contains": "substring"              // Contient
    },
    {
      "matches": "regex.*pattern"          // Pattern regex
    }
  ]
}
```

## Variables de template

### Variables temporelles

```json
{
  "timestamp": "{{now}}",                  // ISO 8601 timestamp
  "unix_time": "{{now.timestamp}}"        // Unix timestamp
}
```

### Variables aléatoires

```json
{
  "uuid": "{{randomValue type='UUID'}}",
  "number": "{{randomValue type='INT' min=1 max=100}}"
}
```

### Variables de requête

```json
{
  "method": "{{request.method}}",
  "url": "{{request.url}}",
  "segment": "{{request.pathSegments.0}}"  // Premier segment d'URL
}
```

## Stubs fournis

Le serveur inclut des stubs pour l'API Social Media :

- `01-health-check.json` - Health check endpoint
- `02-auth-register.json` - Inscription utilisateur
- `03-auth-login.json` - Connexion utilisateur
- `04-auth-logout.json` - Déconnexion
- `05-user-profile.json` - Profil utilisateur
- `06-social-profiles-list.json` - Liste des profils sociaux
- `07-social-profile-create.json` - Création de profil
- `08-social-profile-show.json` - Affichage d'un profil
- `09-social-profile-update.json` - Mise à jour de profil
- `10-social-profile-delete.json` - Suppression de profil
- `11-social-profiles-by-platform.json` - Profils par plateforme
- `12-social-profile-sync.json` - Synchronisation de profil
- `99-not-found.json` - Réponse 404 par défaut

## Configuration

### Fichier de configuration

```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0"
  },
  "stubs": {
    "directory": "./stubs",
    "auto_reload": true
  },
  "cors": {
    "enabled": true,
    "origins": ["*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "headers": ["Content-Type", "Authorization", "X-Requested-With"]
  },
  "logging": {
    "enabled": true,
    "level": "debug"
  }
}
```

### Variables d'environnement

```bash
MOCK_HOST=0.0.0.0
MOCK_PORT=8080
MOCK_STUBS_DIR=./stubs
MOCK_CORS=1
MOCK_DEBUG=1
```

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

### Intégration avec le frontend

Modifiez l'URL de base de votre client API :

```javascript
// Dans votre frontend
const apiClient = new ApiClient('http://localhost:8080');
```

## Développement

### Ajout de nouveaux stubs

1. Créez un fichier JSON dans le répertoire `stubs/`
2. Suivez la syntaxe WireMock
3. Redémarrez le serveur ou utilisez l'auto-reload

### Debug

Activez le mode debug pour voir les requêtes :

```bash
php start.php --debug
```

### Logs

Les logs sont affichés dans la console en mode debug.

## Compatibilité

- **PHP** : 7.4+
- **WireMock** : Syntaxe compatible
- **CORS** : Support complet
- **JSON** : Validation et parsing automatique

## Licence

MIT License - Voir le fichier LICENSE pour plus de détails.