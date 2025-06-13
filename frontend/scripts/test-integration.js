#!/usr/bin/env node

import { apiClient } from '../src/api/client.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testIntegration() {
  log('🧪 Test d\'intégration Frontend <-> Mock Server', 'bright');
  log('================================================', 'cyan');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: Health Check
  totalTests++;
  try {
    log('\n1. Test Health Check...', 'yellow');
    const health = await apiClient.getHealth();
    if (health.success) {
      log('   ✅ Health check réussi', 'green');
      passedTests++;
    } else {
      log('   ❌ Health check échoué', 'red');
    }
  } catch (error) {
    log(`   ❌ Erreur health check: ${error.message}`, 'red');
  }
  
  // Test 2: Login
  totalTests++;
  let token = null;
  try {
    log('\n2. Test Login...', 'yellow');
    const loginResponse = await apiClient.postLogin({
      email: 'demo@example.com',
      password: 'password123'
    });
    
    if (loginResponse.success && loginResponse.data.token) {
      token = loginResponse.data.token;
      apiClient.setToken(token);
      log('   ✅ Login réussi', 'green');
      log(`   🔑 Token: ${token.substring(0, 20)}...`, 'cyan');
      passedTests++;
    } else {
      log('   ❌ Login échoué', 'red');
    }
  } catch (error) {
    log(`   ❌ Erreur login: ${error.message}`, 'red');
  }
  
  // Test 3: Get User Profile
  totalTests++;
  try {
    log('\n3. Test Get User Profile...', 'yellow');
    const userProfile = await apiClient.getUser();
    if (userProfile.success && userProfile.data) {
      log('   ✅ Profil utilisateur récupéré', 'green');
      log(`   👤 Utilisateur: ${userProfile.data.name} (${userProfile.data.email})`, 'cyan');
      passedTests++;
    } else {
      log('   ❌ Récupération du profil échouée', 'red');
    }
  } catch (error) {
    log(`   ❌ Erreur profil utilisateur: ${error.message}`, 'red');
  }
  
  // Test 4: Get Social Media Profiles
  totalTests++;
  try {
    log('\n4. Test Get Social Media Profiles...', 'yellow');
    const profiles = await apiClient.getSocialMediaProfiles();
    if (profiles.success && Array.isArray(profiles.data)) {
      log('   ✅ Profils sociaux récupérés', 'green');
      log(`   📱 Nombre de profils: ${profiles.data.length}`, 'cyan');
      
      if (profiles.data.length > 0) {
        const firstProfile = profiles.data[0];
        log(`   📋 Premier profil: ${firstProfile.platform} - @${firstProfile.username}`, 'cyan');
      }
      passedTests++;
    } else {
      log('   ❌ Récupération des profils échouée', 'red');
    }
  } catch (error) {
    log(`   ❌ Erreur profils sociaux: ${error.message}`, 'red');
  }
  
  // Test 5: Create Social Media Profile
  totalTests++;
  let createdProfileId = null;
  try {
    log('\n5. Test Create Social Media Profile...', 'yellow');
    const newProfile = {
      platform: 'twitter',
      platform_user_id: 'test_user_123',
      username: 'test_user',
      display_name: 'Test User',
      profile_url: 'https://twitter.com/test_user',
      bio: 'Profile de test créé par le script d\'intégration',
      is_active: true
    };
    
    const createResponse = await apiClient.postSocialMediaProfiles(newProfile);
    if (createResponse.success && createResponse.data) {
      createdProfileId = createResponse.data.id;
      log('   ✅ Profil créé avec succès', 'green');
      log(`   🆔 ID du profil: ${createdProfileId}`, 'cyan');
      passedTests++;
    } else {
      log('   ❌ Création du profil échouée', 'red');
    }
  } catch (error) {
    log(`   ❌ Erreur création profil: ${error.message}`, 'red');
  }
  
  // Test 6: Update Social Media Profile
  if (createdProfileId) {
    totalTests++;
    try {
      log('\n6. Test Update Social Media Profile...', 'yellow');
      const updateData = {
        bio: 'Bio mise à jour par le test d\'intégration',
        display_name: 'Test User Updated'
      };
      
      const updateResponse = await apiClient.putSocialMediaProfilesId(createdProfileId, updateData);
      if (updateResponse.success) {
        log('   ✅ Profil mis à jour avec succès', 'green');
        passedTests++;
      } else {
        log('   ❌ Mise à jour du profil échouée', 'red');
      }
    } catch (error) {
      log(`   ❌ Erreur mise à jour profil: ${error.message}`, 'red');
    }
  }
  
  // Test 7: Sync Social Media Profile
  if (createdProfileId) {
    totalTests++;
    try {
      log('\n7. Test Sync Social Media Profile...', 'yellow');
      const syncResponse = await apiClient.postSocialMediaProfilesIdSync(createdProfileId);
      if (syncResponse.success) {
        log('   ✅ Synchronisation réussie', 'green');
        passedTests++;
      } else {
        log('   ❌ Synchronisation échouée', 'red');
      }
    } catch (error) {
      log(`   ❌ Erreur synchronisation: ${error.message}`, 'red');
    }
  }
  
  // Test 8: Get Profiles by Platform
  totalTests++;
  try {
    log('\n8. Test Get Profiles by Platform...', 'yellow');
    const platformProfiles = await apiClient.getSocialMediaProfilesByPlatform();
    if (platformProfiles.success && platformProfiles.data && platformProfiles.data.profiles_by_platform) {
      log('   ✅ Profils par plateforme récupérés', 'green');
      const platforms = Object.keys(platformProfiles.data.profiles_by_platform);
      log(`   📊 Plateformes: ${platforms.join(', ')}`, 'cyan');
      log(`   📈 Total plateformes: ${platformProfiles.data.total_platforms}`, 'cyan');
      passedTests++;
    } else {
      log('   ❌ Récupération par plateforme échouée', 'red');
    }
  } catch (error) {
    log(`   ❌ Erreur profils par plateforme: ${error.message}`, 'red');
  }
  
  // Test 9: Delete Social Media Profile
  if (createdProfileId) {
    totalTests++;
    try {
      log('\n9. Test Delete Social Media Profile...', 'yellow');
      const deleteResponse = await apiClient.deleteSocialMediaProfilesId(createdProfileId);
      if (deleteResponse.success) {
        log('   ✅ Profil supprimé avec succès', 'green');
        passedTests++;
      } else {
        log('   ❌ Suppression du profil échouée', 'red');
      }
    } catch (error) {
      log(`   ❌ Erreur suppression profil: ${error.message}`, 'red');
    }
  }
  
  // Test 10: Logout
  totalTests++;
  try {
    log('\n10. Test Logout...', 'yellow');
    const logoutResponse = await apiClient.postLogout();
    if (logoutResponse.success) {
      apiClient.clearToken();
      log('   ✅ Déconnexion réussie', 'green');
      passedTests++;
    } else {
      log('   ❌ Déconnexion échouée', 'red');
    }
  } catch (error) {
    log(`   ❌ Erreur déconnexion: ${error.message}`, 'red');
  }
  
  // Résultats finaux
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 Résultats des tests d\'intégration', 'bright');
  log('='.repeat(50), 'cyan');
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  const statusColor = successRate === 100 ? 'green' : successRate >= 80 ? 'yellow' : 'red';
  
  log(`✅ Tests réussis: ${passedTests}/${totalTests}`, 'green');
  log(`📈 Taux de réussite: ${successRate}%`, statusColor);
  
  if (successRate === 100) {
    log('\n🎉 Tous les tests d\'intégration sont passés !', 'green');
    log('✨ Le frontend et le serveur mock fonctionnent parfaitement ensemble.', 'cyan');
  } else if (successRate >= 80) {
    log('\n⚠️  La plupart des tests sont passés, mais il y a quelques problèmes.', 'yellow');
  } else {
    log('\n❌ Plusieurs tests ont échoué. Vérifiez la configuration.', 'red');
  }
  
  log('\n🔗 URLs importantes:', 'bright');
  log(`   Frontend: https://work-2-nuszbjvsplvachds.prod-runtime.all-hands.dev`, 'cyan');
  log(`   Mock API: http://localhost:8090`, 'cyan');
  log(`   Health Check: http://localhost:8090/health`, 'cyan');
  
  return successRate === 100;
}

// Exécuter les tests
testIntegration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n💥 Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
  });