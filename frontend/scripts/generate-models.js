#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const OPENAPI_FILE = '../../back/openapi.yaml';
const MODELS_DIR = './src/models';
const API_DIR = './src/api';

// Vérifier si on est en mode check
const isCheckMode = process.argv.includes('--check');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadOpenApiSpec() {
  try {
    const openApiPath = path.resolve(__dirname, OPENAPI_FILE);
    const fileContents = fs.readFileSync(openApiPath, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    console.error('Erreur lors du chargement du fichier OpenAPI:', error.message);
    process.exit(1);
  }
}

function generateTypeScriptInterface(schemaName, schema) {
  let interfaceCode = `export interface ${schemaName} {\n`;
  
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isRequired = schema.required && schema.required.includes(propName);
      const optional = isRequired ? '' : '?';
      const type = getTypeScriptType(propSchema);
      
      interfaceCode += `  ${propName}${optional}: ${type};\n`;
    }
  }
  
  interfaceCode += '}\n\n';
  return interfaceCode;
}

function getTypeScriptType(schema) {
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
    const itemType = getTypeScriptType(schema.items);
    return `${itemType}[]`;
  }
  
  if (schema.type === 'object') {
    if (schema.additionalProperties) {
      const valueType = getTypeScriptType(schema.additionalProperties);
      return `{ [key: string]: ${valueType} }`;
    }
    return 'any';
  }
  
  if (schema.nullable) {
    const baseType = getTypeScriptType({ ...schema, nullable: false });
    return `${baseType} | null`;
  }
  
  return 'any';
}

function generateModels(openApiSpec) {
  ensureDirectoryExists(MODELS_DIR);
  
  let indexContent = '// Modèles générés automatiquement à partir du fichier OpenAPI\n\n';
  
  if (openApiSpec.components && openApiSpec.components.schemas) {
    for (const [schemaName, schema] of Object.entries(openApiSpec.components.schemas)) {
      const interfaceCode = generateTypeScriptInterface(schemaName, schema);
      
      // Écrire le fichier du modèle
      const modelFile = path.join(MODELS_DIR, `${schemaName}.js`);
      const modelContent = `// Modèle généré automatiquement\n\n${interfaceCode}`;
      
      fs.writeFileSync(modelFile, modelContent);
      
      // Ajouter à l'index
      indexContent += `export * from './${schemaName}.js';\n`;
    }
  }
  
  // Écrire le fichier index
  fs.writeFileSync(path.join(MODELS_DIR, 'index.js'), indexContent);
  
  console.log('✅ Modèles générés avec succès dans', MODELS_DIR);
}

function generateApiClient(openApiSpec) {
  ensureDirectoryExists(API_DIR);
  
  const baseUrl = openApiSpec.servers && openApiSpec.servers[0] 
    ? openApiSpec.servers[0].url 
    : 'http://localhost:8000/api';
  
  let apiClientCode = `// Client API généré automatiquement
  
class ApiClient {
  constructor(baseUrl = '${baseUrl}') {
    this.baseUrl = baseUrl;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

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
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur API');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

`;

  // Générer les méthodes pour chaque endpoint
  if (openApiSpec.paths) {
    for (const [path, pathItem] of Object.entries(openApiSpec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          const methodName = generateMethodName(operation.operationId || `${method}${path}`);
          const methodCode = generateApiMethod(path, method, operation);
          apiClientCode += methodCode + '\n';
        }
      }
    }
  }

  apiClientCode += `}

export default ApiClient;
export const apiClient = new ApiClient();
`;

  fs.writeFileSync(path.join(API_DIR, 'client.js'), apiClientCode);
  
  console.log('✅ Client API généré avec succès dans', API_DIR);
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
  
  let methodCode = `  async ${methodName}(${params.join(', ')}) {\n`;
  
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
    console.log('❌ Le répertoire des modèles n\'existe pas. Exécutez npm run generate-models');
    return false;
  }
  
  // Vérifier si tous les schémas ont des modèles correspondants
  if (openApiSpec.components && openApiSpec.components.schemas) {
    for (const schemaName of Object.keys(openApiSpec.components.schemas)) {
      const modelFile = path.join(modelsPath, `${schemaName}.js`);
      if (!fs.existsSync(modelFile)) {
        console.log(`❌ Modèle manquant: ${schemaName}.js`);
        return false;
      }
    }
  }
  
  console.log('✅ Tous les modèles sont synchronisés avec le fichier OpenAPI');
  return true;
}

function main() {
  if (isCheckMode) {
    checkModelsSync();
  } else {
    const openApiSpec = loadOpenApiSpec();
    generateModels(openApiSpec);
    generateApiClient(openApiSpec);
    console.log('\n🎉 Génération terminée avec succès!');
    console.log('📁 Modèles: ./src/models/');
    console.log('📁 Client API: ./src/api/');
  }
}

main();