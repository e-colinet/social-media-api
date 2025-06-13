#!/usr/bin/env node

/**
 * Script de test pour le serveur mock
 */

import http from 'http';

const baseUrl = 'http://localhost:8090';

function makeRequest(method, path, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, baseUrl);
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'User-Agent': 'Mock-Test-Client/1.0',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(body);
        }
        
        req.end();
    });
}

async function testEndpoint(name, method, path, headers = {}, body = null) {
    console.log(`Testing: ${name}`);
    console.log(`  ${method} ${path}`);
    
    try {
        const response = await makeRequest(method, path, headers, body);
        
        console.log(`  ✅ Status: ${response.status}`);
        
        if (response.body) {
            try {
                const json = JSON.parse(response.body);
                const message = json.message || json.success || 'JSON response';
                console.log(`  📄 Response: ${message}`);
            } catch {
                console.log(`  📄 Response: ${response.body.substring(0, 100)}...`);
            }
        }
        
        console.log();
        return true;
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        console.log();
        return false;
    }
}

async function runTests() {
    console.log(`🚀 Testing Mock Server at ${baseUrl}`);
    console.log("=====================================\n");

    const tests = [
        // Test 1: Health Check
        ['Health Check', 'GET', '/health'],
        
        // Test 2: Login
        ['User Login', 'POST', '/auth/login', 
         { 'Content-Type': 'application/json' },
         JSON.stringify({ email: 'demo@example.com', password: 'password123' })],
        
        // Test 3: Register
        ['User Registration', 'POST', '/auth/register',
         { 'Content-Type': 'application/json' },
         JSON.stringify({ name: 'Test User', email: 'test@example.com', password: 'password123' })],
        
        // Test 4: Get User Profile (with auth)
        ['Get User Profile', 'GET', '/user',
         { 'Authorization': 'Bearer mock-token' }],
        
        // Test 5: List Social Profiles
        ['List Social Profiles', 'GET', '/social-media-profiles',
         { 'Authorization': 'Bearer mock-token' }],
        
        // Test 6: Get Profile by ID
        ['Get Social Profile by ID', 'GET', '/social-media-profiles/1',
         { 'Authorization': 'Bearer mock-token' }],
        
        // Test 7: Create Social Profile
        ['Create Social Profile', 'POST', '/social-media-profiles',
         { 'Authorization': 'Bearer mock-token', 'Content-Type': 'application/json' },
         JSON.stringify({ platform: 'linkedin', username: 'test-user' })],
        
        // Test 8: Update Social Profile
        ['Update Social Profile', 'PUT', '/social-media-profiles/1',
         { 'Authorization': 'Bearer mock-token', 'Content-Type': 'application/json' },
         JSON.stringify({ username: 'updated-user' })],
        
        // Test 9: Sync Profile
        ['Sync Social Profile', 'POST', '/social-media-profiles/1/sync',
         { 'Authorization': 'Bearer mock-token' }],
        
        // Test 10: Get Profiles by Platform
        ['Get Profiles by Platform', 'GET', '/social-media-profiles/platform/twitter',
         { 'Authorization': 'Bearer mock-token' }],
        
        // Test 11: Delete Profile
        ['Delete Social Profile', 'DELETE', '/social-media-profiles/1',
         { 'Authorization': 'Bearer mock-token' }],
        
        // Test 12: Logout
        ['User Logout', 'POST', '/auth/logout',
         { 'Authorization': 'Bearer mock-token' }],
        
        // Test 13: 404 Not Found
        ['404 Not Found', 'GET', '/non-existent-endpoint']
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const success = await testEndpoint(...test);
        if (success) {
            passed++;
        } else {
            failed++;
        }
    }

    console.log(`✅ Tests completed: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        process.exit(1);
    }
}

// Vérifier si le serveur est accessible
async function checkServer() {
    try {
        await makeRequest('GET', '/health');
        return true;
    } catch (error) {
        console.error('❌ Mock server is not running or not accessible');
        console.error('   Please start the server first with: node start.js');
        return false;
    }
}

// Exécution des tests
checkServer().then(serverRunning => {
    if (serverRunning) {
        runTests();
    } else {
        process.exit(1);
    }
});