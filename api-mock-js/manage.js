#!/usr/bin/env node

/**
 * Script de gestion du serveur mock
 * Usage: node manage.js [command] [options]
 */

import { spawn, exec } from 'child_process';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showHelp() {
    console.log("Mock Server Management Script");
    console.log("=============================\n");
    console.log("Usage: node manage.js [command] [options]\n");
    console.log("Commands:");
    console.log("  start [--port PORT] [--host HOST] [--stubs DIR]  Start the mock server");
    console.log("  stop                                             Stop the mock server");
    console.log("  restart [options]                                Restart the mock server");
    console.log("  status                                           Show server status");
    console.log("  test                                             Run test suite");
    console.log("  validate                                         Validate all stubs");
    console.log("  list-stubs                                       List all stub files");
    console.log("  help                                             Show this help\n");
    console.log("Options:");
    console.log("  --port PORT     Port to listen on (default: 8080)");
    console.log("  --host HOST     Host to bind to (default: 0.0.0.0)");
    console.log("  --stubs DIR     Stubs directory (default: ./stubs)");
    console.log("  --debug         Enable debug mode\n");
    console.log("Examples:");
    console.log("  node manage.js start --port 8080");
    console.log("  node manage.js test");
    console.log("  node manage.js validate");
}

function startServer(args) {
    const options = ['start.js'];
    
    for (let i = 1; i < args.length; i++) {
        switch (args[i]) {
            case '--port':
                options.push('--port', args[++i]);
                break;
            case '--host':
                options.push('--host', args[++i]);
                break;
            case '--stubs':
                options.push('--stubs', args[++i]);
                break;
            case '--debug':
                options.push('--debug');
                break;
        }
    }
    
    console.log("Starting mock server...");
    console.log(`Command: node ${options.join(' ')}`);
    
    const serverProcess = spawn('node', options, {
        stdio: 'inherit',
        cwd: __dirname
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    });
}

function stopServer() {
    console.log("Stopping mock server...");
    
    exec('pkill -f "node.*start.js"', (error) => {
        if (error) {
            console.log("No mock server process found or already stopped.");
        } else {
            console.log("Mock server stopped.");
        }
    });
}

function restartServer(args) {
    stopServer();
    setTimeout(() => {
        startServer(args);
    }, 1000);
}

async function getServerStatus() {
    return new Promise((resolve) => {
        exec('pgrep -f "node.*start.js"', (error, stdout) => {
            const pid = stdout.trim();
            
            if (pid) {
                console.log(`✅ Mock server is running (PID: ${pid})`);
                
                // Test de connectivité
                const req = http.get('http://localhost:8080/health', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            console.log("✅ Health check: OK");
                            try {
                                const response = JSON.parse(data);
                                if (response.timestamp) {
                                    console.log(`📅 Last response: ${response.timestamp}`);
                                }
                            } catch {}
                        } else {
                            console.log(`❌ Health check: Failed (HTTP ${res.statusCode})`);
                        }
                        resolve();
                    });
                });
                
                req.on('error', () => {
                    console.log("❌ Health check: Failed (connection error)");
                    resolve();
                });
                
                req.setTimeout(5000, () => {
                    console.log("❌ Health check: Timeout");
                    req.destroy();
                    resolve();
                });
            } else {
                console.log("❌ Mock server is not running");
                resolve();
            }
        });
    });
}

async function runTests() {
    console.log("Running test suite...");
    console.log("=====================\n");
    
    // Vérifier si le serveur tourne
    return new Promise((resolve) => {
        exec('pgrep -f "node.*start.js"', (error, stdout) => {
            if (!stdout.trim()) {
                console.log("❌ Mock server is not running. Please start it first.");
                resolve();
                return;
            }
            
            const testProcess = spawn('node', ['test.js'], {
                stdio: 'inherit',
                cwd: __dirname
            });
            
            testProcess.on('close', (code) => {
                resolve();
            });
        });
    });
}

function validateStubs() {
    console.log("Validating stub files...");
    console.log("========================\n");
    
    const stubsDir = join(__dirname, 'stubs');
    
    if (!existsSync(stubsDir)) {
        console.log(`❌ Stubs directory not found: ${stubsDir}`);
        return;
    }
    
    const files = readdirSync(stubsDir).filter(file => extname(file) === '.json');
    const validStubs = [];
    const invalidStubs = [];
    
    for (const file of files) {
        const filePath = join(stubsDir, file);
        
        try {
            const content = readFileSync(filePath, 'utf8');
            const stub = JSON.parse(content);
            
            if (isValidStub(stub)) {
                validStubs.push({ file, stub });
            } else {
                invalidStubs.push({ file, error: 'Invalid stub structure' });
            }
        } catch (error) {
            invalidStubs.push({ file, error: error.message });
        }
    }
    
    if (invalidStubs.length === 0) {
        console.log(`✅ All ${validStubs.length} stub files are valid\n`);
        
        // Trier par priorité
        validStubs.sort((a, b) => (b.stub.priority || 5) - (a.stub.priority || 5));
        
        for (const { file, stub } of validStubs) {
            const priority = stub.priority || 5;
            const method = stub.request.method;
            const url = stub.request.url || stub.request.urlPattern || 'pattern';
            
            console.log(`  ✅ ${file.padEnd(30)} Priority: ${priority} - ${method} ${url}`);
        }
    } else {
        console.log(`❌ Found ${invalidStubs.length} invalid stub(s):`);
        for (const { file, error } of invalidStubs) {
            console.log(`  ❌ ${file} - ${error}`);
        }
        
        if (validStubs.length > 0) {
            console.log(`\n✅ ${validStubs.length} valid stub(s) found`);
        }
    }
}

function isValidStub(stub) {
    if (!stub.request || !stub.response) {
        return false;
    }
    
    const request = stub.request;
    
    if (!request.method) {
        return false;
    }
    
    const urlOptions = ['url', 'urlPattern', 'urlPath', 'urlPathPattern'];
    const hasUrlOption = urlOptions.some(option => request[option]);
    
    return hasUrlOption;
}

function listStubs() {
    console.log("Stub files:");
    console.log("===========\n");
    
    const stubsDir = join(__dirname, 'stubs');
    
    if (!existsSync(stubsDir)) {
        console.log(`No stubs directory found: ${stubsDir}`);
        return;
    }
    
    const files = readdirSync(stubsDir).filter(file => extname(file) === '.json');
    
    if (files.length === 0) {
        console.log(`No stub files found in ${stubsDir}`);
        return;
    }
    
    for (const file of files) {
        const filePath = join(stubsDir, file);
        
        try {
            const content = readFileSync(filePath, 'utf8');
            const stub = JSON.parse(content);
            
            const priority = stub.priority || 5;
            const method = stub.request?.method || 'UNKNOWN';
            const url = stub.request?.url || stub.request?.urlPattern || 'pattern';
            
            console.log(`  📄 ${file.padEnd(30)} Priority: ${priority} - ${method} ${url}`);
        } catch {
            console.log(`  ❌ ${file.padEnd(30)} - Invalid JSON`);
        }
    }
    
    console.log(`\nTotal: ${files.length} files`);
}

// Main script
const args = process.argv.slice(2);

if (args.length === 0) {
    showHelp();
    process.exit(1);
}

const command = args[0];

switch (command) {
    case 'start':
        startServer(args);
        break;
        
    case 'stop':
        stopServer();
        break;
        
    case 'restart':
        restartServer(args);
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
        
    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;
        
    default:
        console.log(`Unknown command: ${command}\n`);
        showHelp();
        process.exit(1);
}