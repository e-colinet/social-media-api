<?php

class StubLoader
{
    private $stubsDirectory;

    public function __construct($stubsDirectory)
    {
        $this->stubsDirectory = $stubsDirectory;
    }

    public function loadStubs()
    {
        $stubs = [];
        
        if (!is_dir($this->stubsDirectory)) {
            throw new Exception("Stubs directory not found: {$this->stubsDirectory}");
        }

        $files = glob($this->stubsDirectory . '/*.json');
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $stub = json_decode($content, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Invalid JSON in stub file: {$file} - " . json_last_error_msg());
            }
            
            // Validation du format WireMock
            if (!$this->isValidStub($stub)) {
                throw new Exception("Invalid stub format in file: {$file}");
            }
            
            $stub['_file'] = basename($file);
            $stubs[] = $stub;
        }
        
        // Tri par priorité (plus haute en premier)
        usort($stubs, function($a, $b) {
            $priorityA = $a['priority'] ?? 5;
            $priorityB = $b['priority'] ?? 5;
            return $priorityB - $priorityA; // Ordre décroissant
        });
        
        return $stubs;
    }

    private function isValidStub($stub)
    {
        // Vérification de la structure minimale WireMock
        if (!isset($stub['request']) || !isset($stub['response'])) {
            return false;
        }
        
        $request = $stub['request'];
        
        // Au minimum, il faut une méthode
        if (!isset($request['method'])) {
            return false;
        }
        
        // Il faut au moins une des options d'URL
        $urlOptions = ['url', 'urlPattern', 'urlPath', 'urlPathPattern'];
        $hasUrlOption = false;
        foreach ($urlOptions as $option) {
            if (isset($request[$option])) {
                $hasUrlOption = true;
                break;
            }
        }
        
        if (!$hasUrlOption) {
            return false;
        }
        
        return true;
    }

    public function reloadStubs()
    {
        return $this->loadStubs();
    }

    public function getStubsDirectory()
    {
        return $this->stubsDirectory;
    }

    public function setStubsDirectory($directory)
    {
        $this->stubsDirectory = $directory;
    }
}