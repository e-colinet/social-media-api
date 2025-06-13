// Modèle généré automatiquement à partir du fichier OpenAPI

export class AuthResponse {
  constructor(data = {}) {
    this.success = data.success ?? false;
    this.message = data.message ?? '';
    this.data = data.data ?? {};
  }

  validate() {
    const errors = [];
    return errors;
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
    };
  }

  static fromJSON(json) {
    return new AuthResponse(json);
  }
}

/**
 * @typedef {Object} AuthResponseData
 * @property {boolean} success?
 * @property {string} message?
 * @property {Object} data?
 */
