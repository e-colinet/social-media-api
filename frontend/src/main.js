// Point d'entrée principal de l'application

import { apiClient } from './api/client.js';
import { authManager } from './utils/auth.js';
import { notifications } from './utils/notifications.js';
import { ProfileCard } from './components/ProfileCard.js';
import { ProfileModal } from './components/ProfileModal.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { AdminUserManager } from './components/AdminUserManager.js';
import { AdminProfileManager } from './components/AdminProfileManager.js';

class SocialMediaApp {
  constructor() {
    this.profiles = [];
    this.filteredProfiles = [];
    this.currentUser = null;
    this.currentView = 'profiles'; // 'profiles', 'admin-dashboard', 'admin-users', 'admin-profiles'
    
    // Admin components
    this.adminDashboard = null;
    this.adminUserManager = null;
    this.adminProfileManager = null;
    
    this.initializeApp();
  }

  async initializeApp() {
    // Configurer l'URL de base de l'API
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isDev 
      ? 'http://localhost:8000/api' 
      : 'https://work-1-nuszbjvsplvachds.prod-runtime.all-hands.dev/api';
    
    apiClient.baseUrl = baseUrl;

    // Vérifier l'authentification existante
    if (authManager.isAuthenticated()) {
      const token = authManager.getToken();
      apiClient.setToken(token);
      
      try {
        await this.loadCurrentUser();
        this.showProfilesSection();
        await this.loadProfiles();
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        authManager.clearAuth();
        this.showAuthSection();
      }
    } else {
      this.showAuthSection();
    }

    this.initializeEventListeners();
    this.initializeModal();
  }

  initializeEventListeners() {
    // Navigation
    document.getElementById('login-btn').addEventListener('click', () => this.showLoginForm());
    document.getElementById('register-btn').addEventListener('click', () => this.showRegisterForm());
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());

    // Formulaires d'authentification
    document.getElementById('login-form').querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('register-form').querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    // Gestion des profils
    document.getElementById('add-profile-btn').addEventListener('click', () => {
      this.profileModal.show();
    });

    // Filtres
    document.getElementById('platform-filter').addEventListener('change', () => this.applyFilters());
    document.getElementById('active-filter').addEventListener('change', () => this.applyFilters());

    // Admin navigation
    const adminDashboardBtn = document.getElementById('admin-dashboard-btn');
    const adminUsersBtn = document.getElementById('admin-users-btn');
    const adminProfilesBtn = document.getElementById('admin-profiles-btn');
    const backToProfilesBtn = document.getElementById('back-to-profiles-btn');

    if (adminDashboardBtn) {
      adminDashboardBtn.addEventListener('click', () => this.showAdminDashboard());
    }
    if (adminUsersBtn) {
      adminUsersBtn.addEventListener('click', () => this.showAdminUsers());
    }
    if (adminProfilesBtn) {
      adminProfilesBtn.addEventListener('click', () => this.showAdminProfiles());
    }
    if (backToProfilesBtn) {
      backToProfilesBtn.addEventListener('click', () => this.showUserProfiles());
    }
  }

  initializeModal() {
    this.profileModal = new ProfileModal(
      (data, currentProfile) => this.saveProfile(data, currentProfile),
      () => console.log('Modal fermé')
    );
  }

  // === AUTHENTIFICATION ===

  showAuthSection() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('profiles-section').classList.add('hidden');
    document.getElementById('login-btn').classList.remove('hidden');
    document.getElementById('register-btn').classList.remove('hidden');
    document.getElementById('logout-btn').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
  }

  showProfilesSection() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('profiles-section').classList.remove('hidden');
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('register-btn').classList.add('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    
    // Show/hide admin navigation based on user role
    const adminNav = document.getElementById('admin-nav');
    if (adminNav) {
      if (this.currentUser && this.currentUser.is_admin) {
        adminNav.classList.remove('hidden');
      } else {
        adminNav.classList.add('hidden');
      }
    }
    
    if (this.currentUser) {
      document.getElementById('user-info').textContent = `Connecté en tant que ${this.currentUser.name}`;
    }
  }

  showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
  }

  showRegisterForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  }

  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await apiClient.postLogin({ email, password });
      
      if (response.success) {
        const { user, access_token } = response.data;
        authManager.saveAuth(access_token, user);
        apiClient.setToken(access_token);
        this.currentUser = user;
        
        notifications.success('Connexion réussie !');
        
        // Show admin section if user is admin, otherwise show profiles
        if (user.is_admin) {
          this.showAdminDashboard();
        } else {
          this.showProfilesSection();
          await this.loadProfiles();
        }
      }
    } catch (error) {
      notifications.error('Erreur de connexion: ' + error.message);
    }
  }

  async handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    if (password !== passwordConfirm) {
      notifications.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await apiClient.postRegister({
        name,
        email,
        password,
        password_confirmation: passwordConfirm
      });
      
      if (response.success) {
        const { user, access_token } = response.data;
        authManager.saveAuth(access_token, user);
        apiClient.setToken(access_token);
        this.currentUser = user;
        
        notifications.success('Inscription réussie !');
        this.showProfilesSection();
        await this.loadProfiles();
      }
    } catch (error) {
      notifications.error('Erreur d\'inscription: ' + error.message);
    }
  }

  async loadCurrentUser() {
    try {
      const response = await apiClient.getUser();
      if (response.success) {
        this.currentUser = response.data.user;
        authManager.saveAuth(authManager.getToken(), this.currentUser);
      }
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await apiClient.postLogout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      authManager.logout();
      apiClient.setToken(null);
      this.currentUser = null;
      this.profiles = [];
      notifications.success('Déconnexion réussie');
      this.showAuthSection();
    }
  }

  // === GESTION DES PROFILS ===

  async loadProfiles() {
    try {
      const response = await apiClient.getSocialMediaProfiles();
      if (response.success) {
        this.profiles = response.data.profiles || [];
        this.applyFilters();
      }
    } catch (error) {
      notifications.error('Erreur lors du chargement des profils: ' + error.message);
    }
  }

  applyFilters() {
    const platformFilter = document.getElementById('platform-filter').value;
    const activeFilter = document.getElementById('active-filter').checked;

    this.filteredProfiles = this.profiles.filter(profile => {
      const platformMatch = !platformFilter || profile.platform === platformFilter;
      const activeMatch = !activeFilter || profile.is_active;
      return platformMatch && activeMatch;
    });

    this.renderProfiles();
  }

  renderProfiles() {
    const container = document.getElementById('profiles-list');
    container.innerHTML = '';

    if (this.filteredProfiles.length === 0) {
      container.innerHTML = '<p class="no-profiles">Aucun profil trouvé. Ajoutez votre premier profil !</p>';
      return;
    }

    this.filteredProfiles.forEach(profile => {
      const profileCard = new ProfileCard(
        profile,
        (profile) => this.editProfile(profile),
        (profile) => this.deleteProfile(profile),
        (profile) => this.syncProfile(profile)
      );
      container.appendChild(profileCard.render());
    });
  }

  async saveProfile(data, currentProfile) {
    this.profileModal.setLoading(true);
    
    try {
      let response;
      
      if (currentProfile) {
        // Modification
        response = await apiClient.putSocialMediaProfilesId(currentProfile.id, data);
      } else {
        // Création
        response = await apiClient.postSocialMediaProfiles(data);
      }

      if (response.success) {
        notifications.success(currentProfile ? 'Profil modifié avec succès' : 'Profil créé avec succès');
        await this.loadProfiles();
      }
    } catch (error) {
      notifications.error('Erreur lors de la sauvegarde: ' + error.message);
      throw error;
    } finally {
      this.profileModal.setLoading(false);
    }
  }

  editProfile(profile) {
    this.profileModal.show(profile);
  }

  async deleteProfile(profile) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le profil ${profile.display_name} ?`)) {
      return;
    }

    try {
      const response = await apiClient.deleteSocialMediaProfilesId(profile.id);
      if (response.success) {
        notifications.success('Profil supprimé avec succès');
        await this.loadProfiles();
      }
    } catch (error) {
      notifications.error('Erreur lors de la suppression: ' + error.message);
    }
  }

  async syncProfile(profile) {
    try {
      notifications.info('Synchronisation en cours...');
      const response = await apiClient.postSocialMediaProfilesIdSync(profile.id);
      if (response.success) {
        notifications.success('Profil synchronisé avec succès');
        await this.loadProfiles();
      }
    } catch (error) {
      notifications.error('Erreur lors de la synchronisation: ' + error.message);
    }
  }

  // === ADMIN VIEWS ===

  showUserProfiles() {
    this.currentView = 'profiles';
    this.hideAllSections();
    document.getElementById('profiles-section').classList.remove('hidden');
    this.updateActiveNavButton('profiles');
  }

  async showAdminDashboard() {
    if (!this.currentUser || !this.currentUser.is_admin) {
      notifications.error('Access denied. Admin privileges required.');
      return;
    }

    this.currentView = 'admin-dashboard';
    this.hideAllSections();
    
    const adminSection = document.getElementById('admin-section');
    adminSection.classList.remove('hidden');
    
    if (!this.adminDashboard) {
      this.adminDashboard = new AdminDashboard(apiClient);
    }
    
    try {
      await this.adminDashboard.loadDashboardData();
      const dashboardContainer = document.getElementById('admin-content');
      dashboardContainer.innerHTML = '';
      dashboardContainer.appendChild(this.adminDashboard.render());
    } catch (error) {
      notifications.error('Error loading admin dashboard: ' + error.message);
    }
    
    this.updateActiveNavButton('admin-dashboard');
  }

  async showAdminUsers() {
    if (!this.currentUser || !this.currentUser.is_admin) {
      notifications.error('Access denied. Admin privileges required.');
      return;
    }

    this.currentView = 'admin-users';
    this.hideAllSections();
    
    const adminSection = document.getElementById('admin-section');
    adminSection.classList.remove('hidden');
    
    if (!this.adminUserManager) {
      this.adminUserManager = new AdminUserManager(apiClient, notifications);
      // Make it globally accessible for onclick handlers
      window.adminUserManager = this.adminUserManager;
    }
    
    try {
      await this.adminUserManager.loadUsers();
      const adminContent = document.getElementById('admin-content');
      adminContent.innerHTML = '';
      adminContent.appendChild(this.adminUserManager.render());
    } catch (error) {
      notifications.error('Error loading admin users: ' + error.message);
    }
    
    this.updateActiveNavButton('admin-users');
  }

  async showAdminProfiles() {
    if (!this.currentUser || !this.currentUser.is_admin) {
      notifications.error('Access denied. Admin privileges required.');
      return;
    }

    this.currentView = 'admin-profiles';
    this.hideAllSections();
    
    const adminSection = document.getElementById('admin-section');
    adminSection.classList.remove('hidden');
    
    if (!this.adminProfileManager) {
      this.adminProfileManager = new AdminProfileManager(apiClient, notifications);
      // Make it globally accessible for onclick handlers
      window.adminProfileManager = this.adminProfileManager;
    }
    
    try {
      await this.adminProfileManager.loadProfiles();
      const adminContent = document.getElementById('admin-content');
      adminContent.innerHTML = '';
      adminContent.appendChild(this.adminProfileManager.render());
    } catch (error) {
      notifications.error('Error loading admin profiles: ' + error.message);
    }
    
    this.updateActiveNavButton('admin-profiles');
  }

  hideAllSections() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('profiles-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');
  }

  updateActiveNavButton(activeView) {
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to current view button
    const activeButton = document.getElementById(`${activeView}-btn`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  new SocialMediaApp();
});