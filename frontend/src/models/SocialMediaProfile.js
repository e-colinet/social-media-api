// Modèle généré automatiquement à partir du fichier OpenAPI

export class SocialMediaProfile {
  constructor(data = {}) {
    this.id = data.id ?? 0;
    this.user_id = data.user_id ?? 0;
    this.platform = data.platform ?? 'facebook';
    this.platform_user_id = data.platform_user_id ?? '';
    this.username = data.username ?? '';
    this.display_name = data.display_name ?? '';
    this.profile_url = data.profile_url ?? '';
    this.avatar_url = data.avatar_url ?? '';
    this.bio = data.bio ?? '';
    this.additional_data = data.additional_data ?? {};
    this.is_active = data.is_active ?? false;
    this.last_synced_at = data.last_synced_at ?? '';
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
      user_id: this.user_id,
      platform: this.platform,
      platform_user_id: this.platform_user_id,
      username: this.username,
      display_name: this.display_name,
      profile_url: this.profile_url,
      avatar_url: this.avatar_url,
      bio: this.bio,
      additional_data: this.additional_data,
      is_active: this.is_active,
      last_synced_at: this.last_synced_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  static fromJSON(json) {
    return new SocialMediaProfile(json);
  }
}

/**
 * @typedef {Object} SocialMediaProfileData
 * @property {number} id?
 * @property {number} user_id?
 * @property {'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'snapchat' | 'pinterest'} platform?
 * @property {string} platform_user_id?
 * @property {string} username?
 * @property {string} display_name?
 * @property {string} profile_url?
 * @property {string} avatar_url?
 * @property {string} bio?
 * @property {Object} additional_data?
 * @property {boolean} is_active?
 * @property {string} last_synced_at?
 * @property {string} created_at?
 * @property {string} updated_at?
 */
