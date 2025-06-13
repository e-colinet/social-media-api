<?php

class ResponseBuilder
{
    public function sendResponse($responseConfig, $request)
    {
        // Délai de réponse si configuré
        if (isset($responseConfig['fixedDelayMilliseconds'])) {
            usleep($responseConfig['fixedDelayMilliseconds'] * 1000);
        }
        
        // Code de statut HTTP
        $statusCode = $responseConfig['status'] ?? 200;
        http_response_code($statusCode);
        
        // Headers de réponse
        if (isset($responseConfig['headers'])) {
            foreach ($responseConfig['headers'] as $headerName => $headerValue) {
                header("{$headerName}: {$headerValue}");
            }
        }
        
        // Content-Type par défaut
        if (!isset($responseConfig['headers']['Content-Type'])) {
            header('Content-Type: application/json');
        }
        
        // Corps de la réponse
        $body = $this->buildResponseBody($responseConfig, $request);
        
        echo $body;
    }

    private function buildResponseBody($responseConfig, $request)
    {
        // Corps de réponse direct
        if (isset($responseConfig['body'])) {
            return $this->processTemplate($responseConfig['body'], $request);
        }
        
        // Corps JSON
        if (isset($responseConfig['jsonBody'])) {
            $jsonBody = $this->processJsonTemplate($responseConfig['jsonBody'], $request);
            return json_encode($jsonBody, JSON_PRETTY_PRINT);
        }
        
        // Fichier de réponse
        if (isset($responseConfig['bodyFileName'])) {
            $filePath = dirname(__DIR__) . '/stubs/__files/' . $responseConfig['bodyFileName'];
            if (file_exists($filePath)) {
                $content = file_get_contents($filePath);
                return $this->processTemplate($content, $request);
            }
        }
        
        // Réponse vide par défaut
        return '';
    }

    private function processTemplate($template, $request)
    {
        // Remplacement des variables de template
        $template = str_replace('{{request.url}}', $request['url'], $template);
        $template = str_replace('{{request.method}}', $request['method'], $template);
        
        // Timestamp actuel
        $template = str_replace('{{now}}', date('c'), $template);
        $template = str_replace('{{now.timestamp}}', time(), $template);
        
        // UUID aléatoire
        $template = preg_replace_callback('/\{\{randomValue\s+type=\'UUID\'\}\}/', function() {
            return $this->generateUuid();
        }, $template);
        
        // Valeurs aléatoiresnumériques
        $template = preg_replace_callback('/\{\{randomValue\s+type=\'INT\'\s+min=(\d+)\s+max=(\d+)\}\}/', function($matches) {
            return rand($matches[1], $matches[2]);
        }, $template);
        
        // Extraction de paramètres d'URL
        $template = preg_replace_callback('/\{\{request\.pathSegments\.(\d+)\}\}/', function($matches) use ($request) {
            $segments = explode('/', trim($request['url'], '/'));
            $index = (int)$matches[1];
            return $segments[$index] ?? '';
        }, $template);
        
        return $template;
    }

    private function processJsonTemplate($jsonTemplate, $request)
    {
        // Conversion en JSON puis traitement du template
        $jsonString = json_encode($jsonTemplate);
        $processedString = $this->processTemplate($jsonString, $request);
        return json_decode($processedString, true);
    }

    private function generateUuid()
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}