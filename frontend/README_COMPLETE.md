# Frontend Social Media API

Frontend JavaScript pur pour l'API Social Media avec génération automatique de modèles à partir du fichier OpenAPI.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
npm install

# Générer les modèles à partir du fichier OpenAPI
npm run generate-models

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur : https://work-2-nuszbjvsplvachds.prod-runtime.all-hands.dev

## 📋 Scripts disponibles

### Développement
- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser la version de production

### Gestion des modèles
- `npm run generate-models` - Générer les modèles et le client API
- `npm run check-models` - Vérifier la synchronisation des modèles
- `npm run models-stats` - Afficher les statistiques du fichier OpenAPI
- `npm run models-clean` - Supprimer tous les modèles générés

## 🏗️ Architecture

Le frontend est organisé en modules :

```
frontend/
├── src/
│   ├── models/          # Modèles générés automatiquement
│   ├── api/             # Client API généré automatiquement
│   ├── components/      # Composants d'interface utilisateur
│   ├── utils/           # Utilitaires et helpers
│   └── styles/          # Feuilles de style CSS
├── scripts/
│   ├── model-manager.js # Gestionnaire de modèles avancé
│   └── generate-models.js # Script de génération (legacy)
└── index.html           # Point d'entrée
```

## 🔄 Génération de modèles

Les modèles sont générés automatiquement à partir du fichier `../back/openapi.yaml`.

### Gestionnaire de modèles avancé

Le nouveau script `model-manager.js` offre des fonctionnalités avancées :

```bash
# Générer les modèles et le client API
npm run generate-models

# Vérifier la synchronisation
npm run check-models

# Afficher les statistiques
npm run models-stats

# Nettoyer les modèles
npm run models-clean

# Aide
node scripts/model-manager.js help
```

### Modèles générés

Les modèles JavaScript incluent :
- **Classes ES6** avec constructeur et validation
- **Méthodes utilitaires** : `toJSON()`, `fromJSON()`, `validate()`
- **Documentation JSDoc** complète pour l'IDE
- **Valeurs par défaut** appropriées selon le schéma OpenAPI
- **Validation** basée sur les champs requis

Exemple de modèle généré :
```javascript
export class SocialMediaProfile {
  constructor(data = {}) {
    this.id = data.id ?? 0;
    this.platform = data.platform ?? 'facebook';
    this.username = data.username ?? '';
    // ...
  }

  validate() {
    const errors = [];
    // Validation des champs requis
    return errors;
  }

  toJSON() {
    return { /* ... */ };
  }

  static fromJSON(json) {
    return new SocialMediaProfile(json);
  }
}
```

### Client API généré

Le client API inclut :
- **Méthodes pour tous les endpoints** avec documentation JSDoc
- **Gestion automatique de l'authentification** Bearer Token
- **Gestion d'erreurs** avec classe `ApiError` personnalisée
- **Support des paramètres** de chemin et de requête
- **Configuration flexible** de l'URL de base

Exemple d'utilisation :
```javascript
import { apiClient } from './src/api/client.js';

// Authentification
const response = await apiClient.postLogin({
  email: 'demo@example.com',
  password: 'password123'
});

apiClient.setToken(response.data.token);

// Récupérer les profils
const profiles = await apiClient.getSocialMediaProfiles();
```

## 🎨 Interface utilisateur

L'interface permet de :
- ✅ **Authentification** : Connexion / Inscription
- ✅ **Gestion des profils** : CRUD complet
- ✅ **Filtrage** : Par plateforme et statut actif
- ✅ **Synchronisation** : Mise à jour des profils
- ✅ **Interface responsive** : Mobile et desktop

### Fonctionnalités

1. **Authentification**
   - Formulaires de connexion et inscription
   - Gestion automatique des tokens
   - Déconnexion sécurisée

2. **Gestion des profils**
   - Liste paginée des profils
   - Modal d'ajout/modification
   - Suppression avec confirmation
   - Synchronisation individuelle

3. **Filtres et recherche**
   - Filtre par plateforme (Facebook, Twitter, Instagram, etc.)
   - Filtre par statut (actif/inactif)
   - Interface intuitive

## 🔧 Configuration

### Serveur de développement

Le frontend utilise **Vite** pour le développement :
- Hot Module Replacement (HMR)
- Serveur de développement rapide
- Support ES modules natif
- Configuration dans `vite.config.js`

### Variables d'environnement

Le client API peut être configuré :
```javascript
// Par défaut : serveur mock local
const apiClient = new ApiClient('http://localhost:8090');

// Ou serveur de production
const apiClient = new ApiClient('https://api.example.com');
```

## 🧪 Tests et démonstration

### Identifiants de démonstration
- **Email** : `demo@example.com`
- **Mot de passe** : `password123`

### Serveur mock

Le frontend est configuré pour utiliser le serveur mock JavaScript :
- **URL** : `http://localhost:8090`
- **Données** : Profils de démonstration pré-configurés
- **Authentification** : Simulation complète

### Tests manuels

1. **Connexion** : Utiliser les identifiants de démonstration
2. **Profils** : Voir la liste des profils existants
3. **Ajout** : Créer un nouveau profil social
4. **Modification** : Éditer un profil existant
5. **Synchronisation** : Tester la synchronisation
6. **Filtres** : Tester les filtres par plateforme

## 📊 Synchronisation des modèles

### Vérification automatique

```bash
# Vérifier si les modèles sont à jour
npm run check-models
```

### Statistiques

```bash
# Voir les statistiques du fichier OpenAPI
npm run models-stats
```

Exemple de sortie :
```
📊 Statistiques du fichier OpenAPI:
   Version: 1.0.0
   Titre: Social Media Profiles API
   Serveurs: 2
   Endpoints: 9
   Méthodes: 12
   Schémas: 6
```

### Workflow de développement

1. **Modification de l'API** : Mettre à jour `back/openapi.yaml`
2. **Vérification** : `npm run check-models`
3. **Régénération** : `npm run generate-models`
4. **Test** : Vérifier que l'interface fonctionne

## 🔄 Intégration continue

Pour automatiser la synchronisation :

```bash
# Dans un script CI/CD
npm run check-models || npm run generate-models
```

## 📱 Responsive Design

L'interface s'adapte automatiquement :
- **Desktop** : Interface complète avec sidebar
- **Tablet** : Interface adaptée avec navigation simplifiée
- **Mobile** : Interface optimisée pour écrans tactiles

## 🎯 Prochaines étapes

- [ ] Tests automatisés (Jest/Vitest)
- [ ] PWA (Progressive Web App)
- [ ] Internationalisation (i18n)
- [ ] Thèmes sombre/clair
- [ ] Notifications push
- [ ] Cache offline

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Modifier le code
4. Régénérer les modèles si nécessaire
5. Tester l'interface
6. Commiter et pousser
7. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.