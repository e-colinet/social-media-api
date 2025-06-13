#!/usr/bin/env node

/**
 * API Mock Server - Compatible avec WireMock
 * 
 * Serveur de bouchon JavaScript sans framework qui simule l'API Social Media
 * basé sur le fichier OpenAPI YAML avec syntaxe compatible WireMock
 */

import { EnvLoader } from './src/EnvLoader.js';
import { MockServer } from './src/MockServer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chargement du fichier .env si présent
EnvLoader.load(join(__dirname, '.env'));

// Configuration depuis les variables d'environnement ou valeurs par défaut
const config = {
    host: process.env.MOCK_HOST || '0.0.0.0',
    port: parseInt(process.env.MOCK_PORT) || 8080,
    stubsDirectory: process.env.MOCK_STUBS_DIR || join(__dirname, 'stubs'),
    corsEnabled: (process.env.MOCK_CORS || '1') === '1',
    debug: (process.env.MOCK_DEBUG || '1') === '1'
};

// Initialisation du serveur mock
const mockServer = new MockServer(config);

// Gestion des signaux pour arrêt propre
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down mock server...');
    mockServer.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down mock server...');
    mockServer.stop();
    process.exit(0);
});

// Démarrage du serveur
mockServer.start().catch(error => {
    console.error('❌ Failed to start mock server:', error.message);
    process.exit(1);
});