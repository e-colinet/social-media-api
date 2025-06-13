# Architecture du Frontend

## 🏗️ Vue d'ensemble

Ce frontend JavaScript pur utilise une architecture modulaire avec génération automatique de modèles à partir du fichier OpenAPI. L'application suit les principes de séparation des responsabilités et de réutilisabilité.

## 📁 Structure détaillée

```
frontend/
├── src/
│   ├── api/                    # Couche d'accès aux données
│   │   └── client.js          # Client API généré automatiquement
│   ├── models/                 # Modèles de données
│   │   ├── *.js               # Interfaces TypeScript générées
│   │   └── index.js           # Point d'entrée des modèles
│   ├── components/             # Composants réutilisables
│   │   ├── ProfileCard.js     # Carte d'affichage de profil
│   │   └── ProfileModal.js    # Modal de création/édition
│   ├── utils/                  # Utilitaires
│   │   ├── auth.js            # Gestion de l'authentification
│   │   └── notifications.js   # Système de notifications
│   ├── styles/                 # Styles CSS
│   │   └── main.css           # Styles principaux
│   └── main.js                 # Point d'entrée et orchestrateur
├── scripts/                    # Scripts de développement
│   ├── generate-models.js     # Générateur de modèles OpenAPI
│   └── dev-setup.js           # Configuration automatique
├── index.html                  # Page principale
├── demo.html                   # Page de démonstration
├── vite.config.js             # Configuration Vite
└── package.json               # Configuration npm
```

## 🔄 Flux de données

### 1. Génération automatique
```
OpenAPI YAML → Script de génération → Modèles TypeScript + Client API
```

### 2. Authentification
```
Formulaire → API Client → JWT Token → LocalStorage → Headers automatiques
```

### 3. Gestion des profils
```
Interface → Validation → API Client → Backend → Mise à jour UI
```

## 🧩 Composants principaux

### SocialMediaApp (main.js)
- **Rôle** : Orchestrateur principal de l'application
- **Responsabilités** :
  - Initialisation de l'application
  - Gestion des états d'authentification
  - Coordination entre les composants
  - Gestion des événements globaux

### ApiClient (api/client.js)
- **Rôle** : Couche d'abstraction pour les appels API
- **Responsabilités** :
  - Gestion des requêtes HTTP
  - Authentification automatique avec JWT
  - Gestion des erreurs centralisée
  - Méthodes générées automatiquement

### AuthManager (utils/auth.js)
- **Rôle** : Gestion de l'authentification
- **Responsabilités** :
  - Stockage sécurisé des tokens
  - Vérification de l'état de connexion
  - Nettoyage lors de la déconnexion

### ProfileCard (components/ProfileCard.js)
- **Rôle** : Affichage d'un profil de réseau social
- **Responsabilités** :
  - Rendu visuel des données de profil
  - Gestion des actions (modifier, supprimer, synchroniser)
  - Gestion des avatars par défaut

### ProfileModal (components/ProfileModal.js)
- **Rôle** : Interface de création/modification de profils
- **Responsabilités** :
  - Formulaire dynamique
  - Validation côté client
  - Gestion des états de chargement

### NotificationManager (utils/notifications.js)
- **Rôle** : Système de feedback utilisateur
- **Responsabilités** :
  - Affichage de notifications toast
  - Gestion automatique de la durée
  - Types de notifications (succès, erreur, info, warning)

## 🔧 Génération automatique des modèles

### Processus de génération

1. **Lecture du fichier OpenAPI** (`../back/openapi.yaml`)
2. **Parsing des schémas** avec js-yaml
3. **Génération des interfaces TypeScript** pour chaque schéma
4. **Création du client API** avec toutes les méthodes d'endpoint
5. **Écriture des fichiers** dans les répertoires appropriés

### Script generate-models.js

```javascript
// Fonctions principales :
- loadOpenApiSpec()           // Charge et parse le YAML
- generateModels()            // Génère les interfaces
- generateApiClient()         // Génère le client API
- generateMethodName()        // Convertit operationId en camelCase
- generateApiMethod()         // Crée une méthode d'API
- getTypeScriptType()         // Convertit les types OpenAPI en TypeScript
```

### Avantages de cette approche

- **Synchronisation automatique** : Les modèles restent toujours à jour
- **Type safety** : Interfaces TypeScript pour la validation
- **Productivité** : Pas de code manuel à maintenir
- **Cohérence** : Même structure que l'API backend
- **Évolutivité** : Ajout automatique de nouveaux endpoints

## 🎨 Architecture CSS

### Approche modulaire
- **Reset CSS** : Normalisation cross-browser
- **Variables CSS** : Couleurs et espacements cohérents
- **Composants** : Styles isolés par composant
- **Responsive** : Mobile-first avec media queries
- **Animations** : Transitions fluides pour l'UX

### Conventions de nommage
- **BEM-like** : `.component-element--modifier`
- **Utilitaires** : `.hidden`, `.container`
- **États** : `.active`, `.loading`, `.error`

## 🔐 Sécurité

### Authentification
- **JWT Tokens** : Stockage sécurisé dans localStorage
- **Headers automatiques** : Bearer token ajouté automatiquement
- **Expiration** : Gestion des tokens expirés
- **Nettoyage** : Suppression des données sensibles à la déconnexion

### Validation
- **Côté client** : Validation des formulaires avant envoi
- **Sanitisation** : Échappement des données utilisateur
- **URLs** : Validation des URLs avec l'API URL native

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 768px
- **Tablette** : 768px - 1024px
- **Desktop** : > 1024px

### Adaptations
- **Navigation** : Menu hamburger sur mobile
- **Grilles** : Colonnes adaptatives
- **Modals** : Plein écran sur mobile
- **Formulaires** : Optimisés pour le tactile

## 🚀 Performance

### Optimisations
- **Lazy loading** : Chargement à la demande
- **Debouncing** : Limitation des appels API
- **Caching** : Mise en cache des données utilisateur
- **Minification** : Build optimisé avec Vite

### Métriques
- **First Paint** : < 1s
- **Interactive** : < 2s
- **Bundle size** : < 100KB gzippé

## 🧪 Tests et validation

### Validation automatique
- **Script check-models** : Vérification de la synchronisation
- **Validation des formulaires** : Côté client en temps réel
- **Gestion d'erreurs** : Feedback utilisateur approprié

### Tests manuels
- **Authentification** : Tous les scénarios de connexion
- **CRUD** : Opérations complètes sur les profils
- **Responsive** : Test sur différentes tailles d'écran
- **Cross-browser** : Compatibilité navigateurs modernes

## 🔄 Workflow de développement

### 1. Modification de l'API
```bash
# Modifier ../back/openapi.yaml
npm run generate-models  # Régénérer les modèles
npm run check-models     # Vérifier la synchronisation
```

### 2. Développement de fonctionnalités
```bash
npm run dev              # Serveur de développement
# Développer dans src/
# Tester dans le navigateur
```

### 3. Déploiement
```bash
npm run build            # Build de production
npm run preview          # Test du build
```

## 🔮 Évolutions futures

### Fonctionnalités prévues
- **PWA** : Application web progressive
- **Offline** : Mode hors ligne avec cache
- **Real-time** : WebSockets pour les mises à jour
- **Internationalisation** : Support multi-langues

### Améliorations techniques
- **TypeScript** : Migration complète vers TypeScript
- **Tests unitaires** : Suite de tests automatisés
- **CI/CD** : Pipeline de déploiement automatique
- **Monitoring** : Métriques de performance en temps réel