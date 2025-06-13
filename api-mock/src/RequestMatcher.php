<?php

class RequestMatcher
{
    public function findMatch($request, $stubs)
    {
        foreach ($stubs as $stub) {
            if ($this->matchesStub($request, $stub)) {
                return $stub;
            }
        }
        return null;
    }

    private function matchesStub($request, $stub)
    {
        $stubRequest = $stub['request'];
        
        // Vérification de la méthode HTTP
        if (!$this->matchMethod($request['method'], $stubRequest['method'])) {
            return false;
        }
        
        // Vérification de l'URL
        if (!$this->matchUrl($request['url'], $stubRequest)) {
            return false;
        }
        
        // Vérification des headers
        if (isset($stubRequest['headers']) && !$this->matchHeaders($request['headers'], $stubRequest['headers'])) {
            return false;
        }
        
        // Vérification des query parameters
        if (isset($stubRequest['queryParameters']) && !$this->matchQueryParameters($request['query'], $stubRequest['queryParameters'])) {
            return false;
        }
        
        // Vérification du body
        if (isset($stubRequest['bodyPatterns']) && !$this->matchBodyPatterns($request, $stubRequest['bodyPatterns'])) {
            return false;
        }
        
        return true;
    }

    private function matchMethod($requestMethod, $stubMethod)
    {
        return strtoupper($requestMethod) === strtoupper($stubMethod);
    }

    private function matchUrl($requestUrl, $stubRequest)
    {
        // URL exacte
        if (isset($stubRequest['url'])) {
            return $this->normalizeUrl($requestUrl) === $this->normalizeUrl($stubRequest['url']);
        }
        
        // Pattern d'URL (regex)
        if (isset($stubRequest['urlPattern'])) {
            return preg_match('#' . $stubRequest['urlPattern'] . '#', $requestUrl);
        }
        
        // Path matching
        if (isset($stubRequest['urlPath'])) {
            return $this->normalizeUrl($requestUrl) === $this->normalizeUrl($stubRequest['urlPath']);
        }
        
        // Path pattern
        if (isset($stubRequest['urlPathPattern'])) {
            return preg_match('#' . $stubRequest['urlPathPattern'] . '#', $requestUrl);
        }
        
        return false;
    }

    private function normalizeUrl($url)
    {
        // Suppression des slashes en début et fin
        return trim($url, '/');
    }

    private function matchHeaders($requestHeaders, $stubHeaders)
    {
        foreach ($stubHeaders as $headerName => $headerValue) {
            $requestHeaderValue = $requestHeaders[strtolower($headerName)] ?? null;
            
            if (is_array($headerValue)) {
                // Pattern matching pour headers
                if (isset($headerValue['equalTo'])) {
                    if ($requestHeaderValue !== $headerValue['equalTo']) {
                        return false;
                    }
                } elseif (isset($headerValue['matches'])) {
                    if (!preg_match('#' . $headerValue['matches'] . '#', $requestHeaderValue)) {
                        return false;
                    }
                } elseif (isset($headerValue['contains'])) {
                    if (strpos($requestHeaderValue, $headerValue['contains']) === false) {
                        return false;
                    }
                }
            } else {
                // Comparaison directe
                if ($requestHeaderValue !== $headerValue) {
                    return false;
                }
            }
        }
        
        return true;
    }

    private function matchQueryParameters($requestQuery, $stubQuery)
    {
        foreach ($stubQuery as $paramName => $paramValue) {
            $requestParamValue = $requestQuery[$paramName] ?? null;
            
            if (is_array($paramValue)) {
                // Pattern matching pour query params
                if (isset($paramValue['equalTo'])) {
                    if ($requestParamValue !== $paramValue['equalTo']) {
                        return false;
                    }
                } elseif (isset($paramValue['matches'])) {
                    if (!preg_match('#' . $paramValue['matches'] . '#', $requestParamValue)) {
                        return false;
                    }
                }
            } else {
                // Comparaison directe
                if ($requestParamValue !== $paramValue) {
                    return false;
                }
            }
        }
        
        return true;
    }

    private function matchBodyPatterns($request, $bodyPatterns)
    {
        $requestBody = $request['body'];
        $requestBodyJson = $request['bodyPatterns'];
        
        foreach ($bodyPatterns as $pattern) {
            if (isset($pattern['equalTo'])) {
                if ($requestBody !== $pattern['equalTo']) {
                    return false;
                }
            } elseif (isset($pattern['equalToJson'])) {
                if (json_encode($requestBodyJson) !== json_encode($pattern['equalToJson'])) {
                    return false;
                }
            } elseif (isset($pattern['matchesJsonPath'])) {
                if (!$this->matchJsonPath($requestBodyJson, $pattern['matchesJsonPath'])) {
                    return false;
                }
            } elseif (isset($pattern['contains'])) {
                if (strpos($requestBody, $pattern['contains']) === false) {
                    return false;
                }
            } elseif (isset($pattern['matches'])) {
                if (!preg_match('#' . $pattern['matches'] . '#', $requestBody)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    private function matchJsonPath($json, $jsonPath)
    {
        // Implémentation basique de JSONPath
        // Pour une implémentation complète, utiliser une librairie dédiée
        
        if (strpos($jsonPath, '$.') === 0) {
            $path = substr($jsonPath, 2);
            $keys = explode('.', $path);
            
            $current = $json;
            foreach ($keys as $key) {
                if (!isset($current[$key])) {
                    return false;
                }
                $current = $current[$key];
            }
            return true;
        }
        
        return false;
    }
}