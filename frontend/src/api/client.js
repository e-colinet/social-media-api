// Client API généré automatiquement à partir du fichier OpenAPI

/**
 * Client API pour l'API Social Media
 */
export class ApiClient {
  constructor(baseUrl = 'http://localhost:12000') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  /**
   * Définir le token d'authentification
   * @param {string} token - Token Bearer
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Supprimer le token d'authentification
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Effectuer une requête HTTP
   * @param {string} endpoint - Endpoint de l'API
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Réponse de l'API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'Erreur API', errorData);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Erreur réseau:', error);
      throw new ApiError(0, 'Erreur de connexion', { originalError: error.message });
    }
  }

  /**
   * Check API health status
   * Returns the current health status of the API
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getHealth() {
    return this.request('/api/health', {
      method: 'GET'
    });
  }

  /**
   * Register a new user
   * Create a new user account
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postRegister(data) {
    return this.request('/api/register', {
      method: 'POST',
      body: data
    });
  }

  /**
   * Login user
   * Authenticate user and return access token
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postLogin(data) {
    return this.request('/api/login', {
      method: 'POST',
      body: data
    });
  }

  /**
   * Get authenticated user profile
   * Returns the profile of the currently authenticated user
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getUser() {
    return this.request('/api/user', {
      method: 'GET'
    });
  }

  /**
   * Logout user
   * Revoke the user's access token
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postLogout(data) {
    return this.request('/api/logout', {
      method: 'POST',
      body: data
    });
  }

  /**
   * Get all user's social media profiles
   * Returns all social media profiles for the authenticated user
   * @param {Object} queryParams - Paramètres de requête
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getSocialMediaProfiles(queryParams = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = queryString ? `/social-media-profiles?${queryString}` : '/social-media-profiles';
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  /**
   * Create a new social media profile
   * Create a new social media profile for the authenticated user
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postSocialMediaProfiles(data) {
    return this.request('/api/social-media-profiles', {
      method: 'POST',
      body: data
    });
  }

  /**
   * Get a specific social media profile
   * Returns a specific social media profile by ID
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getSocialMediaProfilesId(id) {
    return this.request(`/social-media-profiles/${id}`, {
      method: 'GET'
    });
  }

  /**
   * Update a social media profile
   * Update an existing social media profile
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async putSocialMediaProfilesId(id, data) {
    return this.request(`/social-media-profiles/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  /**
   * Delete a social media profile
   * Delete an existing social media profile
   * @returns {Promise<Object>} Réponse de l'API
   */
  async deleteSocialMediaProfilesId(id) {
    return this.request(`/social-media-profiles/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get profiles grouped by platform
   * Returns all social media profiles grouped by platform
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getSocialMediaProfilesByPlatform() {
    return this.request('/api/social-media-profiles-by-platform', {
      method: 'GET'
    });
  }

  /**
   * Sync profile data
   * Sync profile data with external social media APIs (placeholder endpoint)
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postSocialMediaProfilesIdSync(id, data) {
    return this.request(`/social-media-profiles/${id}/sync`, {
      method: 'POST',
      body: data
    });
  }

  // === ADMIN ENDPOINTS ===

  /**
   * Get admin dashboard overview
   * Returns overview statistics for admin dashboard
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getAdminDashboardOverview() {
    return this.request('/api/admin/dashboard/overview', {
      method: 'GET'
    });
  }

  /**
   * Get admin dashboard system info
   * Returns system information for admin dashboard
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getAdminDashboardSystemInfo() {
    return this.request('/api/admin/dashboard/system-info', {
      method: 'GET'
    });
  }

  /**
   * Get all users (admin)
   * Returns all users with pagination and filtering
   * @param {Object} queryParams - Paramètres de requête
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getAdminUsers(queryParams = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  /**
   * Create a new user (admin)
   * Create a new user account
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postAdminUsers(data) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: data
    });
  }

  /**
   * Get a specific user (admin)
   * Returns a specific user by ID
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getAdminUsersId(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'GET'
    });
  }

  /**
   * Update a user (admin)
   * Update an existing user
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async putAdminUsersId(id, data) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  /**
   * Delete a user (admin)
   * Delete an existing user
   * @returns {Promise<Object>} Réponse de l'API
   */
  async deleteAdminUsersId(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get user statistics (admin)
   * Returns user statistics
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getAdminUsersStats() {
    return this.request('/api/admin/users/stats', {
      method: 'GET'
    });
  }

  /**
   * Get all social media profiles (admin)
   * Returns all social media profiles with pagination and filtering
   * @param {Object} queryParams - Paramètres de requête
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getAdminSocialMediaProfiles(queryParams = {}) {
    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = queryString ? `/admin/social-media-profiles?${queryString}` : '/admin/social-media-profiles';
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  /**
   * Create a new social media profile (admin)
   * Create a new social media profile for any user
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postAdminSocialMediaProfiles(data) {
    return this.request('/api/admin/social-media-profiles', {
      method: 'POST',
      body: data
    });
  }

  /**
   * Get a specific social media profile (admin)
   * Returns a specific social media profile by ID
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getAdminSocialMediaProfilesId(id) {
    return this.request(`/admin/social-media-profiles/${id}`, {
      method: 'GET'
    });
  }

  /**
   * Update a social media profile (admin)
   * Update an existing social media profile
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async putAdminSocialMediaProfilesId(id, data) {
    return this.request(`/admin/social-media-profiles/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  /**
   * Delete a social media profile (admin)
   * Delete an existing social media profile
   * @returns {Promise<Object>} Réponse de l'API
   */
  async deleteAdminSocialMediaProfilesId(id) {
    return this.request(`/admin/social-media-profiles/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get social media profile statistics (admin)
   * Returns social media profile statistics
   * @returns {Promise<Object>} Réponse de l'API
   */
  async getAdminSocialMediaProfilesStats() {
    return this.request('/api/admin/social-media-profiles/stats', {
      method: 'GET'
    });
  }

  /**
   * Bulk update social media profiles (admin)
   * Update multiple social media profiles at once
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postAdminSocialMediaProfilesBulkUpdate(data) {
    return this.request('/api/admin/social-media-profiles/bulk-update', {
      method: 'POST',
      body: data
    });
  }

  /**
   * Bulk delete social media profiles (admin)
   * Delete multiple social media profiles at once
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse de l'API
   */
  async postAdminSocialMediaProfilesBulkDelete(data) {
    return this.request('/api/admin/social-media-profiles/bulk-delete', {
      method: 'POST',
      body: data
    });
  }

}

/**
 * Classe d'erreur API personnalisée
 */
export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Instance par défaut du client API
export const apiClient = new ApiClient();
