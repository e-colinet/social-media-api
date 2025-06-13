export class RequestMatcher {
    constructor() {
        this.debug = false;
    }

    setDebug(debug) {
        this.debug = debug;
    }

    matches(stub, request) {
        const stubRequest = stub.request;

        // Vérifier la méthode HTTP
        if (!this.matchMethod(stubRequest.method, request.method)) {
            return false;
        }

        // Vérifier l'URL
        if (!this.matchUrl(stubRequest, request.url, request.pathname)) {
            return false;
        }

        // Vérifier les headers
        if (!this.matchHeaders(stubRequest.headers, request.headers)) {
            return false;
        }

        // Vérifier les query parameters
        if (!this.matchQueryParameters(stubRequest.queryParameters, request.query)) {
            return false;
        }

        // Vérifier le body
        if (!this.matchBody(stubRequest.bodyPatterns, request.body)) {
            return false;
        }

        return true;
    }

    matchMethod(stubMethod, requestMethod) {
        if (stubMethod.toUpperCase() === 'ANY') {
            return true;
        }
        return stubMethod.toUpperCase() === requestMethod.toUpperCase();
    }

    matchUrl(stubRequest, requestUrl, requestPathname) {
        // URL exacte
        if (stubRequest.url) {
            return stubRequest.url === requestPathname;
        }

        // Pattern d'URL
        if (stubRequest.urlPattern) {
            const regex = new RegExp(stubRequest.urlPattern);
            return regex.test(requestPathname);
        }

        // Path exact (ignore query params)
        if (stubRequest.urlPath) {
            return stubRequest.urlPath === requestPathname;
        }

        // Pattern de path
        if (stubRequest.urlPathPattern) {
            const regex = new RegExp(stubRequest.urlPathPattern);
            return regex.test(requestPathname);
        }

        return true;
    }

    matchHeaders(stubHeaders, requestHeaders) {
        if (!stubHeaders) return true;

        for (const [headerName, headerValue] of Object.entries(stubHeaders)) {
            const requestHeaderValue = requestHeaders[headerName.toLowerCase()];

            if (!this.matchHeaderValue(headerValue, requestHeaderValue)) {
                return false;
            }
        }

        return true;
    }

    matchHeaderValue(stubValue, requestValue) {
        if (!requestValue) return false;

        // Correspondance exacte
        if (typeof stubValue === 'string') {
            return stubValue === requestValue;
        }

        // Matchers avancés
        if (typeof stubValue === 'object') {
            if (stubValue.equalTo) {
                return stubValue.equalTo === requestValue;
            }
            if (stubValue.matches) {
                const regex = new RegExp(stubValue.matches);
                return regex.test(requestValue);
            }
            if (stubValue.contains) {
                return requestValue.includes(stubValue.contains);
            }
        }

        return false;
    }

    matchQueryParameters(stubQuery, requestQuery) {
        if (!stubQuery) return true;

        for (const [paramName, paramValue] of Object.entries(stubQuery)) {
            const requestParamValue = requestQuery[paramName];

            if (!this.matchQueryParameterValue(paramValue, requestParamValue)) {
                return false;
            }
        }

        return true;
    }

    matchQueryParameterValue(stubValue, requestValue) {
        if (!requestValue) return false;

        // Correspondance exacte
        if (typeof stubValue === 'string') {
            return stubValue === requestValue;
        }

        // Matchers avancés
        if (typeof stubValue === 'object') {
            if (stubValue.equalTo) {
                return stubValue.equalTo === requestValue;
            }
            if (stubValue.matches) {
                const regex = new RegExp(stubValue.matches);
                return regex.test(requestValue);
            }
        }

        return false;
    }

    matchBody(bodyPatterns, requestBody) {
        if (!bodyPatterns || bodyPatterns.length === 0) return true;

        for (const pattern of bodyPatterns) {
            if (!this.matchBodyPattern(pattern, requestBody)) {
                return false;
            }
        }

        return true;
    }

    matchBodyPattern(pattern, requestBody) {
        if (!requestBody) return false;

        // Corps exact
        if (pattern.equalTo) {
            return pattern.equalTo === requestBody;
        }

        // JSON exact
        if (pattern.equalToJson) {
            try {
                const requestJson = JSON.parse(requestBody);
                return JSON.stringify(pattern.equalToJson) === JSON.stringify(requestJson);
            } catch {
                return false;
            }
        }

        // JSONPath (implémentation basique)
        if (pattern.matchesJsonPath) {
            try {
                const requestJson = JSON.parse(requestBody);
                return this.evaluateJsonPath(pattern.matchesJsonPath, requestJson);
            } catch {
                return false;
            }
        }

        // Contient
        if (pattern.contains) {
            return requestBody.includes(pattern.contains);
        }

        // Pattern regex
        if (pattern.matches) {
            const regex = new RegExp(pattern.matches);
            return regex.test(requestBody);
        }

        return false;
    }

    evaluateJsonPath(path, obj) {
        // Implémentation basique de JSONPath
        // Supporte uniquement $.field et $.object.field
        if (!path.startsWith('$.')) return false;

        const parts = path.substring(2).split('.');
        let current = obj;

        for (const part of parts) {
            if (current === null || current === undefined) return false;
            if (typeof current !== 'object') return false;
            if (!(part in current)) return false;
            current = current[part];
        }

        return current !== null && current !== undefined;
    }
}