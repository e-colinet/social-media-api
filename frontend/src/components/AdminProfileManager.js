export class AdminProfileManager {
  constructor(apiClient, notifications) {
    this.apiClient = apiClient;
    this.notifications = notifications;
    this.profiles = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.searchTerm = '';
    this.filterPlatform = '';
    this.filterActive = '';
  }

  async loadProfiles(page = 1) {
    try {
      const params = {
        page,
        per_page: 15,
        search: this.searchTerm,
      };
      
      if (this.filterPlatform) {
        params.platform = this.filterPlatform;
      }
      
      if (this.filterActive !== '') {
        params.is_active = this.filterActive === 'true';
      }

      const response = await this.apiClient.getAdminSocialMediaProfiles(params);
      if (response.success) {
        this.profiles = response.data.profiles;
        this.currentPage = response.data.pagination.current_page;
        this.totalPages = response.data.pagination.last_page;
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      this.notifications.error('Error loading profiles: ' + error.message);
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'admin-profile-manager';
    
    container.innerHTML = `
      <div class="manager-header">
        <h2>Social Media Profile Management</h2>
        <button class="btn btn-primary" id="add-profile-btn">Add New Profile</button>
      </div>
      
      <div class="filters-section">
        <div class="filter-group">
          <input type="text" id="profile-search" placeholder="Search profiles..." value="${this.searchTerm}">
          <select id="platform-filter">
            <option value="">All Platforms</option>
            <option value="facebook" ${this.filterPlatform === 'facebook' ? 'selected' : ''}>Facebook</option>
            <option value="twitter" ${this.filterPlatform === 'twitter' ? 'selected' : ''}>Twitter</option>
            <option value="instagram" ${this.filterPlatform === 'instagram' ? 'selected' : ''}>Instagram</option>
            <option value="linkedin" ${this.filterPlatform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
            <option value="youtube" ${this.filterPlatform === 'youtube' ? 'selected' : ''}>YouTube</option>
            <option value="tiktok" ${this.filterPlatform === 'tiktok' ? 'selected' : ''}>TikTok</option>
            <option value="snapchat" ${this.filterPlatform === 'snapchat' ? 'selected' : ''}>Snapchat</option>
            <option value="pinterest" ${this.filterPlatform === 'pinterest' ? 'selected' : ''}>Pinterest</option>
          </select>
          <select id="active-filter">
            <option value="">All Status</option>
            <option value="true" ${this.filterActive === 'true' ? 'selected' : ''}>Active Only</option>
            <option value="false" ${this.filterActive === 'false' ? 'selected' : ''}>Inactive Only</option>
          </select>
          <button class="btn btn-secondary" id="search-profiles-btn">Search</button>
        </div>
      </div>
      
      <div class="profiles-table-container">
        <table class="profiles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Platform</th>
              <th>Username</th>
              <th>Display Name</th>
              <th>Status</th>
              <th>Last Sync</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="profiles-table-body">
            ${this.renderProfilesTable()}
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        ${this.renderPagination()}
      </div>
      
      <!-- Profile Modal -->
      <div class="modal" id="profile-modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="profile-modal-title">Add Profile</h3>
            <span class="close" id="close-profile-modal">&times;</span>
          </div>
          <form id="profile-form">
            <div class="form-group">
              <label for="profile-user-id">User:</label>
              <select id="profile-user-id" required>
                <option value="">Select User</option>
              </select>
            </div>
            <div class="form-group">
              <label for="profile-platform">Platform:</label>
              <select id="profile-platform" required>
                <option value="">Select Platform</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="snapchat">Snapchat</option>
                <option value="pinterest">Pinterest</option>
              </select>
            </div>
            <div class="form-group">
              <label for="profile-platform-user-id">Platform User ID:</label>
              <input type="text" id="profile-platform-user-id" required>
            </div>
            <div class="form-group">
              <label for="profile-username">Username:</label>
              <input type="text" id="profile-username">
            </div>
            <div class="form-group">
              <label for="profile-display-name">Display Name:</label>
              <input type="text" id="profile-display-name">
            </div>
            <div class="form-group">
              <label for="profile-url">Profile URL:</label>
              <input type="url" id="profile-url">
            </div>
            <div class="form-group">
              <label for="profile-avatar-url">Avatar URL:</label>
              <input type="url" id="profile-avatar-url">
            </div>
            <div class="form-group">
              <label for="profile-bio">Bio:</label>
              <textarea id="profile-bio" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="profile-is-active" checked> Active
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="save-profile-btn">Save Profile</button>
              <button type="button" class="btn btn-secondary" id="cancel-profile-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    this.attachEventListeners(container);
    return container;
  }

  renderProfilesTable() {
    if (!this.profiles || this.profiles.length === 0) {
      return '<tr><td colspan="8" class="no-data">No profiles found</td></tr>';
    }
    
    return this.profiles.map(profile => `
      <tr>
        <td>${profile.id}</td>
        <td>
          <div class="user-info">
            <strong>${profile.user?.name || 'Unknown'}</strong>
            <small>${profile.user?.email || ''}</small>
          </div>
        </td>
        <td>
          <span class="platform-badge platform-${profile.platform}">
            ${profile.platform}
          </span>
        </td>
        <td>${profile.username || '-'}</td>
        <td>${profile.display_name || '-'}</td>
        <td>
          <span class="badge ${profile.is_active ? 'badge-active' : 'badge-inactive'}">
            ${profile.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>${profile.last_synced_at ? new Date(profile.last_synced_at).toLocaleDateString() : 'Never'}</td>
        <td class="actions">
          <button class="btn btn-sm btn-secondary" onclick="adminProfileManager.editProfile(${profile.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="adminProfileManager.deleteProfile(${profile.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderPagination() {
    if (this.totalPages <= 1) return '';
    
    let pagination = '<div class="pagination-controls">';
    
    // Previous button
    if (this.currentPage > 1) {
      pagination += `<button class="btn btn-sm" onclick="adminProfileManager.loadProfiles(${this.currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
      const active = i === this.currentPage ? 'active' : '';
      pagination += `<button class="btn btn-sm ${active}" onclick="adminProfileManager.loadProfiles(${i})">${i}</button>`;
    }
    
    // Next button
    if (this.currentPage < this.totalPages) {
      pagination += `<button class="btn btn-sm" onclick="adminProfileManager.loadProfiles(${this.currentPage + 1})">Next</button>`;
    }
    
    pagination += '</div>';
    return pagination;
  }

  attachEventListeners(container) {
    // Search functionality
    container.querySelector('#search-profiles-btn').addEventListener('click', () => {
      this.searchTerm = container.querySelector('#profile-search').value;
      this.filterPlatform = container.querySelector('#platform-filter').value;
      this.filterActive = container.querySelector('#active-filter').value;
      this.loadProfiles(1);
    });

    // Add profile button
    container.querySelector('#add-profile-btn').addEventListener('click', () => {
      this.showProfileModal();
    });

    // Modal controls
    container.querySelector('#close-profile-modal').addEventListener('click', () => {
      this.hideProfileModal();
    });

    container.querySelector('#cancel-profile-btn').addEventListener('click', () => {
      this.hideProfileModal();
    });

    // Profile form submission
    container.querySelector('#profile-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfile();
    });

    // Close modal when clicking outside
    container.querySelector('#profile-modal').addEventListener('click', (e) => {
      if (e.target.id === 'profile-modal') {
        this.hideProfileModal();
      }
    });
  }

  async showProfileModal(profile = null) {
    const modal = document.getElementById('profile-modal');
    const title = document.getElementById('profile-modal-title');
    const form = document.getElementById('profile-form');
    
    this.currentEditProfile = profile;
    
    // Load users for the dropdown
    await this.loadUsersForDropdown();
    
    if (profile) {
      title.textContent = 'Edit Profile';
      document.getElementById('profile-user-id').value = profile.user_id;
      document.getElementById('profile-platform').value = profile.platform;
      document.getElementById('profile-platform-user-id').value = profile.platform_user_id;
      document.getElementById('profile-username').value = profile.username || '';
      document.getElementById('profile-display-name').value = profile.display_name || '';
      document.getElementById('profile-url').value = profile.profile_url || '';
      document.getElementById('profile-avatar-url').value = profile.avatar_url || '';
      document.getElementById('profile-bio').value = profile.bio || '';
      document.getElementById('profile-is-active').checked = profile.is_active;
    } else {
      title.textContent = 'Add Profile';
      form.reset();
      document.getElementById('profile-is-active').checked = true;
    }
    
    modal.style.display = 'block';
  }

  async loadUsersForDropdown() {
    try {
      const response = await this.apiClient.getAdminUsers({ per_page: 100 });
      if (response.success) {
        const userSelect = document.getElementById('profile-user-id');
        userSelect.innerHTML = '<option value="">Select User</option>';
        
        response.data.users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = `${user.name} (${user.email})`;
          userSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  hideProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
    this.currentEditProfile = null;
  }

  async saveProfile() {
    const profileData = {
      user_id: document.getElementById('profile-user-id').value,
      platform: document.getElementById('profile-platform').value,
      platform_user_id: document.getElementById('profile-platform-user-id').value,
      username: document.getElementById('profile-username').value,
      display_name: document.getElementById('profile-display-name').value,
      profile_url: document.getElementById('profile-url').value,
      avatar_url: document.getElementById('profile-avatar-url').value,
      bio: document.getElementById('profile-bio').value,
      is_active: document.getElementById('profile-is-active').checked
    };

    try {
      let response;
      if (this.currentEditProfile) {
        response = await this.apiClient.putAdminSocialMediaProfilesId(this.currentEditProfile.id, profileData);
      } else {
        response = await this.apiClient.postAdminSocialMediaProfiles(profileData);
      }

      if (response.success) {
        this.notifications.success(this.currentEditProfile ? 'Profile updated successfully' : 'Profile created successfully');
        this.hideProfileModal();
        await this.loadProfiles(this.currentPage);
      }
    } catch (error) {
      this.notifications.error('Error saving profile: ' + error.message);
    }
  }

  async editProfile(profileId) {
    try {
      const response = await this.apiClient.getAdminSocialMediaProfilesId(profileId);
      if (response.success) {
        this.showProfileModal(response.data.profile);
      }
    } catch (error) {
      this.notifications.error('Error loading profile: ' + error.message);
    }
  }

  async deleteProfile(profileId) {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await this.apiClient.deleteAdminSocialMediaProfilesId(profileId);
      if (response.success) {
        this.notifications.success('Profile deleted successfully');
        await this.loadProfiles(this.currentPage);
      }
    } catch (error) {
      this.notifications.error('Error deleting profile: ' + error.message);
    }
  }
}