// Modèle généré automatiquement à partir du fichier OpenAPI

export class ErrorResponse {
  constructor(data = {}) {
    this.success = data.success ?? false;
    this.message = data.message ?? '';
  }

  validate() {
    const errors = [];
    return errors;
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
    };
  }

  static fromJSON(json) {
    return new ErrorResponse(json);
  }
}

/**
 * @typedef {Object} ErrorResponseData
 * @property {boolean} success?
 * @property {string} message?
 */
