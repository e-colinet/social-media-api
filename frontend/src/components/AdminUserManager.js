export class AdminUserManager {
  constructor(apiClient, notifications) {
    this.apiClient = apiClient;
    this.notifications = notifications;
    this.users = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.searchTerm = '';
    this.filterAdmin = '';
  }

  async loadUsers(page = 1) {
    try {
      const params = {
        page,
        per_page: 15,
        search: this.searchTerm,
      };
      
      if (this.filterAdmin !== '') {
        params.is_admin = this.filterAdmin === 'true';
      }

      const response = await this.apiClient.getAdminUsers(params);
      if (response.success) {
        this.users = response.data.users;
        this.currentPage = response.data.pagination.current_page;
        this.totalPages = response.data.pagination.last_page;
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.notifications.error('Error loading users: ' + error.message);
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'admin-user-manager';
    
    container.innerHTML = `
      <div class="manager-header">
        <h2>User Management</h2>
        <button class="btn btn-primary" id="add-user-btn">Add New User</button>
      </div>
      
      <div class="filters-section">
        <div class="filter-group">
          <input type="text" id="user-search" placeholder="Search users..." value="${this.searchTerm}">
          <select id="admin-filter">
            <option value="">All Users</option>
            <option value="true" ${this.filterAdmin === 'true' ? 'selected' : ''}>Admins Only</option>
            <option value="false" ${this.filterAdmin === 'false' ? 'selected' : ''}>Regular Users</option>
          </select>
          <button class="btn btn-secondary" id="search-users-btn">Search</button>
        </div>
      </div>
      
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Profiles</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="users-table-body">
            ${this.renderUsersTable()}
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        ${this.renderPagination()}
      </div>
      
      <!-- User Modal -->
      <div class="modal" id="user-modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="user-modal-title">Add User</h3>
            <span class="close" id="close-user-modal">&times;</span>
          </div>
          <form id="user-form">
            <div class="form-group">
              <label for="user-name">Name:</label>
              <input type="text" id="user-name" required>
            </div>
            <div class="form-group">
              <label for="user-email">Email:</label>
              <input type="email" id="user-email" required>
            </div>
            <div class="form-group">
              <label for="user-password">Password:</label>
              <input type="password" id="user-password">
              <small id="password-help">Leave empty to keep current password (edit mode)</small>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="user-is-admin"> Admin User
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="save-user-btn">Save User</button>
              <button type="button" class="btn btn-secondary" id="cancel-user-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    this.attachEventListeners(container);
    return container;
  }

  renderUsersTable() {
    if (!this.users || this.users.length === 0) {
      return '<tr><td colspan="7" class="no-data">No users found</td></tr>';
    }
    
    return this.users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">
            ${user.is_admin ? 'Admin' : 'User'}
          </span>
        </td>
        <td>${user.social_media_profiles?.length || 0}</td>
        <td>${new Date(user.created_at).toLocaleDateString()}</td>
        <td class="actions">
          <button class="btn btn-sm btn-secondary" onclick="adminUserManager.editUser(${user.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="adminUserManager.deleteUser(${user.id})" 
                  ${user.is_admin ? 'disabled title="Cannot delete admin users"' : ''}>Delete</button>
        </td>
      </tr>
    `).join('');
  }

  renderPagination() {
    if (this.totalPages <= 1) return '';
    
    let pagination = '<div class="pagination-controls">';
    
    // Previous button
    if (this.currentPage > 1) {
      pagination += `<button class="btn btn-sm" onclick="adminUserManager.loadUsers(${this.currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
      const active = i === this.currentPage ? 'active' : '';
      pagination += `<button class="btn btn-sm ${active}" onclick="adminUserManager.loadUsers(${i})">${i}</button>`;
    }
    
    // Next button
    if (this.currentPage < this.totalPages) {
      pagination += `<button class="btn btn-sm" onclick="adminUserManager.loadUsers(${this.currentPage + 1})">Next</button>`;
    }
    
    pagination += '</div>';
    return pagination;
  }

  attachEventListeners(container) {
    // Search functionality
    container.querySelector('#search-users-btn').addEventListener('click', () => {
      this.searchTerm = container.querySelector('#user-search').value;
      this.filterAdmin = container.querySelector('#admin-filter').value;
      this.loadUsers(1);
    });

    // Add user button
    container.querySelector('#add-user-btn').addEventListener('click', () => {
      this.showUserModal();
    });

    // Modal controls
    container.querySelector('#close-user-modal').addEventListener('click', () => {
      this.hideUserModal();
    });

    container.querySelector('#cancel-user-btn').addEventListener('click', () => {
      this.hideUserModal();
    });

    // User form submission
    container.querySelector('#user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveUser();
    });

    // Close modal when clicking outside
    container.querySelector('#user-modal').addEventListener('click', (e) => {
      if (e.target.id === 'user-modal') {
        this.hideUserModal();
      }
    });
  }

  showUserModal(user = null) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('user-modal-title');
    const form = document.getElementById('user-form');
    const passwordHelp = document.getElementById('password-help');
    
    this.currentEditUser = user;
    
    if (user) {
      title.textContent = 'Edit User';
      document.getElementById('user-name').value = user.name;
      document.getElementById('user-email').value = user.email;
      document.getElementById('user-password').value = '';
      document.getElementById('user-is-admin').checked = user.is_admin;
      passwordHelp.style.display = 'block';
    } else {
      title.textContent = 'Add User';
      form.reset();
      passwordHelp.style.display = 'none';
    }
    
    modal.style.display = 'block';
  }

  hideUserModal() {
    document.getElementById('user-modal').style.display = 'none';
    this.currentEditUser = null;
  }

  async saveUser() {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const isAdmin = document.getElementById('user-is-admin').checked;

    const userData = {
      name,
      email,
      is_admin: isAdmin
    };

    if (password) {
      userData.password = password;
    }

    try {
      let response;
      if (this.currentEditUser) {
        response = await this.apiClient.putAdminUsersId(this.currentEditUser.id, userData);
      } else {
        userData.password = password || 'defaultpassword123'; // Require password for new users
        response = await this.apiClient.postAdminUsers(userData);
      }

      if (response.success) {
        this.notifications.success(this.currentEditUser ? 'User updated successfully' : 'User created successfully');
        this.hideUserModal();
        await this.loadUsers(this.currentPage);
      }
    } catch (error) {
      this.notifications.error('Error saving user: ' + error.message);
    }
  }

  async editUser(userId) {
    try {
      const response = await this.apiClient.getAdminUsersId(userId);
      if (response.success) {
        this.showUserModal(response.data.user);
      }
    } catch (error) {
      this.notifications.error('Error loading user: ' + error.message);
    }
  }

  async deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await this.apiClient.deleteAdminUsersId(userId);
      if (response.success) {
        this.notifications.success('User deleted successfully');
        await this.loadUsers(this.currentPage);
      }
    } catch (error) {
      this.notifications.error('Error deleting user: ' + error.message);
    }
  }
}