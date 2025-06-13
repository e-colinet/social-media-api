#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration de l\'environnement de développement...\n');

// Vérifier si les dépendances sont installées
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installation des dépendances...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dépendances installées\n');
}

// Générer les modèles
console.log('🔄 Génération des modèles à partir du fichier OpenAPI...');
try {
  execSync('npm run generate-models', { stdio: 'inherit' });
  console.log('✅ Modèles générés avec succès\n');
} catch (error) {
  console.error('❌ Erreur lors de la génération des modèles');
  process.exit(1);
}

// Vérifier la synchronisation
console.log('🔍 Vérification de la synchronisation des modèles...');
try {
  execSync('npm run check-models', { stdio: 'inherit' });
  console.log('✅ Modèles synchronisés\n');
} catch (error) {
  console.error('❌ Modèles non synchronisés');
  process.exit(1);
}

console.log('🎉 Environnement de développement prêt !');
console.log('\n📋 Commandes disponibles :');
console.log('  npm run dev              - Démarrer le serveur de développement');
console.log('  npm run build            - Construire pour la production');
console.log('  npm run generate-models  - Générer les modèles depuis OpenAPI');
console.log('  npm run check-models     - Vérifier la synchronisation des modèles');
console.log('\n🌐 URLs d\'accès :');
console.log('  Local: http://localhost:12001');
console.log('  Externe: https://work-2-nuszbjvsplvachds.prod-runtime.all-hands.dev');
console.log('\n🔐 Compte de test :');
console.log('  Email: demo@example.com');
console.log('  Mot de passe: password123');