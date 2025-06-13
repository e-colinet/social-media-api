import { readFileSync, existsSync } from 'fs';

export class EnvLoader {
    static load(filePath) {
        if (!existsSync(filePath)) {
            return false;
        }

        try {
            const content = readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Ignorer les commentaires et lignes vides
                if (!trimmedLine || trimmedLine.startsWith('#')) {
                    continue;
                }

                // Parser les variables
                const equalIndex = trimmedLine.indexOf('=');
                if (equalIndex !== -1) {
                    const key = trimmedLine.substring(0, equalIndex).trim();
                    let value = trimmedLine.substring(equalIndex + 1).trim();
                    
                    // Supprimer les guillemets
                    value = value.replace(/^["']|["']$/g, '');
                    
                    // Définir la variable d'environnement si elle n'existe pas déjà
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error loading .env file:', error.message);
            return false;
        }
    }
}