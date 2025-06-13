<?php
/**
 * API Mock Server - Compatible avec WireMock
 * 
 * Serveur de bouchon PHP sans framework qui simule l'API Social Media
 * basé sur le fichier OpenAPI YAML avec syntaxe compatible WireMock
 */

require_once __DIR__ . '/src/EnvLoader.php';
require_once __DIR__ . '/src/MockServer.php';
require_once __DIR__ . '/src/StubLoader.php';
require_once __DIR__ . '/src/RequestMatcher.php';
require_once __DIR__ . '/src/ResponseBuilder.php';

// Chargement du fichier .env si présent
EnvLoader::load(__DIR__ . '/.env');

// Configuration depuis les variables d'environnement ou valeurs par défaut
$config = [
    'host' => getenv('MOCK_HOST') ?: '0.0.0.0',
    'port' => (int)(getenv('MOCK_PORT') ?: 8080),
    'stubs_directory' => getenv('MOCK_STUBS_DIR') ?: __DIR__ . '/stubs',
    'cors_enabled' => (bool)(getenv('MOCK_CORS') ?: true),
    'debug' => (bool)(getenv('MOCK_DEBUG') ?: true)
];

// Initialisation du serveur mock
$mockServer = new MockServer($config);

// Démarrage du serveur
$mockServer->start();