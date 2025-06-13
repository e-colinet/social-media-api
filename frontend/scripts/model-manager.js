#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAPI_FILE = '../../back/openapi.yaml';
const MODELS_DIR = './src/models';
const API_DIR = './src/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadOpenApiSpec() {
  try {
    const openApiPath = path.resolve(__dirname, OPENAPI_FILE);
    if (!fs.existsSync(openApiPath)) {
      log(`❌ Fichier OpenAPI non trouvé: ${openApiPath}`, 'red');
      process.exit(1);
    }
    const fileContents = fs.readFileSync(openApiPath, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    log(`❌ Erreur lors du chargement du fichier OpenAPI: ${error.message}`, 'red');
    process.exit(1);
  }
}

function generateJavaScriptClass(schemaName, schema) {
  let classCode = `// Modèle généré automatiquement à partir du fichier OpenAPI\n\n`;
  
  // Générer la classe JavaScript
  classCode += `export class ${schemaName} {\n`;
  classCode += `  constructor(data = {}) {\n`;
  
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const defaultValue = getDefaultValue(propSchema);
      classCode += `    this.${propName} = data.${propName} ?? ${defaultValue};\n`;
    }
  }
  
  classCode += `  }\n\n`;
  
  // Méthode de validation
  classCode += `  validate() {\n`;
  classCode += `    const errors = [];\n`;
  
  if (schema.required) {
    for (const requiredField of schema.required) {
      classCode += `    if (this.${requiredField} === undefined || this.${requiredField} === null) {\n`;
      classCode += `      errors.push('${requiredField} is required');\n`;
      classCode += `    }\n`;
    }
  }
  
  classCode += `    return errors;\n`;
  classCode += `  }\n\n`;
  
  // Méthode toJSON
  classCode += `  toJSON() {\n`;
  classCode += `    return {\n`;
  
  if (schema.properties) {
    for (const propName of Object.keys(schema.properties)) {
      classCode += `      ${propName}: this.${propName},\n`;
    }
  }
  
  classCode += `    };\n`;
  classCode += `  }\n\n`;
  
  // Méthode statique fromJSON
  classCode += `  static fromJSON(json) {\n`;
  classCode += `    return new ${schemaName}(json);\n`;
  classCode += `  }\n`;
  
  classCode += `}\n\n`;
  
  // Ajouter les types TypeScript en commentaire pour l'IDE
  classCode += `/**\n`;
  classCode += ` * @typedef {Object} ${schemaName}Data\n`;
  
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isRequired = schema.required && schema.required.includes(propName);
      const optional = isRequired ? '' : '?';
      const type = getJSDocType(propSchema);
      classCode += ` * @property {${type}} ${propName}${optional}\n`;
    }
  }
  
  classCode += ` */\n`;
  
  return classCode;
}

function getDefaultValue(schema) {
  if (schema.type === 'string') {
    return schema.enum ? `'${schema.enum[0]}'` : "''";
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    return '0';
  }
  if (schema.type === 'boolean') {
    return 'false';
  }
  if (schema.type === 'array') {
    return '[]';
  }
  if (schema.type === 'object') {
    return '{}';
  }
  return 'null';
}

function getJSDocType(schema) {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return refName;
  }
  
  if (schema.type === 'string') {
    if (schema.enum) {
      return schema.enum.map(val => `'${val}'`).join(' | ');
    }
    return 'string';
  }
  
  if (schema.type === 'number' || schema.type === 'integer') {
    return 'number';
  }
  
  if (schema.type === 'boolean') {
    return 'boolean';
  }
  
  if (schema.type === 'array') {
    const itemType = getJSDocType(schema.items);
    return `Array<${itemType}>`;
  }
  
  if (schema.type === 'object') {
    return 'Object';
  }
  
  if (schema.nullable) {
    const baseType = getJSDocType({ ...schema, nullable: false });
    return `${baseType} | null`;
  }
  
  return 'any';
}

function generateModels(openApiSpec) {
  ensureDirectoryExists(MODELS_DIR);
  
  let indexContent = '// Modèles générés automatiquement à partir du fichier OpenAPI\n\n';
  let generatedModels = [];
  
  if (openApiSpec.components && openApiSpec.components.schemas) {
    for (const [schemaName, schema] of Object.entries(openApiSpec.components.schemas)) {
      const classCode = generateJavaScriptClass(schemaName, schema);
      
      // Écrire le fichier du modèle
      const modelFile = path.join(MODELS_DIR, `${schemaName}.js`);
      fs.writeFileSync(modelFile, classCode);
      
      // Ajouter à l'index
      indexContent += `export { ${schemaName} } from './${schemaName}.js';\n`;
      generatedModels.push(schemaName);
    }
  }
  
  // Écrire le fichier index
  fs.writeFileSync(path.join(MODELS_DIR, 'index.js'), indexContent);
  
  log(`✅ ${generatedModels.length} modèles générés avec succès dans ${MODELS_DIR}`, 'green');
  generatedModels.forEach(model => log(`   - ${model}`, 'cyan'));
  
  return generatedModels;
}

function generateApiClient(openApiSpec) {
  ensureDirectoryExists(API_DIR);
  
  // Utiliser le serveur mock par défaut
  const baseUrl = 'http://localhost:8090';
  
  let apiClientCode = `// Client API généré automatiquement à partir du fichier OpenAPI

/**
 * Client API pour l'API Social Media
 */
export class ApiClient {
  constructor(baseUrl = '${baseUrl}') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  /**
   * Définir le token d'authentification
   * @param {string} token - Token Bearer
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Supprimer le token d'authentification
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Effectuer une requête HTTP
   * @param {string} endpoint - Endpoint de l'API
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Réponse de l'API
   */
  async request(endpoint, options = {}) {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = \`Bearer \${this.token}\`;
    }

    const config = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'Erreur API', errorData);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Erreur réseau:', error);
      throw new ApiError(0, 'Erreur de connexion', { originalError: error.message });
    }
  }

`;

  let generatedMethods = [];

  // Générer les méthodes pour chaque endpoint
  if (openApiSpec.paths) {
    for (const [path, pathItem] of Object.entries(openApiSpec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          const methodName = generateMethodName(operation.operationId || `${method}${path}`);
          const methodCode = generateApiMethod(path, method, operation);
          apiClientCode += methodCode + '\n';
          generatedMethods.push(methodName);
        }
      }
    }
  }

  apiClientCode += `}

/**
 * Classe d'erreur API personnalisée
 */
export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Instance par défaut du client API
export const apiClient = new ApiClient();
`;

  fs.writeFileSync(path.join(API_DIR, 'client.js'), apiClientCode);
  
  log(`✅ Client API généré avec ${generatedMethods.length} méthodes dans ${API_DIR}`, 'green');
  generatedMethods.forEach(method => log(`   - ${method}()`, 'cyan'));
  
  return generatedMethods;
}

function generateMethodName(operationId) {
  // Convertir l'operationId en camelCase
  return operationId
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map((word, index) => 
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

function generateApiMethod(path, method, operation) {
  const methodName = generateMethodName(operation.operationId || `${method}${path}`);
  const hasPathParams = path.includes('{');
  const hasBody = ['post', 'put', 'patch'].includes(method);
  
  let params = [];
  let pathWithParams = path;
  
  // Gérer les paramètres de chemin
  if (hasPathParams) {
    const pathParams = path.match(/\{([^}]+)\}/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.slice(1, -1);
        params.push(paramName);
        pathWithParams = pathWithParams.replace(param, `\${${paramName}}`);
      });
    }
  }
  
  // Gérer les paramètres de requête
  if (operation.parameters) {
    const queryParams = operation.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      params.push('queryParams = {}');
    }
  }
  
  // Gérer le body
  if (hasBody) {
    params.push('data');
  }
  
  let methodCode = `  /**\n`;
  methodCode += `   * ${operation.summary || `${method.toUpperCase()} ${path}`}\n`;
  if (operation.description) {
    methodCode += `   * ${operation.description}\n`;
  }
  
  // Documenter les paramètres
  if (hasPathParams) {
    const pathParams = path.match(/\\{([^}]+)\\}/g);
    if (pathParams) {
      pathParams.forEach(param => {
        const paramName = param.slice(1, -1);
        methodCode += `   * @param {string|number} ${paramName} - Paramètre de chemin\n`;
      });
    }
  }
  
  if (operation.parameters && operation.parameters.some(p => p.in === 'query')) {
    methodCode += `   * @param {Object} queryParams - Paramètres de requête\n`;
  }
  
  if (hasBody) {
    methodCode += `   * @param {Object} data - Données à envoyer\n`;
  }
  
  methodCode += `   * @returns {Promise<Object>} Réponse de l'API\n`;
  methodCode += `   */\n`;
  methodCode += `  async ${methodName}(${params.join(', ')}) {\n`;
  
  // Construire l'URL avec les paramètres de requête
  let urlConstruction = `'${pathWithParams}'`;
  if (operation.parameters && operation.parameters.some(p => p.in === 'query')) {
    methodCode += `    const queryString = new URLSearchParams(queryParams).toString();\n`;
    methodCode += `    const endpoint = queryString ? \`${pathWithParams}?\${queryString}\` : '${pathWithParams}';\n`;
    urlConstruction = 'endpoint';
  }
  
  methodCode += `    return this.request(${urlConstruction}, {\n`;
  methodCode += `      method: '${method.toUpperCase()}'`;
  
  if (hasBody) {
    methodCode += `,\n      body: data`;
  }
  
  methodCode += `\n    });\n`;
  methodCode += `  }\n`;
  
  return methodCode;
}

function checkModelsSync() {
  const openApiSpec = loadOpenApiSpec();
  const modelsPath = path.resolve(__dirname, '..', MODELS_DIR);
  
  if (!fs.existsSync(modelsPath)) {
    log('❌ Le répertoire des modèles n\'existe pas. Exécutez npm run generate-models', 'red');
    return false;
  }
  
  let allSynced = true;
  let missingModels = [];
  let extraModels = [];
  
  // Vérifier si tous les schémas ont des modèles correspondants
  if (openApiSpec.components && openApiSpec.components.schemas) {
    for (const schemaName of Object.keys(openApiSpec.components.schemas)) {
      const modelFile = path.join(modelsPath, `${schemaName}.js`);
      if (!fs.existsSync(modelFile)) {
        missingModels.push(schemaName);
        allSynced = false;
      }
    }
  }
  
  // Vérifier les modèles en trop
  const existingModels = fs.readdirSync(modelsPath)
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .map(file => file.replace('.js', ''));
  
  const expectedModels = openApiSpec.components && openApiSpec.components.schemas 
    ? Object.keys(openApiSpec.components.schemas) 
    : [];
  
  extraModels = existingModels.filter(model => !expectedModels.includes(model));
  
  if (missingModels.length > 0) {
    log('❌ Modèles manquants:', 'red');
    missingModels.forEach(model => log(`   - ${model}.js`, 'yellow'));
  }
  
  if (extraModels.length > 0) {
    log('⚠️  Modèles en trop (non définis dans OpenAPI):', 'yellow');
    extraModels.forEach(model => log(`   - ${model}.js`, 'yellow'));
  }
  
  if (allSynced && extraModels.length === 0) {
    log('✅ Tous les modèles sont synchronisés avec le fichier OpenAPI', 'green');
    log(`📊 ${expectedModels.length} modèles trouvés`, 'cyan');
  }
  
  return allSynced && extraModels.length === 0;
}

function showStats() {
  const openApiSpec = loadOpenApiSpec();
  
  log('📊 Statistiques du fichier OpenAPI:', 'bright');
  log(`   Version: ${openApiSpec.info.version}`, 'cyan');
  log(`   Titre: ${openApiSpec.info.title}`, 'cyan');
  
  if (openApiSpec.servers) {
    log(`   Serveurs: ${openApiSpec.servers.length}`, 'cyan');
    openApiSpec.servers.forEach((server, index) => {
      log(`     ${index + 1}. ${server.url} (${server.description || 'Sans description'})`, 'blue');
    });
  }
  
  if (openApiSpec.paths) {
    const pathCount = Object.keys(openApiSpec.paths).length;
    let methodCount = 0;
    
    for (const pathItem of Object.values(openApiSpec.paths)) {
      methodCount += Object.keys(pathItem).filter(key => 
        ['get', 'post', 'put', 'delete', 'patch'].includes(key)
      ).length;
    }
    
    log(`   Endpoints: ${pathCount}`, 'cyan');
    log(`   Méthodes: ${methodCount}`, 'cyan');
  }
  
  if (openApiSpec.components && openApiSpec.components.schemas) {
    const schemaCount = Object.keys(openApiSpec.components.schemas).length;
    log(`   Schémas: ${schemaCount}`, 'cyan');
  }
}

function showHelp() {
  log('🛠️  Gestionnaire de modèles OpenAPI', 'bright');
  log('');
  log('Usage:', 'yellow');
  log('  node scripts/model-manager.js [command]', 'cyan');
  log('');
  log('Commandes disponibles:', 'yellow');
  log('  generate    Générer les modèles et le client API', 'cyan');
  log('  check       Vérifier la synchronisation des modèles', 'cyan');
  log('  stats       Afficher les statistiques du fichier OpenAPI', 'cyan');
  log('  clean       Supprimer tous les modèles générés', 'cyan');
  log('  help        Afficher cette aide', 'cyan');
  log('');
  log('Exemples:', 'yellow');
  log('  npm run generate-models', 'green');
  log('  npm run check-models', 'green');
  log('  node scripts/model-manager.js stats', 'green');
}

function cleanModels() {
  const modelsPath = path.resolve(__dirname, '..', MODELS_DIR);
  const apiPath = path.resolve(__dirname, '..', API_DIR);
  
  if (fs.existsSync(modelsPath)) {
    fs.rmSync(modelsPath, { recursive: true, force: true });
    log('🗑️  Répertoire des modèles supprimé', 'yellow');
  }
  
  if (fs.existsSync(apiPath)) {
    fs.rmSync(apiPath, { recursive: true, force: true });
    log('🗑️  Répertoire de l\'API supprimé', 'yellow');
  }
  
  log('✅ Nettoyage terminé', 'green');
}

function main() {
  const command = process.argv[2] || 'generate';
  
  switch (command) {
    case 'generate':
      const openApiSpec = loadOpenApiSpec();
      const models = generateModels(openApiSpec);
      const methods = generateApiClient(openApiSpec);
      log('');
      log('🎉 Génération terminée avec succès!', 'green');
      log(`📁 Modèles: ${MODELS_DIR}/`, 'cyan');
      log(`📁 Client API: ${API_DIR}/`, 'cyan');
      break;
      
    case 'check':
      checkModelsSync();
      break;
      
    case 'stats':
      showStats();
      break;
      
    case 'clean':
      cleanModels();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      log(`❌ Commande inconnue: ${command}`, 'red');
      log('Utilisez "help" pour voir les commandes disponibles', 'yellow');
      process.exit(1);
  }
}

main();