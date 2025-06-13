// Modèle généré automatiquement à partir du fichier OpenAPI

export class SocialMediaProfileInput {
  constructor(data = {}) {
    this.platform = data.platform ?? 'facebook';
    this.platform_user_id = data.platform_user_id ?? '';
    this.username = data.username ?? '';
    this.display_name = data.display_name ?? '';
    this.profile_url = data.profile_url ?? '';
    this.avatar_url = data.avatar_url ?? '';
    this.bio = data.bio ?? '';
    this.additional_data = data.additional_data ?? {};
    this.is_active = data.is_active ?? false;
  }

  validate() {
    const errors = [];
    if (this.platform === undefined || this.platform === null) {
      errors.push('platform is required');
    }
    if (this.platform_user_id === undefined || this.platform_user_id === null) {
      errors.push('platform_user_id is required');
    }
    if (this.username === undefined || this.username === null) {
      errors.push('username is required');
    }
    if (this.display_name === undefined || this.display_name === null) {
      errors.push('display_name is required');
    }
    return errors;
  }

  toJSON() {
    return {
      platform: this.platform,
      platform_user_id: this.platform_user_id,
      username: this.username,
      display_name: this.display_name,
      profile_url: this.profile_url,
      avatar_url: this.avatar_url,
      bio: this.bio,
      additional_data: this.additional_data,
      is_active: this.is_active,
    };
  }

  static fromJSON(json) {
    return new SocialMediaProfileInput(json);
  }
}

/**
 * @typedef {Object} SocialMediaProfileInputData
 * @property {'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'snapchat' | 'pinterest'} platform
 * @property {string} platform_user_id
 * @property {string} username
 * @property {string} display_name
 * @property {string} profile_url?
 * @property {string} avatar_url?
 * @property {string} bio?
 * @property {Object} additional_data?
 * @property {boolean} is_active?
 */
