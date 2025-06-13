# Frontend Social Media API

Frontend JavaScript pur pour l'API Social Media avec génération automatique de modèles à partir du fichier OpenAPI.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Génération des modèles

Générer les modèles à partir du fichier OpenAPI :

```bash
npm run generate-models
```

### Vérification de la synchronisation des modèles

Vérifier que les modèles sont synchronisés avec le fichier OpenAPI :

```bash
npm run check-models
```

### Développement

Lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur : https://work-2-nuszbjvsplvachds.prod-runtime.all-hands.dev

### Build de production

```bash
npm run build
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── api/                 # Client API généré automatiquement
│   │   └── client.js
│   ├── models/              # Modèles TypeScript générés automatiquement
│   │   ├── User.js
│   │   ├── SocialMediaProfile.js
│   │   ├── SocialMediaProfileInput.js
│   │   ├── AuthResponse.js
│   │   ├── ErrorResponse.js
│   │   ├── ValidationError.js
│   │   └── index.js
│   ├── components/          # Composants réutilisables
│   │   ├── ProfileCard.js
│   │   └── ProfileModal.js
│   ├── utils/               # Utilitaires
│   │   ├── auth.js
│   │   └── notifications.js
│   ├── styles/              # Styles CSS
│   │   └── main.css
│   └── main.js              # Point d'entrée principal
├── scripts/
│   └── generate-models.js   # Script de génération des modèles
├── index.html               # Page principale
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Scripts disponibles

### `npm run generate-models`

Génère automatiquement les modèles TypeScript et le client API à partir du fichier OpenAPI (`../back/openapi.yaml`).

**Ce que fait le script :**
- Lit le fichier OpenAPI YAML
- Génère des interfaces TypeScript pour chaque schéma
- Crée un client API avec toutes les méthodes d'endpoint
- Sauvegarde les fichiers dans `src/models/` et `src/api/`

### `npm run check-models`

Vérifie que tous les modèles sont synchronisés avec le fichier OpenAPI.

**Utilisation :**
```bash
npm run check-models
```

Si des modèles sont manquants ou non synchronisés, le script affichera les erreurs et vous devrez exécuter `npm run generate-models`.

## 🎯 Fonctionnalités

### Authentification
- Connexion avec email/mot de passe
- Inscription de nouveaux utilisateurs
- Gestion automatique des tokens JWT
- Déconnexion sécurisée

### Gestion des profils de réseaux sociaux
- Affichage de tous les profils utilisateur
- Création de nouveaux profils
- Modification des profils existants
- Suppression de profils
- Synchronisation avec les APIs externes
- Filtrage par plateforme et statut

### Plateformes supportées
- Facebook
- Twitter
- Instagram
- LinkedIn
- YouTube
- TikTok
- Snapchat
- Pinterest

## 🔄 Génération automatique des modèles

Le système de génération automatique des modèles garantit que le frontend reste synchronisé avec l'API backend.

### Comment ça marche

1. **Lecture du fichier OpenAPI** : Le script lit le fichier `../back/openapi.yaml`
2. **Génération des interfaces** : Crée des interfaces TypeScript pour chaque schéma défini
3. **Génération du client API** : Crée automatiquement toutes les méthodes pour appeler l'API
4. **Validation** : Le script de vérification s'assure que tous les modèles sont présents

### Exemple de modèle généré

```javascript
// src/models/SocialMediaProfile.js
export interface SocialMediaProfile {
  id?: number;
  user_id?: number;
  platform?: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'snapchat' | 'pinterest';
  platform_user_id?: string;
  username?: string;
  display_name?: string;
  profile_url?: string;
  avatar_url?: string;
  bio?: string;
  additional_data?: any;
  is_active?: boolean;
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
}
```

### Exemple de client API généré

```javascript
// src/api/client.js
class ApiClient {
  // ...
  
  async getSocialMediaProfiles(queryParams = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = queryString ? `/social-media-profiles?${queryString}` : '/social-media-profiles';
    return this.request(endpoint, {
      method: 'GET'
    });
  }
  
  async postSocialMediaProfiles(data) {
    return this.request('/social-media-profiles', {
      method: 'POST',
      body: data
    });
  }
  
  // ... autres méthodes générées automatiquement
}
```

## 🔐 Configuration de l'API

Le frontend détecte automatiquement l'environnement et configure l'URL de base de l'API :

- **Développement local** : `http://localhost:8000/api`
- **Production** : `https://work-1-nuszbjvsplvachds.prod-runtime.all-hands.dev/api`

## 📱 Interface utilisateur

### Authentification
- Formulaires de connexion et d'inscription
- Validation côté client
- Gestion des erreurs avec notifications

### Dashboard des profils
- Cartes visuelles pour chaque profil
- Filtres par plateforme et statut
- Actions rapides (modifier, supprimer, synchroniser)

### Modal de création/modification
- Formulaire complet avec validation
- Support des URLs et images
- Gestion des erreurs en temps réel

## 🔔 Système de notifications

Le frontend inclut un système de notifications pour informer l'utilisateur :

- **Succès** : Actions réussies (vert)
- **Erreur** : Erreurs et échecs (rouge)
- **Avertissement** : Alertes importantes (orange)
- **Information** : Messages informatifs (bleu)

## 🎨 Styles et responsive

- Design moderne et épuré
- Interface responsive (mobile, tablette, desktop)
- Animations et transitions fluides
- Thème cohérent avec l'identité visuelle

## 🔧 Développement

### Ajout de nouvelles fonctionnalités

1. **Modifier le fichier OpenAPI** dans `../back/openapi.yaml`
2. **Régénérer les modèles** : `npm run generate-models`
3. **Implémenter la logique** dans les composants appropriés
4. **Tester** l'intégration avec l'API

### Debugging

- Ouvrir les outils de développement du navigateur
- Vérifier la console pour les erreurs JavaScript
- Utiliser l'onglet Network pour déboguer les appels API
- Les erreurs d'authentification sont automatiquement gérées

## 📝 Notes importantes

- Les modèles sont générés automatiquement, ne les modifiez pas manuellement
- Utilisez toujours `npm run generate-models` après modification du fichier OpenAPI
- Le script `npm run check-models` doit être utilisé dans les pipelines CI/CD
- L'authentification est persistée dans le localStorage du navigateur