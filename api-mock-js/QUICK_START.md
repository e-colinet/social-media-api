# 🚀 Guide de démarrage rapide - API Mock Server JavaScript

## Installation et démarrage en 30 secondes

```bash
# 1. Cloner le projet
git clone <repository-url>
cd social-media-api/api-mock-js

# 2. Démarrer le serveur
node start.js

# 3. Tester
curl http://localhost:8080/health
```

## ⚡ Commandes essentielles

```bash
# Démarrer le serveur
node start.js

# Démarrer sur un port spécifique
node start.js --port 8090

# Tester tous les endpoints
node test.js

# Valider les stubs
node manage.js validate

# Voir le statut du serveur
node manage.js status
```

## 🎯 Premiers tests

### 1. Health Check
```bash
curl http://localhost:8080/health
```

### 2. Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

### 3. Liste des profils sociaux
```bash
curl http://localhost:8080/social-media-profiles \
  -H "Authorization: Bearer mock-token"
```

## 📁 Structure des fichiers

```
api-mock-js/
├── index.js              # Point d'entrée principal
├── start.js              # Script de démarrage
├── test.js               # Suite de tests
├── manage.js             # Script de gestion
├── package.json          # Configuration npm
├── .env.example          # Variables d'environnement
├── src/                  # Code source
│   ├── MockServer.js     # Serveur principal
│   ├── StubLoader.js     # Chargeur de stubs
│   ├── RequestMatcher.js # Matching des requêtes
│   ├── ResponseBuilder.js# Construction des réponses
│   └── EnvLoader.js      # Chargement .env
├── stubs/                # Stubs WireMock
│   ├── 01-health-check.json
│   ├── 02-auth-register.json
│   └── ...
├── stubs-minimal/        # Stubs minimaux
└── config/               # Configuration
    └── config.json
```

## 🔧 Configuration rapide

### Variables d'environnement (.env)
```bash
MOCK_HOST=0.0.0.0
MOCK_PORT=8080
MOCK_STUBS_DIR=./stubs
MOCK_CORS=1
MOCK_DEBUG=1
```

### Changer le port
```bash
# Option 1: Argument de ligne de commande
node start.js --port 8090

# Option 2: Variable d'environnement
MOCK_PORT=8090 node start.js

# Option 3: Fichier .env
echo "MOCK_PORT=8090" > .env
node start.js
```

## 📊 Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Vérification de santé |
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| POST | `/auth/logout` | Déconnexion |
| GET | `/user` | Profil utilisateur |
| GET | `/social-media-profiles` | Liste des profils |
| POST | `/social-media-profiles` | Créer un profil |
| GET | `/social-media-profiles/{id}` | Détails d'un profil |
| PUT | `/social-media-profiles/{id}` | Modifier un profil |
| DELETE | `/social-media-profiles/{id}` | Supprimer un profil |
| POST | `/social-media-profiles/{id}/sync` | Synchroniser |
| GET | `/social-media-profiles/platform/{platform}` | Par plateforme |

## 🧪 Tests automatisés

```bash
# Exécuter tous les tests
node test.js

# Résultat attendu
🚀 Testing Mock Server at http://localhost:8080
=====================================

Testing: Health Check
  GET /health
  ✅ Status: 200
  📄 Response: API is running

...

✅ Tests completed: 13 passed, 0 failed
```

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier si le port est libre
lsof -i :8080

# Utiliser un autre port
node start.js --port 8090
```

### Les stubs ne se chargent pas
```bash
# Valider les stubs
node manage.js validate

# Vérifier le répertoire
ls -la stubs/
```

### Erreur 404 sur tous les endpoints
```bash
# Vérifier l'ordre des stubs
node manage.js list-stubs

# Redémarrer le serveur
node manage.js restart
```

## 🔄 Workflow de développement

### 1. Modifier un stub
```bash
# Éditer un fichier stub
nano stubs/01-health-check.json

# Redémarrer le serveur
node manage.js restart
```

### 2. Ajouter un nouveau stub
```bash
# Créer un nouveau fichier
cp stubs/01-health-check.json stubs/new-endpoint.json

# Modifier le contenu
nano stubs/new-endpoint.json

# Valider
node manage.js validate

# Redémarrer
node manage.js restart
```

### 3. Tester les changements
```bash
# Test spécifique
curl http://localhost:8080/new-endpoint

# Tous les tests
node test.js
```

## 📝 Exemples de stubs

### Stub simple
```json
{
  "priority": 1,
  "request": {
    "method": "GET",
    "url": "/api/simple"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "message": "Hello World"
    }
  }
}
```

### Stub avec pattern
```json
{
  "priority": 2,
  "request": {
    "method": "GET",
    "urlPattern": "/api/users/\\d+"
  },
  "response": {
    "status": 200,
    "jsonBody": {
      "id": "{{request.pathSegments.2}}",
      "name": "User {{randomValue type='INT' min=1 max=1000}}"
    }
  }
}
```

### Stub avec authentification
```json
{
  "priority": 3,
  "request": {
    "method": "GET",
    "url": "/api/protected",
    "headers": {
      "Authorization": {
        "matches": "Bearer .*"
      }
    }
  },
  "response": {
    "status": 200,
    "jsonBody": {
      "message": "Access granted",
      "timestamp": "{{now}}"
    }
  }
}
```

## 🎉 Prêt à commencer !

Votre serveur mock JavaScript est maintenant opérationnel. Consultez le [README.md](README.md) pour la documentation complète ou commencez à modifier les stubs dans le répertoire `stubs/`.

**Bon développement ! 🚀**