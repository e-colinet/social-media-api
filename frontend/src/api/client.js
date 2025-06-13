// Client API généré automatiquement
  
class ApiClient {
  constructor(baseUrl = 'http://localhost:12000/api') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

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
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur API');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  async getHealth() {
    return this.request('/health', {
      method: 'GET'
    });
  }

  async postRegister(data) {
    return this.request('/register', {
      method: 'POST',
      body: data
    });
  }

  async postLogin(data) {
    return this.request('/login', {
      method: 'POST',
      body: data
    });
  }

  async getUser() {
    return this.request('/user', {
      method: 'GET'
    });
  }

  async postLogout(data) {
    return this.request('/logout', {
      method: 'POST',
      body: data
    });
  }

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

  async getSocialMediaProfilesId(id) {
    return this.request('/social-media-profiles/${id}', {
      method: 'GET'
    });
  }

  async putSocialMediaProfilesId(id, data) {
    return this.request('/social-media-profiles/${id}', {
      method: 'PUT',
      body: data
    });
  }

  async deleteSocialMediaProfilesId(id) {
    return this.request('/social-media-profiles/${id}', {
      method: 'DELETE'
    });
  }

  async getSocialMediaProfilesByPlatform() {
    return this.request('/social-media-profiles-by-platform', {
      method: 'GET'
    });
  }

  async postSocialMediaProfilesIdSync(id, data) {
    return this.request('/social-media-profiles/${id}/sync', {
      method: 'POST',
      body: data
    });
  }

}

export default ApiClient;
export const apiClient = new ApiClient();
