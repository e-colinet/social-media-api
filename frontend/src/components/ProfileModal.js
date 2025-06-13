// Composant modal pour ajouter/modifier un profil

export class ProfileModal {
  constructor(onSave, onCancel) {
    this.onSave = onSave;
    this.onCancel = onCancel;
    this.modal = document.getElementById('profile-modal');
    this.form = document.getElementById('profile-form');
    this.currentProfile = null;
    
    this.initializeEvents();
  }

  initializeEvents() {
    // Fermer le modal
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-profile');
    
    closeBtn.addEventListener('click', () => this.hide());
    cancelBtn.addEventListener('click', () => this.hide());
    
    // Fermer en cliquant à l'extérieur
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    // Soumettre le formulaire
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  show(profile = null) {
    this.currentProfile = profile;
    const title = document.getElementById('modal-title');
    
    if (profile) {
      title.textContent = 'Modifier le profil';
      this.populateForm(profile);
    } else {
      title.textContent = 'Ajouter un profil';
      this.resetForm();
    }
    
    this.modal.classList.remove('hidden');
    
    // Focus sur le premier champ
    const firstInput = this.form.querySelector('input, select');
    if (firstInput) {
      firstInput.focus();
    }
  }

  hide() {
    this.modal.classList.add('hidden');
    this.resetForm();
    this.currentProfile = null;
    
    if (this.onCancel) {
      this.onCancel();
    }
  }

  populateForm(profile) {
    document.getElementById('profile-platform').value = profile.platform || '';
    document.getElementById('profile-platform-user-id').value = profile.platform_user_id || '';
    document.getElementById('profile-username').value = profile.username || '';
    document.getElementById('profile-display-name').value = profile.display_name || '';
    document.getElementById('profile-url').value = profile.profile_url || '';
    document.getElementById('profile-avatar-url').value = profile.avatar_url || '';
    document.getElementById('profile-bio').value = profile.bio || '';
    document.getElementById('profile-is-active').checked = profile.is_active !== false;
  }

  resetForm() {
    this.form.reset();
    document.getElementById('profile-is-active').checked = true;
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};
    
    // Récupérer toutes les valeurs du formulaire
    data.platform = document.getElementById('profile-platform').value;
    data.platform_user_id = document.getElementById('profile-platform-user-id').value;
    data.username = document.getElementById('profile-username').value;
    data.display_name = document.getElementById('profile-display-name').value;
    data.profile_url = document.getElementById('profile-url').value || null;
    data.avatar_url = document.getElementById('profile-avatar-url').value || null;
    data.bio = document.getElementById('profile-bio').value || null;
    data.is_active = document.getElementById('profile-is-active').checked;

    // Nettoyer les valeurs vides
    Object.keys(data).forEach(key => {
      if (data[key] === '') {
        data[key] = null;
      }
    });

    return data;
  }

  validateForm() {
    const data = this.getFormData();
    const errors = [];

    if (!data.platform) {
      errors.push('La plateforme est requise');
    }

    if (!data.platform_user_id) {
      errors.push('L\'ID utilisateur plateforme est requis');
    }

    if (!data.username) {
      errors.push('Le nom d\'utilisateur est requis');
    }

    if (!data.display_name) {
      errors.push('Le nom d\'affichage est requis');
    }

    // Valider l'URL si fournie
    if (data.profile_url) {
      try {
        new URL(data.profile_url);
      } catch {
        errors.push('L\'URL du profil n\'est pas valide');
      }
    }

    // Valider l'URL de l'avatar si fournie
    if (data.avatar_url) {
      try {
        new URL(data.avatar_url);
      } catch {
        errors.push('L\'URL de l\'avatar n\'est pas valide');
      }
    }

    return errors;
  }

  async handleSubmit() {
    const errors = this.validateForm();
    
    if (errors.length > 0) {
      alert('Erreurs de validation:\n' + errors.join('\n'));
      return;
    }

    const data = this.getFormData();
    
    try {
      await this.onSave(data, this.currentProfile);
      this.hide();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  }

  setLoading(loading) {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const inputs = this.form.querySelectorAll('input, select, textarea, button');
    
    if (loading) {
      submitBtn.textContent = 'Sauvegarde...';
      inputs.forEach(input => input.disabled = true);
    } else {
      submitBtn.textContent = 'Sauvegarder';
      inputs.forEach(input => input.disabled = false);
    }
  }
}