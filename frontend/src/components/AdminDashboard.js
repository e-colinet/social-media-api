export class AdminDashboard {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.stats = null;
    this.recentUsers = [];
    this.recentProfiles = [];
  }

  async loadDashboardData() {
    try {
      const response = await this.apiClient.getAdminDashboardOverview();
      if (response.success) {
        this.stats = response.data.stats;
        this.recentUsers = response.data.recent_users;
        this.recentProfiles = response.data.recent_profiles;
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'admin-dashboard';
    
    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Admin Dashboard</h2>
        <p>Overview of your social media API</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>${this.stats?.users?.total || 0}</h3>
            <p>Total Users</p>
            <small>${this.stats?.users?.recent || 0} new this month</small>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔗</div>
          <div class="stat-content">
            <h3>${this.stats?.profiles?.total || 0}</h3>
            <p>Social Profiles</p>
            <small>${this.stats?.profiles?.active || 0} active</small>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <h3>${this.stats?.profiles?.active || 0}</h3>
            <p>Active Profiles</p>
            <small>${this.stats?.profiles?.inactive || 0} inactive</small>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👑</div>
          <div class="stat-content">
            <h3>${this.stats?.users?.admins || 0}</h3>
            <p>Admin Users</p>
            <small>${this.stats?.users?.regular || 0} regular users</small>
          </div>
        </div>
      </div>
      
      <div class="dashboard-content">
        <div class="recent-section">
          <h3>Recent Users</h3>
          <div class="recent-list" id="recent-users">
            ${this.renderRecentUsers()}
          </div>
        </div>
        
        <div class="recent-section">
          <h3>Recent Profiles</h3>
          <div class="recent-list" id="recent-profiles">
            ${this.renderRecentProfiles()}
          </div>
        </div>
      </div>
      
      <div class="platforms-section">
        <h3>Platforms Distribution</h3>
        <div class="platforms-grid">
          ${this.renderPlatformsStats()}
        </div>
      </div>
    `;
    
    return container;
  }

  renderRecentUsers() {
    if (!this.recentUsers || this.recentUsers.length === 0) {
      return '<p class="no-data">No recent users</p>';
    }
    
    return this.recentUsers.map(user => `
      <div class="recent-item">
        <div class="item-info">
          <strong>${user.name}</strong>
          <small>${user.email}</small>
        </div>
        <div class="item-date">
          ${new Date(user.created_at).toLocaleDateString()}
        </div>
      </div>
    `).join('');
  }

  renderRecentProfiles() {
    if (!this.recentProfiles || this.recentProfiles.length === 0) {
      return '<p class="no-data">No recent profiles</p>';
    }
    
    return this.recentProfiles.map(profile => `
      <div class="recent-item">
        <div class="item-info">
          <strong>${profile.username || profile.display_name}</strong>
          <small>${profile.platform} - ${profile.user?.name}</small>
        </div>
        <div class="item-date">
          ${new Date(profile.created_at).toLocaleDateString()}
        </div>
      </div>
    `).join('');
  }

  renderPlatformsStats() {
    if (!this.stats?.platforms) {
      return '<p class="no-data">No platform data</p>';
    }
    
    return Object.entries(this.stats.platforms).map(([platform, count]) => `
      <div class="platform-stat">
        <div class="platform-name">${platform}</div>
        <div class="platform-count">${count}</div>
      </div>
    `).join('');
  }
}