# API Mock Server JavaScript

Serveur de bouchon JavaScript sans framework qui simule l'API Social Media basé sur le fichier OpenAPI YAML avec syntaxe compatible WireMock.

## 🚀 Démarrage rapide

```bash
# Démarrer le serveur sur le port par défaut (8080)
node start.js

# Démarrer sur un port spécifique
node start.js --port 8090

# Démarrer avec un répertoire de stubs personnalisé
node start.js --stubs ./stubs-dev

# Démarrer en mode debug
node start.js --debug
```

## 📋 Gestion du serveur

```bash
# Utiliser le script de gestion
node manage.js start --port 8090
node manage.js stop
node manage.js restart
node manage.js status
node manage.js test
node manage.js validate
node manage.js list-stubs
```

## 🧪 Tests

```bash
# Exécuter la suite de tests
node test.js

# Ou via le gestionnaire
node manage.js test
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` basé sur `.env.example` :

```bash
MOCK_HOST=0.0.0.0
MOCK_PORT=8080
MOCK_STUBS_DIR=./stubs
MOCK_CORS=1
MOCK_DEBUG=1
```

### Configuration JSON

Modifiez `config/config.json` pour une configuration avancée :

```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0"
  },
  "stubs": {
    "directory": "./stubs",
    "auto_reload": false
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

## 📁 Structure des stubs

Les stubs utilisent la syntaxe WireMock standard :

```json
{
  "priority": 1,
  "request": {
    "method": "GET",
    "url": "/health"
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "success": true,
      "message": "API is running",
      "timestamp": "{{now}}"
    }
  }
}
```

### Matchers de requête supportés

- **URL exacte** : `"url": "/health"`
- **Pattern d'URL** : `"urlPattern": "/users/\\d+"`
- **Path exact** : `"urlPath": "/api/users"`
- **Pattern de path** : `"urlPathPattern": "/api/.*"`
- **Méthode** : `"method": "GET"` ou `"method": "ANY"`
- **Headers** : `"headers": {"Authorization": "Bearer token"}`
- **Query parameters** : `"queryParameters": {"page": "1"}`
- **Body patterns** : `"bodyPatterns": [{"equalTo": "data"}]`

### Templates de réponse

- **Variables temporelles** :
  - `{{now}}` - ISO timestamp actuel
  - `{{now.timestamp}}` - Unix timestamp

- **Variables aléatoires** :
  - `{{randomValue type='UUID'}}` - UUID aléatoire
  - `{{randomValue type='INT' min=1 max=100}}` - Entier aléatoire
  - `{{randomValue type='STRING'}}` - Chaîne aléatoire

- **Variables de requête** :
  - `{{request.method}}` - Méthode HTTP
  - `{{request.url}}` - URL complète
  - `{{request.pathSegments.0}}` - Premier segment du path

## 🔧 API de gestion

Le serveur expose une API de gestion (si activée) :

- `GET /__admin/mappings` - Liste des stubs
- `POST /__admin/mappings` - Ajouter un stub
- `DELETE /__admin/mappings/{id}` - Supprimer un stub
- `POST /__admin/mappings/reset` - Réinitialiser les stubs

## 📊 Endpoints simulés

Le serveur simule l'API Social Media complète :

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion

### Utilisateur
- `GET /user` - Profil utilisateur

### Profils sociaux
- `GET /social-media-profiles` - Liste des profils
- `POST /social-media-profiles` - Créer un profil
- `GET /social-media-profiles/{id}` - Détails d'un profil
- `PUT /social-media-profiles/{id}` - Modifier un profil
- `DELETE /social-media-profiles/{id}` - Supprimer un profil
- `POST /social-media-profiles/{id}/sync` - Synchroniser un profil
- `GET /social-media-profiles/platform/{platform}` - Profils par plateforme

### Système
- `GET /health` - Vérification de santé

## 🐛 Debug

Activez le mode debug pour voir les détails des requêtes :

```bash
node start.js --debug
```

Ou via la variable d'environnement :

```bash
MOCK_DEBUG=1 node start.js
```

## 📝 Logs

Les logs incluent :
- Requêtes entrantes avec méthode, URL, headers et body
- Stub correspondant trouvé
- Réponse envoyée avec status et taille
- Erreurs de matching ou de traitement

## 🔄 Rechargement des stubs

Pour recharger les stubs sans redémarrer le serveur :

```bash
# Redémarrer le serveur
node manage.js restart

# Ou modifier les stubs et redémarrer manuellement
```

## 🚦 Codes de statut

- **200** - Succès
- **201** - Créé
- **400** - Requête invalide
- **401** - Non autorisé
- **404** - Non trouvé
- **422** - Erreur de validation
- **500** - Erreur serveur

## 🔗 Compatibilité WireMock

Ce serveur est compatible avec la syntaxe WireMock pour :
- ✅ Request matching (URL, méthode, headers, body)
- ✅ Response templating
- ✅ Priorités des stubs
- ✅ Variables temporelles et aléatoires
- ✅ CORS
- ⚠️ JSONPath basique (limité)
- ❌ Proxying
- ❌ Recording
- ❌ Scenarios

## 📦 Dépendances

Aucune dépendance externe - utilise uniquement les modules Node.js natifs :
- `http` - Serveur HTTP
- `fs` - Système de fichiers
- `path` - Manipulation des chemins
- `url` - Parsing d'URL

## 🎯 Cas d'usage

- **Développement frontend** - Simuler l'API backend
- **Tests d'intégration** - Mocker les services externes
- **Démonstrations** - Présenter l'application sans backend
- **Prototypage** - Tester rapidement des idées
- **Formation** - Apprendre les APIs REST

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.