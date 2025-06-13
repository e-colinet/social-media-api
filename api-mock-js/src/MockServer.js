import http from 'http';
import { URL } from 'url';
import { StubLoader } from './StubLoader.js';
import { RequestMatcher } from './RequestMatcher.js';
import { ResponseBuilder } from './ResponseBuilder.js';

export class MockServer {
    constructor(config) {
        this.config = {
            host: '0.0.0.0',
            port: 8080,
            stubsDirectory: './stubs',
            corsEnabled: true,
            debug: false,
            ...config
        };

        this.stubLoader = new StubLoader(this.config.stubsDirectory);
        this.requestMatcher = new RequestMatcher();
        this.responseBuilder = new ResponseBuilder(this.config.stubsDirectory);
        
        this.stubLoader.setDebug(this.config.debug);
        this.requestMatcher.setDebug(this.config.debug);
        
        this.stubs = [];
        this.server = null;
    }

    async start() {
        try {
            // Charger les stubs
            this.stubs = this.stubLoader.loadStubs();
            
            // Créer le serveur HTTP
            this.server = http.createServer((req, res) => {
                this.handleRequest(req, res);
            });

            // Démarrer le serveur
            return new Promise((resolve, reject) => {
                this.server.listen(this.config.port, this.config.host, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log(`🚀 Mock Server started on http://${this.config.host}:${this.config.port}`);
                        console.log(`📁 Stubs directory: ${this.config.stubsDirectory}`);
                        console.log(`📊 Loaded ${this.stubs.length} stubs`);
                        console.log(`🔧 Debug mode: ${this.config.debug ? 'ON' : 'OFF'}`);
                        console.log(`🌐 CORS: ${this.config.corsEnabled ? 'ENABLED' : 'DISABLED'}`);
                        console.log('\nPress Ctrl+C to stop the server');
                        console.log('=====================================\n');
                        resolve();
                    }
                });
            });
        } catch (error) {
            this.sendErrorResponse(null, null, error);
        }
    }

    stop() {
        if (this.server) {
            this.server.close();
            console.log('Mock server stopped');
        }
    }

    async handleRequest(req, res) {
        try {
            // Parser l'URL
            const url = new URL(req.url, `http://${req.headers.host}`);
            
            // Collecter le body
            const body = await this.collectBody(req);
            
            // Construire l'objet request
            const request = {
                method: req.method,
                url: req.url,
                pathname: url.pathname,
                query: Object.fromEntries(url.searchParams),
                headers: this.normalizeHeaders(req.headers),
                body: body
            };

            if (this.config.debug) {
                console.log(`📥 ${request.method} ${request.pathname}`);
                if (Object.keys(request.query).length > 0) {
                    console.log(`   Query: ${JSON.stringify(request.query)}`);
                }
                if (request.body) {
                    console.log(`   Body: ${request.body.substring(0, 200)}${request.body.length > 200 ? '...' : ''}`);
                }
            }

            // Gérer CORS
            if (this.config.corsEnabled) {
                this.setCorsHeaders(res);
                
                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }
            }

            // Trouver un stub correspondant
            const matchingStub = this.findMatchingStub(request);
            
            if (matchingStub) {
                await this.sendStubResponse(res, matchingStub, request);
            } else {
                this.sendNotFoundResponse(res, request);
            }

        } catch (error) {
            this.sendErrorResponse(res, req, error);
        }
    }

    async collectBody(req) {
        return new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                resolve(body);
            });
        });
    }

    normalizeHeaders(headers) {
        const normalized = {};
        for (const [key, value] of Object.entries(headers)) {
            normalized[key.toLowerCase()] = value;
        }
        return normalized;
    }

    setCorsHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Max-Age', '86400');
    }

    findMatchingStub(request) {
        for (const stub of this.stubs) {
            if (this.requestMatcher.matches(stub, request)) {
                if (this.config.debug) {
                    console.log(`✅ Matched stub: ${stub._file} (priority: ${stub.priority})`);
                }
                return stub;
            }
        }
        return null;
    }

    async sendStubResponse(res, stub, request) {
        const response = this.responseBuilder.buildResponse(stub, request);
        
        // Appliquer le délai si spécifié
        if (response.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, response.delay));
        }

        // Définir les headers
        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }

        // Envoyer la réponse
        res.writeHead(response.status);
        res.end(response.body);

        if (this.config.debug) {
            console.log(`📤 Response: ${response.status} (${response.body.length} bytes)`);
            if (response.delay > 0) {
                console.log(`   Delay: ${response.delay}ms`);
            }
        }
    }

    sendNotFoundResponse(res, request) {
        const response = {
            error: 'Not Found',
            message: `The requested endpoint ${request.method} ${request.pathname} was not found`,
            timestamp: new Date().toISOString()
        };

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(404);
        res.end(JSON.stringify(response, null, 2));

        if (this.config.debug) {
            console.log(`❌ No matching stub found for ${request.method} ${request.pathname}`);
        }
    }

    sendErrorResponse(res, req, error) {
        console.error('❌ Server error:', error.message);
        
        if (this.config.debug) {
            console.error(error.stack);
        }

        if (res && !res.headersSent) {
            const response = {
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            };

            if (this.config.debug) {
                response.stack = error.stack;
            }

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify(response, null, 2));
        }
    }
}