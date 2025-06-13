// Composant pour afficher une carte de profil

export class ProfileCard {
  constructor(profile, onEdit, onDelete, onSync) {
    this.profile = profile;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.onSync = onSync;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.dataset.profileId = this.profile.id;

    const avatarUrl = this.profile.avatar_url || this.getDefaultAvatar(this.profile.platform);
    const statusClass = this.profile.is_active ? 'active' : 'inactive';
    const statusText = this.profile.is_active ? 'Actif' : 'Inactif';

    card.innerHTML = `
      <div class="profile-header">
        <img src="${avatarUrl}" alt="Avatar" class="profile-avatar" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNkZGQiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOTk5Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzIDQgMTQuMzQgNCAyMFYyMkgyMFYyMEMyMCAxNC4zNCAyMC42NyAxMyAxMiAxNFoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo='">
        <div class="profile-info">
          <h3>${this.profile.display_name}</h3>
          <span class="profile-platform">${this.profile.platform}</span>
        </div>
      </div>
      
      <div class="profile-details">
        <p><strong>Nom d'utilisateur:</strong> ${this.profile.username}</p>
        <p><strong>ID plateforme:</strong> ${this.profile.platform_user_id}</p>
        ${this.profile.profile_url ? `<p><strong>URL:</strong> <a href="${this.profile.profile_url}" target="_blank">${this.profile.profile_url}</a></p>` : ''}
        <p><strong>Statut:</strong> <span class="profile-status ${statusClass}">${statusText}</span></p>
        ${this.profile.last_synced_at ? `<p><strong>Dernière sync:</strong> ${new Date(this.profile.last_synced_at).toLocaleString()}</p>` : ''}
      </div>
      
      ${this.profile.bio ? `<div class="profile-bio">${this.profile.bio}</div>` : ''}
      
      <div class="profile-actions">
        <button class="btn btn-primary btn-edit" data-id="${this.profile.id}">Modifier</button>
        <button class="btn btn-success btn-sync" data-id="${this.profile.id}">Synchroniser</button>
        <button class="btn btn-danger btn-delete" data-id="${this.profile.id}">Supprimer</button>
      </div>
    `;

    // Ajouter les événements
    this.attachEvents(card);

    return card;
  }

  attachEvents(card) {
    const editBtn = card.querySelector('.btn-edit');
    const deleteBtn = card.querySelector('.btn-delete');
    const syncBtn = card.querySelector('.btn-sync');

    editBtn.addEventListener('click', () => this.onEdit(this.profile));
    deleteBtn.addEventListener('click', () => this.onDelete(this.profile));
    syncBtn.addEventListener('click', () => this.onSync(this.profile));
  }

  getDefaultAvatar(platform) {
    // Retourne une image par défaut basée sur la plateforme
    const colors = {
      facebook: '#1877f2',
      twitter: '#1da1f2',
      instagram: '#e4405f',
      linkedin: '#0077b5',
      youtube: '#ff0000',
      tiktok: '#000000',
      snapchat: '#fffc00',
      pinterest: '#bd081c'
    };

    const color = colors[platform] || '#666';
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="25" fill="${color}"/>
        <text x="25" y="30" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">
          ${platform.charAt(0).toUpperCase()}
        </text>
      </svg>
    `)}`;
  }
}