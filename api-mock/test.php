<?php
/**
 * Script de test pour le serveur mock
 */

$baseUrl = 'http://localhost:8080';

function makeRequest($method, $url, $headers = [], $body = null) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 10
    ]);
    
    if ($body) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'body' => $response,
        'error' => $error
    ];
}

function testEndpoint($name, $method, $path, $headers = [], $body = null) {
    global $baseUrl;
    
    echo "Testing: $name\n";
    echo "  $method $path\n";
    
    $response = makeRequest($method, $baseUrl . $path, $headers, $body);
    
    if ($response['error']) {
        echo "  ❌ Error: " . $response['error'] . "\n";
        return false;
    }
    
    echo "  ✅ Status: " . $response['status'] . "\n";
    
    if ($response['body']) {
        $json = json_decode($response['body'], true);
        if ($json) {
            echo "  📄 Response: " . (isset($json['message']) ? $json['message'] : 'JSON response') . "\n";
        }
    }
    
    echo "\n";
    return true;
}

echo "🚀 Testing Mock Server at $baseUrl\n";
echo "=====================================\n\n";

// Test 1: Health Check
testEndpoint(
    'Health Check',
    'GET',
    '/health'
);

// Test 2: Login
testEndpoint(
    'User Login',
    'POST',
    '/auth/login',
    ['Content-Type: application/json'],
    json_encode(['email' => 'demo@example.com', 'password' => 'password123'])
);

// Test 3: Register
testEndpoint(
    'User Registration',
    'POST',
    '/auth/register',
    ['Content-Type: application/json'],
    json_encode(['name' => 'Test User', 'email' => 'test@example.com', 'password' => 'password123'])
);

// Test 4: Get User Profile (with auth)
testEndpoint(
    'Get User Profile',
    'GET',
    '/user',
    ['Authorization: Bearer mock-token']
);

// Test 5: List Social Profiles
testEndpoint(
    'List Social Profiles',
    'GET',
    '/social-media-profiles',
    ['Authorization: Bearer mock-token']
);

// Test 6: Get Profile by ID
testEndpoint(
    'Get Social Profile by ID',
    'GET',
    '/social-media-profiles/1',
    ['Authorization: Bearer mock-token']
);

// Test 7: Create Social Profile
testEndpoint(
    'Create Social Profile',
    'POST',
    '/social-media-profiles',
    ['Authorization: Bearer mock-token', 'Content-Type: application/json'],
    json_encode(['platform' => 'linkedin', 'username' => 'test-user'])
);

// Test 8: Update Social Profile
testEndpoint(
    'Update Social Profile',
    'PUT',
    '/social-media-profiles/1',
    ['Authorization: Bearer mock-token', 'Content-Type: application/json'],
    json_encode(['username' => 'updated-user'])
);

// Test 9: Sync Profile
testEndpoint(
    'Sync Social Profile',
    'POST',
    '/social-media-profiles/1/sync',
    ['Authorization: Bearer mock-token']
);

// Test 10: Get Profiles by Platform
testEndpoint(
    'Get Profiles by Platform',
    'GET',
    '/social-media-profiles/platform/twitter',
    ['Authorization: Bearer mock-token']
);

// Test 11: Delete Profile
testEndpoint(
    'Delete Social Profile',
    'DELETE',
    '/social-media-profiles/1',
    ['Authorization: Bearer mock-token']
);

// Test 12: Logout
testEndpoint(
    'User Logout',
    'POST',
    '/auth/logout',
    ['Authorization: Bearer mock-token']
);

// Test 13: 404 Not Found
testEndpoint(
    '404 Not Found',
    'GET',
    '/non-existent-endpoint'
);

echo "✅ All tests completed!\n";