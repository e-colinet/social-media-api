<?php
/**
 * Script de gestion du serveur mock
 * Usage: php manage.php [command] [options]
 */

function showHelp() {
    echo "Mock Server Management Script\n";
    echo "=============================\n\n";
    echo "Usage: php manage.php [command] [options]\n\n";
    echo "Commands:\n";
    echo "  start [--port PORT] [--host HOST] [--stubs DIR]  Start the mock server\n";
    echo "  stop                                             Stop the mock server\n";
    echo "  restart [options]                                Restart the mock server\n";
    echo "  status                                           Show server status\n";
    echo "  test                                             Run test suite\n";
    echo "  validate                                         Validate all stubs\n";
    echo "  list-stubs                                       List all stub files\n";
    echo "  reload-stubs                                     Reload stubs (if server supports it)\n";
    echo "  help                                             Show this help\n\n";
    echo "Options:\n";
    echo "  --port PORT     Port to listen on (default: 8080)\n";
    echo "  --host HOST     Host to bind to (default: 0.0.0.0)\n";
    echo "  --stubs DIR     Stubs directory (default: ./stubs)\n";
    echo "  --debug         Enable debug mode\n\n";
    echo "Examples:\n";
    echo "  php manage.php start --port 8080\n";
    echo "  php manage.php test\n";
    echo "  php manage.php validate\n";
}

function startServer($args) {
    $options = [];
    
    for ($i = 1; $i < count($args); $i++) {
        switch ($args[$i]) {
            case '--port':
                $options[] = '--port';
                $options[] = $args[++$i];
                break;
            case '--host':
                $options[] = '--host';
                $options[] = $args[++$i];
                break;
            case '--stubs':
                $options[] = '--stubs';
                $options[] = $args[++$i];
                break;
            case '--debug':
                $options[] = '--debug';
                break;
        }
    }
    
    $command = 'php start.php ' . implode(' ', $options);
    echo "Starting mock server...\n";
    echo "Command: $command\n";
    passthru($command);
}

function stopServer() {
    echo "Stopping mock server...\n";
    $result = shell_exec('pkill -f "php.*start.php" 2>/dev/null');
    echo "Mock server stopped.\n";
}

function restartServer($args) {
    stopServer();
    sleep(1);
    startServer($args);
}

function getServerStatus() {
    $pid = shell_exec('pgrep -f "php.*start.php" 2>/dev/null');
    
    if (trim($pid)) {
        echo "✅ Mock server is running (PID: " . trim($pid) . ")\n";
        
        // Test de connectivité
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/health');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            echo "✅ Health check: OK\n";
            $data = json_decode($response, true);
            if ($data && isset($data['timestamp'])) {
                echo "📅 Last response: " . $data['timestamp'] . "\n";
            }
        } else {
            echo "❌ Health check: Failed (HTTP $httpCode)\n";
        }
    } else {
        echo "❌ Mock server is not running\n";
    }
}

function runTests() {
    echo "Running test suite...\n";
    echo "=====================\n\n";
    
    // Vérifier si le serveur tourne
    $pid = shell_exec('pgrep -f "php.*start.php" 2>/dev/null');
    if (!trim($pid)) {
        echo "❌ Mock server is not running. Please start it first.\n";
        return;
    }
    
    passthru('php test.php');
}

function validateStubs() {
    echo "Validating stub files...\n";
    echo "========================\n\n";
    
    require_once __DIR__ . '/src/StubLoader.php';
    
    $stubsDir = __DIR__ . '/stubs';
    $stubLoader = new StubLoader($stubsDir);
    
    try {
        $stubs = $stubLoader->loadStubs();
        echo "✅ All " . count($stubs) . " stub files are valid\n\n";
        
        foreach ($stubs as $stub) {
            $priority = $stub['priority'] ?? 5;
            $method = $stub['request']['method'];
            $url = $stub['request']['url'] ?? $stub['request']['urlPattern'] ?? 'pattern';
            $file = $stub['_file'];
            
            echo "  ✅ $file - Priority: $priority - $method $url\n";
        }
    } catch (Exception $e) {
        echo "❌ Validation failed: " . $e->getMessage() . "\n";
    }
}

function listStubs() {
    echo "Stub files:\n";
    echo "===========\n\n";
    
    $stubsDir = __DIR__ . '/stubs';
    $files = glob($stubsDir . '/*.json');
    
    if (empty($files)) {
        echo "No stub files found in $stubsDir\n";
        return;
    }
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        $stub = json_decode($content, true);
        
        if ($stub) {
            $priority = $stub['priority'] ?? 5;
            $method = $stub['request']['method'] ?? 'UNKNOWN';
            $url = $stub['request']['url'] ?? $stub['request']['urlPattern'] ?? 'pattern';
            
            echo sprintf("  📄 %-30s Priority: %d - %s %s\n", 
                basename($file), $priority, $method, $url);
        } else {
            echo "  ❌ " . basename($file) . " - Invalid JSON\n";
        }
    }
    
    echo "\nTotal: " . count($files) . " files\n";
}

function reloadStubs() {
    echo "Reloading stubs...\n";
    echo "Note: This is a placeholder. The current server doesn't support hot reload.\n";
    echo "Please restart the server to reload stubs.\n";
}

// Main script
if ($argc < 2) {
    showHelp();
    exit(1);
}

$command = $argv[1];

switch ($command) {
    case 'start':
        startServer($argv);
        break;
        
    case 'stop':
        stopServer();
        break;
        
    case 'restart':
        restartServer($argv);
        break;
        
    case 'status':
        getServerStatus();
        break;
        
    case 'test':
        runTests();
        break;
        
    case 'validate':
        validateStubs();
        break;
        
    case 'list-stubs':
        listStubs();
        break;
        
    case 'reload-stubs':
        reloadStubs();
        break;
        
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;
        
    default:
        echo "Unknown command: $command\n\n";
        showHelp();
        exit(1);
}