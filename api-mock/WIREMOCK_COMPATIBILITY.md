# Compatibilité WireMock

Ce serveur mock implémente une grande partie de la syntaxe WireMock pour assurer la compatibilité avec les stubs existants.

## Fonctionnalités supportées

### Request Matching

#### URL Matching
```json
{
  "request": {
    "url": "/exact/path",                    // ✅ Correspondance exacte
    "urlPattern": "/users/\\d+",             // ✅ Pattern regex
    "urlPath": "/api/users",                 // ✅ Path exact (ignore query params)
    "urlPathPattern": "/api/users/.*"        // ✅ Path pattern
  }
}
```

#### Method Matching
```json
{
  "request": {
    "method": "GET"                          // ✅ Méthode HTTP
  }
}
```

#### Header Matching
```json
{
  "request": {
    "headers": {
      "Content-Type": "application/json",    // ✅ Correspondance exacte
      "Authorization": {
        "equalTo": "Bearer token123",        // ✅ Égal à
        "matches": "Bearer .*",              // ✅ Pattern regex
        "contains": "Bearer"                 // ✅ Contient
      }
    }
  }
}
```

#### Query Parameter Matching
```json
{
  "request": {
    "queryParameters": {
      "page": "1",                          // ✅ Correspondance exacte
      "filter": {
        "equalTo": "active",                // ✅ Égal à
        "matches": "act.*"                  // ✅ Pattern regex
      }
    }
  }
}
```

#### Body Matching
```json
{
  "request": {
    "bodyPatterns": [
      {
        "equalTo": "exact body content"      // ✅ Corps exact
      },
      {
        "equalToJson": {"key": "value"}      // ✅ JSON exact
      },
      {
        "matchesJsonPath": "$.user.email"    // ✅ JSONPath (basique)
      },
      {
        "contains": "substring"              // ✅ Contient
      },
      {
        "matches": "regex.*pattern"          // ✅ Pattern regex
      }
    ]
  }
}
```

### Response Definition

#### Status et Headers
```json
{
  "response": {
    "status": 200,                          // ✅ Code de statut HTTP
    "headers": {
      "Content-Type": "application/json",   // ✅ Headers de réponse
      "X-Custom-Header": "value"
    }
  }
}
```

#### Body Response
```json
{
  "response": {
    "body": "Plain text response",          // ✅ Corps texte
    "jsonBody": {"key": "value"},           // ✅ Corps JSON
    "bodyFileName": "response.json"         // ✅ Fichier de réponse
  }
}
```

#### Delays
```json
{
  "response": {
    "fixedDelayMilliseconds": 1000          // ✅ Délai fixe
  }
}
```

### Templating

#### Variables temporelles
```json
{
  "timestamp": "{{now}}",                   // ✅ ISO 8601 timestamp
  "unix_time": "{{now.timestamp}}"         // ✅ Unix timestamp
}
```

#### Variables aléatoires
```json
{
  "uuid": "{{randomValue type='UUID'}}",                    // ✅ UUID aléatoire
  "number": "{{randomValue type='INT' min=1 max=100}}"     // ✅ Entier aléatoire
}
```

#### Variables de requête
```json
{
  "method": "{{request.method}}",           // ✅ Méthode de la requête
  "url": "{{request.url}}",                 // ✅ URL de la requête
  "segment": "{{request.pathSegments.0}}"   // ✅ Segments d'URL
}
```

### Priorités
```json
{
  "priority": 1                             // ✅ Priorité (plus haute = traité en premier)
}
```

## Fonctionnalités non supportées

### Request Matching avancé
- ❌ `absent` matcher
- ❌ `before` / `after` date matchers
- ❌ `binaryEqualTo` pour les corps binaires
- ❌ JSONPath avancé (expressions complexes)

### Response avancée
- ❌ `chunkedDribbleDelay`
- ❌ `fault` responses
- ❌ `proxyBaseUrl`
- ❌ `transformers`

### Templating avancé
- ❌ Helpers Handlebars
- ❌ `randomValue` avec distributions
- ❌ Variables d'état

### Administration
- ❌ API d'administration (`/__admin`)
- ❌ Hot reload des stubs
- ❌ Enregistrement des requêtes
- ❌ Scenarios et états

## Différences avec WireMock

### JSONPath
L'implémentation JSONPath est basique et supporte uniquement :
- `$.field` - Accès direct à un champ
- `$.object.field` - Accès à un champ imbriqué

### Variables de template
Syntaxe légèrement différente pour les valeurs aléatoires :
```json
// WireMock
"{{randomValue length=10 type='ALPHANUMERIC'}}"

// Notre implémentation
"{{randomValue type='INT' min=1 max=100}}"
```

### Gestion des erreurs
Les messages d'erreur peuvent différer de WireMock mais restent informatifs.

## Migration depuis WireMock

Pour migrer des stubs WireMock existants :

1. **Copiez vos fichiers JSON** dans le répertoire `stubs/`
2. **Vérifiez la compatibilité** avec `php manage.php validate`
3. **Adaptez si nécessaire** les fonctionnalités non supportées
4. **Testez** avec `php manage.php test`

### Exemple de migration

**Stub WireMock original :**
```json
{
  "request": {
    "method": "GET",
    "urlPathPattern": "/api/users/[0-9]+",
    "headers": {
      "Accept": {
        "matches": "application/json.*"
      }
    }
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "id": "{{request.pathSegments.[2]}}",
      "name": "User {{randomValue length=8 type='ALPHANUMERIC'}}",
      "created": "{{now}}"
    }
  }
}
```

**Stub adapté :**
```json
{
  "request": {
    "method": "GET",
    "urlPattern": "/api/users/\\d+",
    "headers": {
      "Accept": {
        "matches": "application/json.*"
      }
    }
  },
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "jsonBody": {
      "id": "{{request.pathSegments.2}}",
      "name": "User {{randomValue type='UUID'}}",
      "created": "{{now}}"
    }
  }
}
```

## Bonnes pratiques

1. **Utilisez des priorités** pour contrôler l'ordre de matching
2. **Soyez spécifique** dans vos matchers pour éviter les conflits
3. **Testez vos stubs** avec le script de test fourni
4. **Validez régulièrement** avec `php manage.php validate`
5. **Documentez vos stubs** avec des commentaires dans les noms de fichiers