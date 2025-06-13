<?php
/**
 * Script de démarrage du serveur mock
 */

// Configuration par défaut
$defaultConfig = [
    'host' => '0.0.0.0',
    'port' => 8080,
    'stubs_directory' => __DIR__ . '/stubs',
    'cors_enabled' => true,
    'debug' => true
];

// Parsing des arguments de ligne de commande
$options = getopt('h:p:s:d', [
    'host:',
    'port:',
    'stubs:',
    'debug',
    'help'
]);

if (isset($options['help'])) {
    echo "Usage: php start.php [OPTIONS]\n";
    echo "Options:\n";
    echo "  -h, --host HOST     Host to bind to (default: 0.0.0.0)\n";
    echo "  -p, --port PORT     Port to listen on (default: 8080)\n";
    echo "  -s, --stubs DIR     Stubs directory (default: ./stubs)\n";
    echo "  -d, --debug         Enable debug mode\n";
    echo "  --help              Show this help message\n";
    exit(0);
}

// Configuration finale
$config = [
    'host' => $options['host'] ?? $options['h'] ?? $defaultConfig['host'],
    'port' => (int)($options['port'] ?? $options['p'] ?? $defaultConfig['port']),
    'stubs_directory' => $options['stubs'] ?? $options['s'] ?? $defaultConfig['stubs_directory'],
    'cors_enabled' => $defaultConfig['cors_enabled'],
    'debug' => isset($options['debug']) || isset($options['d']) || $defaultConfig['debug']
];

echo "Starting Mock Server...\n";
echo "Host: {$config['host']}\n";
echo "Port: {$config['port']}\n";
echo "Stubs Directory: {$config['stubs_directory']}\n";
echo "Debug Mode: " . ($config['debug'] ? 'ON' : 'OFF') . "\n";
echo "CORS: " . ($config['cors_enabled'] ? 'ENABLED' : 'DISABLED') . "\n";
echo "\n";

// Vérification du répertoire de stubs
if (!is_dir($config['stubs_directory'])) {
    echo "Error: Stubs directory not found: {$config['stubs_directory']}\n";
    exit(1);
}

// Comptage des stubs
$stubFiles = glob($config['stubs_directory'] . '/*.json');
echo "Loaded " . count($stubFiles) . " stub files:\n";
foreach ($stubFiles as $file) {
    echo "  - " . basename($file) . "\n";
}
echo "\n";

// Démarrage du serveur PHP intégré
$documentRoot = __DIR__;
$router = __DIR__ . '/index.php';

// Variables d'environnement pour la configuration
putenv("MOCK_HOST={$config['host']}");
putenv("MOCK_PORT={$config['port']}");
putenv("MOCK_STUBS_DIR={$config['stubs_directory']}");
putenv("MOCK_CORS=" . ($config['cors_enabled'] ? '1' : '0'));
putenv("MOCK_DEBUG=" . ($config['debug'] ? '1' : '0'));

$command = sprintf(
    'php -S %s:%d -t %s %s',
    $config['host'],
    $config['port'],
    escapeshellarg($documentRoot),
    escapeshellarg($router)
);

echo "Server URL: http://{$config['host']}:{$config['port']}\n";
echo "Health Check: http://{$config['host']}:{$config['port']}/health\n";
echo "\nPress Ctrl+C to stop the server\n";
echo "=====================================\n\n";

// Exécution du serveur
passthru($command);