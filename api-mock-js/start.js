#!/usr/bin/env node

/**
 * Script de démarrage du serveur mock
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration par défaut
const defaultConfig = {
    host: '0.0.0.0',
    port: 8080,
    stubs: join(__dirname, 'stubs'),
    debug: true
};

// Parsing des arguments de ligne de commande
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--host':
        case '-h':
            options.host = args[++i];
            break;
        case '--port':
        case '-p':
            options.port = parseInt(args[++i]);
            break;
        case '--stubs':
        case '-s':
            options.stubs = args[++i];
            break;
        case '--debug':
        case '-d':
            options.debug = true;
            break;
        case '--help':
            showHelp();
            process.exit(0);
    }
}

function showHelp() {
    console.log("Usage: node start.js [OPTIONS]");
    console.log("Options:");
    console.log("  -h, --host HOST     Host to bind to (default: 0.0.0.0)");
    console.log("  -p, --port PORT     Port to listen on (default: 8080)");
    console.log("  -s, --stubs DIR     Stubs directory (default: ./stubs)");
    console.log("  -d, --debug         Enable debug mode");
    console.log("  --help              Show this help message");
}

// Configuration finale
const config = {
    host: options.host || defaultConfig.host,
    port: options.port || defaultConfig.port,
    stubs: options.stubs || defaultConfig.stubs,
    debug: options.debug !== undefined ? options.debug : defaultConfig.debug
};

console.log("Starting Mock Server...");
console.log(`Host: ${config.host}`);
console.log(`Port: ${config.port}`);
console.log(`Stubs Directory: ${config.stubs}`);
console.log(`Debug Mode: ${config.debug ? 'ON' : 'OFF'}`);
console.log();

// Variables d'environnement pour la configuration
process.env.MOCK_HOST = config.host;
process.env.MOCK_PORT = config.port.toString();
process.env.MOCK_STUBS_DIR = config.stubs;
process.env.MOCK_CORS = '1';
process.env.MOCK_DEBUG = config.debug ? '1' : '0';

// Démarrage du serveur
const serverProcess = spawn('node', [join(__dirname, 'index.js')], {
    stdio: 'inherit',
    env: process.env
});

serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(code);
    }
});

// Gestion des signaux
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill('SIGTERM');
});