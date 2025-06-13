<?php

class EnvLoader
{
    public static function load($filePath)
    {
        if (!file_exists($filePath)) {
            return false;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Ignorer les commentaires
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            // Parser les variables
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Supprimer les guillemets
                $value = trim($value, '"\'');
                
                // Définir la variable d'environnement si elle n'existe pas déjà
                if (!getenv($key)) {
                    putenv("$key=$value");
                }
            }
        }
        
        return true;
    }
}