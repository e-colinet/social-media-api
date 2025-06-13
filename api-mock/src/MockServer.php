<?php

class MockServer
{
    private $config;
    private $stubLoader;
    private $requestMatcher;
    private $responseBuilder;

    public function __construct($config)
    {
        $this->config = $config;
        $this->stubLoader = new StubLoader($config['stubs_directory']);
        $this->requestMatcher = new RequestMatcher();
        $this->responseBuilder = new ResponseBuilder();
    }

    public function start()
    {
        // Headers CORS si activé
        if ($this->config['cors_enabled']) {
            $this->setCorsHeaders();
        }

        // Gestion des requêtes OPTIONS pour CORS
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        try {
            // Chargement des stubs
            $stubs = $this->stubLoader->loadStubs();
            
            // Récupération des informations de la requête
            $request = $this->parseRequest();
            
            // Debug
            if ($this->config['debug']) {
                error_log("Mock Server - Request: " . json_encode($request));
            }
            
            // Recherche du stub correspondant
            $matchedStub = $this->requestMatcher->findMatch($request, $stubs);
            
            if ($matchedStub) {
                // Construction et envoi de la réponse
                $this->responseBuilder->sendResponse($matchedStub['response'], $request);
            } else {
                // Aucun stub trouvé
                $this->sendNotFoundResponse($request);
            }
            
        } catch (Exception $e) {
            $this->sendErrorResponse($e);
        }
    }

    private function setCorsHeaders()
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');
    }

    private function parseRequest()
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $query = parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY);
        
        // Suppression du préfixe /api si présent
        $uri = preg_replace('#^/api#', '', $uri);
        
        $request = [
            'method' => $_SERVER['REQUEST_METHOD'],
            'url' => $uri,
            'query' => [],
            'headers' => $this->getAllHeaders(),
            'body' => file_get_contents('php://input'),
            'bodyPatterns' => []
        ];

        // Parse query parameters
        if ($query) {
            parse_str($query, $request['query']);
        }

        // Parse JSON body
        if ($request['body'] && $this->isJsonContent()) {
            $request['bodyPatterns'] = json_decode($request['body'], true);
        }

        return $request;
    }

    private function getAllHeaders()
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace('HTTP_', '', $key);
                $header = str_replace('_', '-', $header);
                $header = strtolower($header);
                $headers[$header] = $value;
            }
        }
        
        // Ajout des headers spéciaux
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['content-type'] = $_SERVER['CONTENT_TYPE'];
        }
        if (isset($_SERVER['CONTENT_LENGTH'])) {
            $headers['content-length'] = $_SERVER['CONTENT_LENGTH'];
        }
        
        return $headers;
    }

    private function isJsonContent()
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        return strpos($contentType, 'application/json') !== false;
    }

    private function sendNotFoundResponse($request)
    {
        http_response_code(404);
        header('Content-Type: application/json');
        
        $response = [
            'error' => 'No stub found',
            'message' => "No stub mapping found for {$request['method']} {$request['url']}",
            'request' => $request
        ];
        
        echo json_encode($response, JSON_PRETTY_PRINT);
    }

    private function sendErrorResponse($exception)
    {
        http_response_code(500);
        header('Content-Type: application/json');
        
        $response = [
            'error' => 'Internal server error',
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine()
        ];
        
        if ($this->config['debug']) {
            $response['trace'] = $exception->getTraceAsString();
        }
        
        echo json_encode($response, JSON_PRETTY_PRINT);
    }
}