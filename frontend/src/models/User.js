// Modèle généré automatiquement à partir du fichier OpenAPI

export class User {
  constructor(data = {}) {
    this.id = data.id ?? 0;
    this.name = data.name ?? '';
    this.email = data.email ?? '';
    this.email_verified_at = data.email_verified_at ?? '';
    this.created_at = data.created_at ?? '';
    this.updated_at = data.updated_at ?? '';
  }

  validate() {
    const errors = [];
    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      email_verified_at: this.email_verified_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  static fromJSON(json) {
    return new User(json);
  }
}

/**
 * @typedef {Object} UserData
 * @property {number} id?
 * @property {string} name?
 * @property {string} email?
 * @property {string} email_verified_at?
 * @property {string} created_at?
 * @property {string} updated_at?
 */
