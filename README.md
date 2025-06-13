# Social Media API - Projet Complet

Ce projet fournit une API complète de gestion de profils de réseaux sociaux avec authentification OAuth 2, développée avec Laravel et accompagnée d'un frontend JavaScript et d'outils de test.

## 🏗️ Architecture du Projet

```
social-media-api/
├── back/                    # API Laravel avec OAuth 2
├── frontend/               # Interface JavaScript pure
├── api-mock-js/           # Serveur mock pour les tests
└── README.md              # Ce fichier
```

## 📋 Table des Matières

- [Backend Laravel (Répertoire `back/`)](#backend-laravel-répertoire-back)
- [Frontend JavaScript (Répertoire `frontend/`)](#frontend-javascript-répertoire-frontend)
- [Serveur Mock (Répertoire `api-mock-js/`)](#serveur-mock-répertoire-api-mock-js)
- [Installation et Démarrage](#installation-et-démarrage)
- [Utilisation](#utilisation)
- [Tests](#tests)

---

## 🚀 Backend Laravel (Répertoire `back/`)

### Fonctionnalités Principales

#### 🔐 Système d'Authentification
- **OAuth 2.0** avec Laravel Passport
- **Tokens JWT** pour l'authentification
- **Inscription et connexion** d'utilisateurs
- **Gestion des tokens** avec durées de vie configurables
- **Utilisateur de démonstration** pré-configuré

#### 📱 Gestion des Profils de Réseaux Sociaux
- **Opérations CRUD complètes** (Create, Read, Update, Delete)
- **Support multi-plateformes** : Facebook, Twitter, Instagram, LinkedIn, YouTube, TikTok, Snapchat, Pinterest
- **Groupement par plateforme**
- **Stockage flexible** avec champs JSON pour données spécifiques
- **Statut actif/inactif** des profils
- **Synchronisation** avec APIs externes (placeholder)

#### 🗄️ Base de Données
- **Schema robuste** avec contraintes d'intégrité
- **Relations** entre utilisateurs et profils
- **Champs JSON** pour métadonnées flexibles
- **Audit trail** avec timestamps et suivi de synchronisation

### 📚 Documentation et Interfaces

#### Documentation Interactive
- **Spécification OpenAPI 3.0** complète
- **Interface Swagger UI** à `/docs.html`
- **Interface de démonstration** à `/demo.html`
- **Documentation détaillée** en Markdown

#### Génération de Modèles OpenAPI
Le système inclut un générateur avancé de modèles PHP basé sur la spécification OpenAPI :

```bash
# Générer les modèles depuis la spécification OpenAPI
php artisan openapi:generate-models

# Vérifier la synchronisation des modèles
php artisan openapi:verify-sync

# Actualiser les modèles avec sauvegarde
php artisan openapi:refresh-models --backup
```

**Fonctionnalités du générateur :**
- **Génération automatique** de modèles PHP
- **Sécurité des types** avec hints et casts appropriés
- **Règles de validation** Laravel auto-générées
- **Vérification de synchronisation** avec la spécification API
- **Système de sauvegarde** pour régénération sécurisée

### 🛠️ Installation du Backend

#### Prérequis
- PHP 8.2+
- Composer
- Laravel 11
- SQLite

#### Installation Standard
```bash
cd back/

# Installer les dépendances
composer install

# Configuration de l'environnement
cp .env.example .env
php artisan key:generate

# Base de données et données de test
php artisan migrate
php artisan db:seed

# Configuration Passport
php artisan passport:install
php artisan passport:client --personal

# Démarrer le serveur
php artisan serve --host=0.0.0.0 --port=8000
```

#### Installation Docker (Recommandée)
```bash
cd back/

# Démarrer avec Docker Compose
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# L'API sera disponible sur http://localhost:8080
```

**Fonctionnalités Docker :**
- Environnement containerisé complet
- Configuration automatique avec migrations et données de test
- Base de données SQLite (aucune dépendance externe)
- Prêt pour la production avec nginx + PHP-FPM
- Vérifications de santé intégrées

### 🎯 Endpoints de l'API

#### Authentification
```
POST /api/register              # Inscription utilisateur
POST /api/login                 # Connexion utilisateur
GET  /api/user                  # Profil utilisateur authentifié
POST /api/logout                # Déconnexion utilisateur
```

#### Profils de Réseaux Sociaux
```
GET    /api/social-media-profiles           # Lister tous les profils
POST   /api/social-media-profiles           # Créer un nouveau profil
GET    /api/social-media-profiles/{id}      # Obtenir un profil spécifique
PUT    /api/social-media-profiles/{id}      # Mettre à jour un profil
DELETE /api/social-media-profiles/{id}      # Supprimer un profil
GET    /api/social-media-profiles-by-platform  # Grouper par plateforme
POST   /api/social-media-profiles/{id}/sync    # Synchroniser un profil
```

#### Utilitaires
```
GET /api/health                 # Statut de santé de l'API
GET /api/openapi.yaml          # Spécification OpenAPI
GET /api/openapi.json          # Spécification OpenAPI (JSON)
```

### 🔐 Authentification

L'API utilise OAuth 2.0 avec tokens Bearer. Inclure le token dans l'en-tête Authorization :

```bash
Authorization: Bearer {votre-token-d-acces}
```

### 📱 Utilisateur de Démonstration

Pour les tests, un utilisateur de démonstration est disponible :
- **Email** : `demo@example.com`
- **Mot de passe** : `password123`

Cet utilisateur possède des profils d'exemple pour Twitter, LinkedIn, Instagram et Facebook.

### 🧪 Tests Manuels avec cURL

#### 1. Connexion
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

#### 2. Obtenir les Profils (remplacer TOKEN par le token réel)
```bash
curl -X GET http://localhost:8000/api/social-media-profiles \
  -H "Authorization: Bearer TOKEN"
```

#### 3. Créer un Profil
```bash
curl -X POST http://localhost:8000/api/social-media-profiles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "youtube",
    "platform_user_id": "UC123456789",
    "username": "demo_channel",
    "display_name": "Demo Channel",
    "profile_url": "https://youtube.com/c/demo_channel",
    "bio": "Tutoriels tech et critiques",
    "is_active": true
  }'
```

### 🌐 Accès aux Interfaces

```
http://localhost:8000/docs.html     # Documentation Swagger UI interactive
http://localhost:8000/demo.html     # Interface de démonstration interactive
http://localhost:8000/api/openapi.yaml  # Spécification OpenAPI
```

---

## 🎨 Frontend JavaScript (Répertoire `frontend/`)

### Fonctionnalités

#### Interface Utilisateur
- **JavaScript pur** (sans framework)
- **Interface responsive** avec CSS moderne
- **Gestion d'état** locale avec localStorage
- **Authentification** avec gestion des tokens
- **CRUD complet** pour les profils de réseaux sociaux

#### Génération de Modèles
- **Modèles générés** automatiquement depuis OpenAPI
- **Script de génération** personnalisable
- **Vérification de synchronisation** avec l'API

#### Tests Playwright
- **Tests end-to-end** complets
- **Tests d'authentification**
- **Tests de gestion des profils**
- **Tests d'intégration API**
- **Tests de navigation et UI**

### Installation du Frontend

```bash
cd frontend/

# Installer les dépendances
npm install

# Générer les modèles depuis OpenAPI
npm run generate-models

# Vérifier la synchronisation des modèles
npm run verify-models

# Démarrer le serveur de développement
npm run dev
```

### Scripts Disponibles

```bash
# Développement
npm run dev                    # Serveur de développement
npm run build                  # Build de production
npm run preview               # Prévisualisation du build

# Génération de modèles
npm run generate-models       # Générer les modèles depuis OpenAPI
npm run verify-models         # Vérifier la synchronisation

# Tests Playwright
npm test                      # Tous les tests
npm run test:auth            # Tests d'authentification
npm run test:profiles        # Tests de gestion des profils
npm run test:ui              # Tests d'interface utilisateur
npm run test:api             # Tests d'intégration API
npm run test:headed          # Tests avec interface graphique
npm run test:debug           # Mode debug
npm run test:report          # Rapport de tests
```

---

## 🎭 Serveur Mock (Répertoire `api-mock-js/`)

### Fonctionnalités

#### Simulation d'API
- **Serveur mock** complet pour les tests
- **Endpoints identiques** à l'API Laravel
- **Données de test** configurables
- **Gestion d'état** en mémoire
- **Réponses réalistes** avec délais simulés

#### Configuration
- **Stubs configurables** pour différents scénarios
- **Mode minimal** pour tests rapides
- **Gestion des erreurs** simulées
- **CORS** configuré pour le développement

### Utilisation du Serveur Mock

```bash
cd api-mock-js/

# Installer les dépendances
npm install

# Démarrer le serveur mock
npm start

# Démarrer sur un port spécifique
node start.js --port 8090

# Mode minimal
npm run start:minimal

# Tests du serveur mock
npm test
```

---

## 🚀 Installation et Démarrage

### Démarrage Rapide (Tous les Services)

#### 1. Backend Laravel
```bash
cd back/
docker-compose up -d
# Ou pour installation manuelle :
# composer install && php artisan migrate && php artisan db:seed && php artisan serve
```

#### 2. Serveur Mock (pour les tests)
```bash
cd api-mock-js/
npm install && npm start
```

#### 3. Frontend
```bash
cd frontend/
npm install && npm run dev
```

### URLs d'Accès

- **API Laravel** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs.html
- **Démo API** : http://localhost:8000/demo.html
- **Frontend** : http://localhost:12001
- **Serveur Mock** : http://localhost:8090

---

## 🎯 Utilisation

### Workflow Typique

#### 1. Développement avec API Réelle
```bash
# Démarrer l'API Laravel
cd back/ && docker-compose up -d

# Démarrer le frontend
cd frontend/ && npm run dev

# Accéder à l'interface : http://localhost:12001
```

#### 2. Tests avec Serveur Mock
```bash
# Démarrer le serveur mock
cd api-mock-js/ && npm start

# Lancer les tests Playwright
cd frontend/ && npm test
```

#### 3. Génération et Synchronisation des Modèles
```bash
# Backend : Générer les modèles PHP
cd back/ && php artisan openapi:generate-models

# Frontend : Générer les modèles JavaScript
cd frontend/ && npm run generate-models

# Vérifier la synchronisation
cd back/ && php artisan openapi:verify-sync
cd frontend/ && npm run verify-models
```

---

## 🧪 Tests

### Tests Backend (Laravel)

```bash
cd back/

# Tests unitaires et d'intégration
php artisan test

# Tests avec couverture
php artisan test --coverage
```

### Tests Frontend (Playwright)

```bash
cd frontend/

# Tous les tests
npm test

# Tests spécifiques
npm run test:auth        # Authentification
npm run test:profiles    # Gestion des profils
npm run test:ui          # Interface utilisateur
npm run test:api         # Intégration API

# Tests avec interface graphique
npm run test:headed

# Rapport de tests
npm run test:report
```

### Tests du Serveur Mock

```bash
cd api-mock-js/

# Tests du serveur mock
npm test

# Tests avec verbosité
npm run test:verbose
```

---

## 📊 Fonctionnalités Avancées

### Génération de Modèles OpenAPI

Le projet inclut un système avancé de génération de modèles qui maintient automatiquement la synchronisation entre la spécification OpenAPI et les modèles de code :

#### Backend (PHP/Laravel)
- Génération automatique de modèles Eloquent
- Règles de validation Laravel
- Type hints et casts appropriés
- Système de sauvegarde pour régénération sécurisée

#### Frontend (JavaScript)
- Modèles JavaScript avec validation
- Classes d'accès aux données
- Gestion des types TypeScript-like
- Synchronisation avec l'API

### Tests End-to-End

Le projet inclut une suite complète de tests Playwright couvrant :
- **Authentification** : Connexion, inscription, déconnexion
- **Gestion des profils** : CRUD, filtrage, synchronisation
- **Interface utilisateur** : Navigation, responsive design, accessibilité
- **Intégration API** : Gestion d'erreurs, timeouts, headers

### Déploiement

#### Production Backend
```bash
cd back/

# Configuration pour la production
cp .env.example .env.production
# Éditer .env.production avec les paramètres de production

# Build Docker pour la production
docker-compose -f docker-compose.prod.yml up -d
```

#### Production Frontend
```bash
cd frontend/

# Build de production
npm run build

# Servir les fichiers statiques
npm run preview
```

---

## 🔮 Améliorations Futures

### Backend
- [ ] Intégrations API externes pour synchronisation en temps réel
- [ ] Limitation de taux et throttling
- [ ] Analytiques et insights des profils
- [ ] Opérations en lot
- [ ] Support webhook pour mises à jour
- [ ] Architecture multi-tenant
- [ ] Statut de vérification des profils

### Frontend
- [ ] Mode hors ligne avec synchronisation
- [ ] Notifications push
- [ ] Thèmes personnalisables
- [ ] Export/import de données
- [ ] Tableau de bord analytique
- [ ] Intégration calendrier

### Tests et Qualité
- [ ] Tests de régression visuelle
- [ ] Tests de performance
- [ ] Tests d'accessibilité automatisés
- [ ] Intégration continue (CI/CD)
- [ ] Monitoring et alertes

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

1. Fork le repository
2. Créer une branche feature
3. Faire les modifications
4. Ajouter des tests si applicable
5. Soumettre une pull request

## 🆘 Support

Pour le support ou les questions :
- Consulter la documentation API
- Utiliser l'interface de démonstration interactive
- Examiner les exemples de code
- Ouvrir une issue sur GitHub

---

## 🎉 Résumé du Projet

Ce projet fournit une solution complète pour la gestion de profils de réseaux sociaux avec :

✅ **API Laravel robuste** avec OAuth 2 et documentation OpenAPI  
✅ **Frontend JavaScript moderne** avec tests end-to-end  
✅ **Serveur mock** pour développement et tests  
✅ **Génération automatique de modèles** depuis OpenAPI  
✅ **Documentation complète** et interfaces interactives  
✅ **Architecture prête pour la production**  

Le projet démontre les meilleures pratiques de développement moderne avec une architecture claire, une documentation complète et des outils de test robustes.