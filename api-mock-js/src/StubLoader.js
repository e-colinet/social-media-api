import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';

export class StubLoader {
    constructor(stubsDirectory) {
        this.stubsDirectory = stubsDirectory;
        this.debug = false;
    }

    setDebug(debug) {
        this.debug = debug;
    }

    loadStubs() {
        if (!existsSync(this.stubsDirectory)) {
            throw new Error(`Stubs directory not found: ${this.stubsDirectory}`);
        }

        const stubs = [];
        const files = readdirSync(this.stubsDirectory);

        for (const file of files) {
            if (extname(file) !== '.json') continue;

            const filePath = join(this.stubsDirectory, file);
            
            try {
                const content = readFileSync(filePath, 'utf8');
                const stub = JSON.parse(content);

                if (!this.isValidStub(stub)) {
                    throw new Error(`Invalid stub format in file: ${filePath}`);
                }

                // Ajouter des métadonnées
                stub._file = file;
                stub._filePath = filePath;
                if (stub.priority === undefined) {
                    stub.priority = 5;
                }

                stubs.push(stub);

                if (this.debug) {
                    console.log(`✅ Loaded stub: ${file}`);
                }
            } catch (error) {
                if (error instanceof SyntaxError) {
                    throw new Error(`Invalid JSON in file: ${filePath} - ${error.message}`);
                }
                throw error;
            }
        }

        // Trier par priorité (plus haute en premier, 0 = plus basse)
        stubs.sort((a, b) => {
            const priorityA = a.priority !== undefined ? a.priority : 5;
            const priorityB = b.priority !== undefined ? b.priority : 5;
            
            // Priorité 0 = plus basse, donc elle va à la fin
            if (priorityA === 0 && priorityB !== 0) return 1;
            if (priorityB === 0 && priorityA !== 0) return -1;
            if (priorityA === 0 && priorityB === 0) return 0;
            
            return priorityB - priorityA;
        });

        if (this.debug) {
            console.log(`📦 Loaded ${stubs.length} stubs from ${this.stubsDirectory}`);
            console.log('📋 Stub order by priority:');
            stubs.forEach((stub, index) => {
                const priority = stub.priority !== undefined ? stub.priority : 5;
                const method = stub.request.method;
                const url = stub.request.url || stub.request.urlPattern || 'pattern';
                console.log(`  ${index + 1}. ${stub._file} (priority: ${priority}) - ${method} ${url}`);
            });
        }

        return stubs;
    }

    isValidStub(stub) {
        // Vérification de la structure minimale WireMock
        if (!stub.request || !stub.response) {
            return false;
        }

        const request = stub.request;

        // Au minimum, il faut une méthode
        if (!request.method) {
            return false;
        }

        // Il faut au moins une des options d'URL
        const urlOptions = ['url', 'urlPattern', 'urlPath', 'urlPathPattern'];
        const hasUrlOption = urlOptions.some(option => request[option]);

        if (!hasUrlOption) {
            return false;
        }

        return true;
    }

    reloadStubs() {
        return this.loadStubs();
    }
}