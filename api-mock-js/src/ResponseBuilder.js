import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class ResponseBuilder {
    constructor(stubsDirectory) {
        this.stubsDirectory = stubsDirectory;
    }

    buildResponse(stub, request) {
        const response = stub.response;
        
        // Status code
        const status = response.status || 200;
        
        // Headers
        const headers = { ...response.headers };
        
        // Body
        let body = '';
        
        if (response.body) {
            body = this.processTemplate(response.body, request);
        } else if (response.jsonBody) {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
            body = JSON.stringify(this.processTemplateObject(response.jsonBody, request), null, 2);
        } else if (response.bodyFileName) {
            body = this.loadBodyFromFile(response.bodyFileName);
            body = this.processTemplate(body, request);
        }
        
        // Délai
        const delay = response.fixedDelayMilliseconds || 0;
        
        return {
            status,
            headers,
            body,
            delay
        };
    }

    processTemplate(template, request) {
        if (typeof template !== 'string') return template;

        return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
            return this.evaluateExpression(expression.trim(), request);
        });
    }

    processTemplateObject(obj, request) {
        if (typeof obj === 'string') {
            return this.processTemplate(obj, request);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.processTemplateObject(item, request));
        }
        
        if (obj && typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.processTemplateObject(value, request);
            }
            return result;
        }
        
        return obj;
    }

    evaluateExpression(expression, request) {
        // Variables temporelles
        if (expression === 'now') {
            return new Date().toISOString();
        }
        
        if (expression === 'now.timestamp') {
            return Math.floor(Date.now() / 1000).toString();
        }

        // Variables aléatoires
        if (expression.startsWith('randomValue')) {
            return this.generateRandomValue(expression);
        }

        // Variables de requête
        if (expression.startsWith('request.')) {
            return this.getRequestVariable(expression, request);
        }

        return `{{${expression}}}`;
    }

    generateRandomValue(expression) {
        // Parser l'expression randomValue
        const typeMatch = expression.match(/type=['"]([^'"]+)['"]/);
        const minMatch = expression.match(/min=(\d+)/);
        const maxMatch = expression.match(/max=(\d+)/);

        const type = typeMatch ? typeMatch[1] : 'UUID';
        const min = minMatch ? parseInt(minMatch[1]) : 1;
        const max = maxMatch ? parseInt(maxMatch[1]) : 100;

        switch (type.toUpperCase()) {
            case 'UUID':
                return this.generateUUID();
            case 'INT':
                return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
            case 'STRING':
                return this.generateRandomString(8);
            default:
                return this.generateUUID();
        }
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    getRequestVariable(expression, request) {
        const parts = expression.split('.');
        
        if (parts[1] === 'method') {
            return request.method;
        }
        
        if (parts[1] === 'url') {
            return request.url;
        }
        
        if (parts[1] === 'pathSegments') {
            const segments = request.pathname.split('/').filter(s => s);
            const index = parseInt(parts[2]);
            return segments[index] || '';
        }

        return '';
    }

    loadBodyFromFile(fileName) {
        const filePath = join(this.stubsDirectory, '__files', fileName);
        
        if (!existsSync(filePath)) {
            return `File not found: ${fileName}`;
        }
        
        try {
            return readFileSync(filePath, 'utf8');
        } catch (error) {
            return `Error reading file: ${error.message}`;
        }
    }
}