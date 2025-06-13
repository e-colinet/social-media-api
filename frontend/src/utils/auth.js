// Utilitaires d'authentification

export class AuthManager {
  constructor() {
    this.TOKEN_KEY = 'social_media_api_token';
    this.USER_KEY = 'social_media_api_user';
  }

  // Sauvegarder le token et les informations utilisateur
  saveAuth(token, user) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Récupérer le token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Récupérer les informations utilisateur
  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!this.getToken();
  }

  // Déconnexion
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Nettoyer l'authentification en cas d'erreur 401
  clearAuth() {
    this.logout();
  }
}

export const authManager = new AuthManager();