// Modèle généré automatiquement à partir du fichier OpenAPI

export class ValidationError {
  constructor(data = {}) {
    this.success = data.success ?? false;
    this.message = data.message ?? '';
    this.errors = data.errors ?? {};
  }

  validate() {
    const errors = [];
    return errors;
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      errors: this.errors,
    };
  }

  static fromJSON(json) {
    return new ValidationError(json);
  }
}

/**
 * @typedef {Object} ValidationErrorData
 * @property {boolean} success?
 * @property {string} message?
 * @property {Object} errors?
 */
