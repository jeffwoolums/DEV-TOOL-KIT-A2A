const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://plvwmhcjldivomlejnxz.supabase.co',
  process.env.SUPABASE_ANON_KEY || ''
);

app.use(cors());
app.use(express.json());

// ============================================
// AGENT-TO-AGENT COMMUNICATION SYSTEM
// ============================================

class TaskQueue {
  constructor() {
    this.tasks = new Map(); // taskId -> task object
    this.workflows = new Map(); // workflowId -> workflow state
  }

  createTask(taskData) {
    const taskId = uuidv4();
    const task = {
      id: taskId,
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      result: null,
      subtasks: []
    };
    this.tasks.set(taskId, task);
    return task;
  }

  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates);
    }
    return task;
  }

  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  createWorkflow(workflowData) {
    const workflowId = uuidv4();
    const workflow = {
      id: workflowId,
      ...workflowData,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      tasks: [],
      results: {}
    };
    this.workflows.set(workflowId, workflow);
    return workflow;
  }

  getWorkflow(workflowId) {
    return this.workflows.get(workflowId);
  }

  updateWorkflow(workflowId, updates) {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      Object.assign(workflow, updates);
    }
    return workflow;
  }
}

// Global task queue instance
const taskQueue = new TaskQueue();

// Agent Communication Protocol
class Agent {
  constructor(name, role, capabilities) {
    this.name = name;
    this.role = role;
    this.capabilities = capabilities;
    this.id = uuidv4();
  }

  async executeTask(task, context = {}) {
    console.log(`[${this.name}] Executing task: ${task.type}`);

    // Update task status
    taskQueue.updateTask(task.id, {
      status: 'in_progress',
      assignedTo: this.name,
      startedAt: new Date().toISOString()
    });

    try {
      let result;

      switch (task.type) {
        case 'design':
          result = await this.createDesign(task.description, context);
          break;
        case 'infrastructure':
          result = await this.planInfrastructure(task.description, context);
          break;
        case 'code':
          result = await this.generateCode(task.description, context);
          break;
        case 'api_integration':
          result = await this.integrateAPI(task.description, context);
          break;
        case 'mobile_design':
          result = await this.designMobile(task.description, context);
          break;
        default:
          result = await this.handleGenericTask(task, context);
      }

      // Check if agent created subtasks
      if (result.subtasks && result.subtasks.length > 0) {
        task.subtasks = result.subtasks.map(st => {
          const subtask = taskQueue.createTask({
            type: st.type,
            description: st.description,
            parentTaskId: task.id,
            workflowId: task.workflowId,
            delegatedBy: this.name
          });
          return subtask.id;
        });
      }

      taskQueue.updateTask(task.id, {
        status: 'completed',
        result: result.content,
        completedAt: new Date().toISOString(),
        subtasks: task.subtasks || []
      });

      return result;
    } catch (error) {
      taskQueue.updateTask(task.id, {
        status: 'failed',
        error: error.message,
        failedAt: new Date().toISOString()
      });
      throw error;
    }
  }

  async createDesign(description, context) {
    const prompt = `You are a Software Architect AI Agent. Create a comprehensive technical specification for: ${description}.

${context.previousResults ? `\n\nContext from previous agents:\n${JSON.stringify(context.previousResults, null, 2)}` : ''}

Provide:
1. Core Features (list 5-7 key features)
2. Technology Stack Recommendations
3. System Architecture Overview
4. API Requirements
5. Database Schema Suggestions
6. Security Considerations

IMPORTANT: If this project requires specialized work, suggest subtasks that should be delegated to other agents. Format subtasks as JSON at the end:
SUBTASKS: [{"type": "infrastructure", "description": "..."}, {"type": "api_integration", "description": "..."}]`;

    const response = await callClaude('design', prompt);
    return this.parseAgentResponse(response);
  }

  async planInfrastructure(description, context) {
    const prompt = `You are a DevOps Engineer AI Agent. Plan the infrastructure and deployment strategy for: ${description}.

${context.previousResults ? `\n\nContext from previous agents:\n${JSON.stringify(context.previousResults, null, 2)}` : ''}

Provide:
1. Cloud Platform Recommendations (AWS, GCP, Azure, Render, Vercel, etc.)
2. Container Strategy (Docker, Kubernetes)
3. Database Setup
4. CI/CD Pipeline
5. Monitoring & Logging
6. Scalability Plan

IMPORTANT: If you need other agents to help, suggest subtasks. Format subtasks as JSON at the end:
SUBTASKS: [{"type": "api_integration", "description": "..."}, {"type": "code", "description": "..."}]`;

    const response = await callClaude('infrastructure', prompt);
    return this.parseAgentResponse(response);
  }

  async generateCode(description, context) {
    const prompt = `You are a Full Stack Developer AI Agent. Generate production-ready code for: ${description}.

${context.previousResults ? `\n\nContext from previous agents:\n${JSON.stringify(context.previousResults, null, 2)}` : ''}

Provide:
1. Complete HTML structure
2. Styled CSS (responsive design)
3. JavaScript functionality
4. API integration code if needed
5. Comments explaining key parts

IMPORTANT: If you need mobile versions or API integrations, suggest subtasks. Format subtasks as JSON at the end:
SUBTASKS: [{"type": "mobile_design", "description": "..."}, {"type": "api_integration", "description": "..."}]`;

    const response = await callClaude('code', prompt);
    return this.parseAgentResponse(response);
  }

  async integrateAPI(description, context) {
    // Get available tools from registry
    const availableTools = toolRegistry.getToolInfo();
    const toolsList = availableTools.map(t =>
      `- ${t.name} (${t.category}): ${t.description} [${t.configured ? 'READY' : 'needs API key'}]`
    ).join('\n');

    const prompt = `You are an API Integration Specialist AI Agent. Design API integration for: ${description}.

${context.previousResults ? `\n\nContext from previous agents:\n${JSON.stringify(context.previousResults, null, 2)}` : ''}

AVAILABLE TOOLS IN REGISTRY:
${toolsList}

Provide:
1. API Selection - Choose from available tools or suggest new ones
2. Authentication Strategy
3. Rate Limiting & Caching
4. Error Handling
5. Sample Integration Code (use the available tools)
6. Testing Strategy

If you need to use a tool, format it as: USE_TOOL: toolName.endpoint`;

    const response = await callClaude('api_integration', prompt);
    return this.parseAgentResponse(response);
  }

  async designMobile(description, context) {
    const prompt = `You are a Mobile Development AI Agent. Design mobile application for: ${description}.

${context.previousResults ? `\n\nContext from previous agents:\n${JSON.stringify(context.previousResults, null, 2)}` : ''}

Provide a COMPLETE mobile development package:

## 1. iOS (Swift/SwiftUI) Implementation
- App structure and file organization
- SwiftUI views with code examples
- MVVM architecture pattern
- Core Data or SwiftData for persistence
- Network layer with URLSession
- Push notification setup (APNs)
- Sample code for main screens

## 2. Android (Kotlin/Jetpack Compose) Implementation
- App structure and file organization
- Jetpack Compose UI with code examples
- MVVM with ViewModel and LiveData
- Room database for persistence
- Retrofit for networking
- Firebase Cloud Messaging setup
- Sample code for main screens

## 3. React Native Cross-Platform Implementation
- Project structure (TypeScript preferred)
- Component hierarchy
- Navigation (React Navigation)
- State management (Redux/Context)
- AsyncStorage for local data
- API integration with Axios
- Push notifications (react-native-push-notification)
- Complete code examples

## 4. Mobile-Specific Features
- Offline mode & data sync strategy
- Biometric authentication (Face ID/Touch ID/Fingerprint)
- Camera/Photo library integration
- Location services
- Background tasks
- Deep linking
- Analytics integration

## 5. App Store Preparation
- iOS: Info.plist configuration, privacy descriptions
- Android: AndroidManifest.xml, permissions
- App icons and launch screens
- Store screenshots guidelines
- Release build configurations

## 6. Testing Strategy
- Unit tests
- UI tests
- Integration tests
- Beta testing (TestFlight/Google Play Console)

Provide actual code snippets that can be copy-pasted and used immediately.`;

    const response = await callClaude('mobile_design', prompt);
    return this.parseAgentResponse(response);
  }

  async handleGenericTask(task, context) {
    const response = await callClaude('generic', task.description);
    return this.parseAgentResponse(response);
  }

  parseAgentResponse(response) {
    // Check if response contains subtasks
    const subtaskMatch = response.match(/SUBTASKS:\s*(\[[\s\S]*?\])/);
    let subtasks = [];
    let content = response;

    if (subtaskMatch) {
      try {
        subtasks = JSON.parse(subtaskMatch[1]);
        content = response.replace(/SUBTASKS:\s*\[[\s\S]*?\]/, '').trim();
      } catch (e) {
        console.log('Failed to parse subtasks:', e);
      }
    }

    return { content, subtasks };
  }

  delegateTask(taskType, description, workflowId) {
    const task = taskQueue.createTask({
      type: taskType,
      description,
      workflowId,
      delegatedBy: this.name
    });
    return task;
  }
}

// Initialize specialized agents
const agents = {
  design: new Agent('DesignAgent', 'Software Architect', ['architecture', 'design', 'specifications']),
  infrastructure: new Agent('InfrastructureAgent', 'DevOps Engineer', ['deployment', 'infrastructure', 'scaling']),
  code: new Agent('CodeAgent', 'Full Stack Developer', ['frontend', 'backend', 'api']),
  api: new Agent('APIAgent', 'API Integration Specialist', ['api', 'external_services', 'integrations']),
  mobile: new Agent('MobileAgent', 'Mobile Developer', ['ios', 'android', 'react_native'])
};

// Orchestrator to manage agent workflows
class AgentOrchestrator {
  constructor() {
    this.agents = agents;
  }

  async executeWorkflow(description) {
    const workflow = taskQueue.createWorkflow({
      description,
      type: 'full_development'
    });

    console.log(`[Orchestrator] Starting workflow ${workflow.id} for: ${description}`);

    // Phase 1: Design Agent
    const designTask = taskQueue.createTask({
      type: 'design',
      description,
      workflowId: workflow.id,
      phase: 1
    });

    const designResult = await this.agents.design.executeTask(designTask);
    workflow.results.design = designResult.content;

    // Phase 2: Process design subtasks or continue to infrastructure
    if (designTask.subtasks && designTask.subtasks.length > 0) {
      workflow.results.designSubtasks = await this.executeSubtasks(designTask.subtasks, workflow.results);
    }

    // Phase 3: Infrastructure Agent
    const infraTask = taskQueue.createTask({
      type: 'infrastructure',
      description,
      workflowId: workflow.id,
      phase: 2
    });

    const infraResult = await this.agents.infrastructure.executeTask(infraTask, {
      previousResults: { design: workflow.results.design }
    });
    workflow.results.infrastructure = infraResult.content;

    // Phase 4: Process infrastructure subtasks
    if (infraTask.subtasks && infraTask.subtasks.length > 0) {
      workflow.results.infraSubtasks = await this.executeSubtasks(infraTask.subtasks, workflow.results);
    }

    // Phase 5: Code Agent
    const codeTask = taskQueue.createTask({
      type: 'code',
      description,
      workflowId: workflow.id,
      phase: 3
    });

    const codeResult = await this.agents.code.executeTask(codeTask, {
      previousResults: {
        design: workflow.results.design,
        infrastructure: workflow.results.infrastructure
      }
    });
    workflow.results.code = codeResult.content;

    // Phase 6: Process code subtasks (mobile, apis, etc.)
    if (codeTask.subtasks && codeTask.subtasks.length > 0) {
      workflow.results.codeSubtasks = await this.executeSubtasks(codeTask.subtasks, workflow.results);
    }

    taskQueue.updateWorkflow(workflow.id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    return workflow;
  }

  async executeSubtasks(subtaskIds, context) {
    const results = {};

    for (const subtaskId of subtaskIds) {
      const subtask = taskQueue.getTask(subtaskId);
      if (!subtask) continue;

      const agentType = this.getAgentForTaskType(subtask.type);
      const agent = this.agents[agentType];

      if (agent) {
        const result = await agent.executeTask(subtask, { previousResults: context });
        results[subtask.type] = result.content;
      }
    }

    return results;
  }

  getAgentForTaskType(taskType) {
    const mapping = {
      'design': 'design',
      'infrastructure': 'infrastructure',
      'code': 'code',
      'api_integration': 'api',
      'mobile_design': 'mobile'
    };
    return mapping[taskType] || 'code';
  }

  getWorkflowStatus(workflowId) {
    return taskQueue.getWorkflow(workflowId);
  }
}

const orchestrator = new AgentOrchestrator();

// ============================================
// EXTERNAL API INTEGRATION LAYER
// ============================================

class APIConnector {
  constructor(name, baseURL, authType = 'none') {
    this.name = name;
    this.baseURL = baseURL;
    this.authType = authType; // 'none', 'apikey', 'bearer', 'oauth'
    this.apiKey = null;
    this.rateLimitDelay = 1000; // ms between requests
    this.lastRequestTime = 0;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async makeRequest(endpoint, options = {}) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...options.headers };

    // Add authentication
    if (this.authType === 'apikey' && this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.authType === 'bearer' && this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      this.lastRequestTime = Date.now();
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[${this.name}] API Error:`, error);
      throw error;
    }
  }
}

// Tool Registry - Agents can discover and use available APIs
class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.initializeDefaultTools();
  }

  initializeDefaultTools() {
    // Weather APIs
    this.registerTool({
      name: 'openweathermap',
      category: 'weather',
      description: 'Get current weather, forecasts, and historical weather data',
      connector: new APIConnector('OpenWeatherMap', 'https://api.openweathermap.org/data/2.5', 'apikey'),
      endpoints: {
        current: { path: '/weather', params: ['q', 'lat', 'lon'] },
        forecast: { path: '/forecast', params: ['q', 'lat', 'lon'] }
      },
      envKey: 'OPENWEATHER_API_KEY'
    });

    // Maps APIs
    this.registerTool({
      name: 'mapbox',
      category: 'maps',
      description: 'Geocoding, directions, and map data',
      connector: new APIConnector('Mapbox', 'https://api.mapbox.com', 'apikey'),
      endpoints: {
        geocoding: { path: '/geocoding/v5/mapbox.places', params: ['query'] },
        directions: { path: '/directions/v5/mapbox/driving', params: ['coordinates'] }
      },
      envKey: 'MAPBOX_API_KEY'
    });

    this.registerTool({
      name: 'googlemaps',
      category: 'maps',
      description: 'Google Maps APIs for geocoding, places, and directions',
      connector: new APIConnector('GoogleMaps', 'https://maps.googleapis.com/maps/api', 'apikey'),
      endpoints: {
        geocode: { path: '/geocode/json', params: ['address'] },
        places: { path: '/place/nearbysearch/json', params: ['location', 'radius'] }
      },
      envKey: 'GOOGLE_MAPS_API_KEY'
    });

    // News APIs
    this.registerTool({
      name: 'newsapi',
      category: 'news',
      description: 'Global news articles and headlines',
      connector: new APIConnector('NewsAPI', 'https://newsapi.org/v2', 'apikey'),
      endpoints: {
        headlines: { path: '/top-headlines', params: ['country', 'category'] },
        everything: { path: '/everything', params: ['q', 'from', 'to'] }
      },
      envKey: 'NEWS_API_KEY'
    });

    // Financial APIs
    this.registerTool({
      name: 'alphavantage',
      category: 'finance',
      description: 'Stock market data and financial indicators',
      connector: new APIConnector('AlphaVantage', 'https://www.alphavantage.co/query', 'apikey'),
      endpoints: {
        quote: { path: '', params: ['function', 'symbol'] },
        intraday: { path: '', params: ['function', 'symbol', 'interval'] }
      },
      envKey: 'ALPHAVANTAGE_API_KEY'
    });

    // Email APIs
    this.registerTool({
      name: 'sendgrid',
      category: 'email',
      description: 'Send transactional and marketing emails',
      connector: new APIConnector('SendGrid', 'https://api.sendgrid.com/v3', 'bearer'),
      endpoints: {
        send: { path: '/mail/send', method: 'POST' }
      },
      envKey: 'SENDGRID_API_KEY'
    });

    // SMS APIs
    this.registerTool({
      name: 'twilio',
      category: 'sms',
      description: 'Send SMS messages and voice calls',
      connector: new APIConnector('Twilio', 'https://api.twilio.com/2010-04-01', 'bearer'),
      endpoints: {
        messages: { path: '/Accounts/{AccountSid}/Messages.json', method: 'POST' }
      },
      envKey: 'TWILIO_API_KEY'
    });

    // AI/ML APIs
    this.registerTool({
      name: 'huggingface',
      category: 'ai',
      description: 'Access thousands of ML models for NLP, vision, audio',
      connector: new APIConnector('HuggingFace', 'https://api-inference.huggingface.co', 'bearer'),
      endpoints: {
        inference: { path: '/models', method: 'POST' }
      },
      envKey: 'HUGGINGFACE_API_KEY'
    });

    // Payment APIs
    this.registerTool({
      name: 'stripe',
      category: 'payment',
      description: 'Process payments and manage subscriptions',
      connector: new APIConnector('Stripe', 'https://api.stripe.com/v1', 'bearer'),
      endpoints: {
        charges: { path: '/charges', method: 'POST' },
        customers: { path: '/customers', method: 'POST' }
      },
      envKey: 'STRIPE_API_KEY'
    });

    // Database APIs
    this.registerTool({
      name: 'airtable',
      category: 'database',
      description: 'Cloud database with spreadsheet interface',
      connector: new APIConnector('Airtable', 'https://api.airtable.com/v0', 'bearer'),
      endpoints: {
        list: { path: '/{baseId}/{tableName}', method: 'GET' },
        create: { path: '/{baseId}/{tableName}', method: 'POST' }
      },
      envKey: 'AIRTABLE_API_KEY'
    });

    // Translation APIs
    this.registerTool({
      name: 'deepl',
      category: 'translation',
      description: 'High-quality text translation',
      connector: new APIConnector('DeepL', 'https://api-free.deepl.com/v2', 'apikey'),
      endpoints: {
        translate: { path: '/translate', params: ['text', 'target_lang'] }
      },
      envKey: 'DEEPL_API_KEY'
    });

    // Image APIs
    this.registerTool({
      name: 'unsplash',
      category: 'images',
      description: 'Free high-quality stock photos',
      connector: new APIConnector('Unsplash', 'https://api.unsplash.com', 'bearer'),
      endpoints: {
        search: { path: '/search/photos', params: ['query'] },
        random: { path: '/photos/random', params: ['query'] }
      },
      envKey: 'UNSPLASH_API_KEY'
    });

    console.log(`[ToolRegistry] Initialized ${this.tools.size} API tools`);
  }

  registerTool(tool) {
    this.tools.set(tool.name, tool);

    // Auto-configure API key from environment if available
    if (tool.envKey && process.env[tool.envKey]) {
      tool.connector.setApiKey(process.env[tool.envKey]);
      console.log(`[ToolRegistry] Configured ${tool.name} from ${tool.envKey}`);
    }
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getToolsByCategory(category) {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getToolInfo() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      category: tool.category,
      description: tool.description,
      configured: tool.connector.apiKey !== null,
      endpoints: Object.keys(tool.endpoints)
    }));
  }

  async callTool(toolName, endpoint, params = {}) {
    const tool = this.getTool(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    if (!tool.connector.apiKey) {
      throw new Error(`Tool ${toolName} not configured. Missing API key.`);
    }

    const endpointConfig = tool.endpoints[endpoint];
    if (!endpointConfig) {
      throw new Error(`Endpoint ${endpoint} not found for tool ${toolName}`);
    }

    return await tool.connector.makeRequest(endpointConfig.path, {
      method: endpointConfig.method || 'GET',
      ...params
    });
  }
}

// Global tool registry
const toolRegistry = new ToolRegistry();

// ============================================
// PROJECT SCAFFOLDING SYSTEM
// ============================================

class ProjectScaffolder {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    // Web Application Templates
    this.templates.set('react-app', {
      type: 'web',
      framework: 'React',
      structure: {
        'package.json': this.generatePackageJson,
        'src/App.js': this.generateReactApp,
        'src/index.js': this.generateReactIndex,
        'src/components/': 'directory',
        'src/styles/App.css': this.generateBasicCSS,
        'public/index.html': this.generateHTML,
        '.gitignore': this.generateGitignore,
        'README.md': this.generateReadme
      }
    });

    this.templates.set('node-api', {
      type: 'api',
      framework: 'Express',
      structure: {
        'package.json': this.generateNodePackageJson,
        'server.js': this.generateExpressServer,
        'routes/': 'directory',
        'models/': 'directory',
        'middleware/': 'directory',
        'config/': 'directory',
        '.env.example': this.generateEnvExample,
        '.gitignore': this.generateGitignore,
        'README.md': this.generateReadme
      }
    });

    this.templates.set('react-native-app', {
      type: 'mobile',
      framework: 'React Native',
      structure: {
        'package.json': this.generateRNPackageJson,
        'App.js': this.generateRNApp,
        'app.json': this.generateAppJson,
        'src/screens/': 'directory',
        'src/components/': 'directory',
        'src/navigation/': 'directory',
        'src/services/': 'directory',
        'src/utils/': 'directory',
        '.gitignore': this.generateGitignore,
        'README.md': this.generateReadme
      }
    });

    this.templates.set('nextjs-app', {
      type: 'web',
      framework: 'Next.js',
      structure: {
        'package.json': this.generateNextPackageJson,
        'pages/index.js': this.generateNextPage,
        'pages/api/': 'directory',
        'components/': 'directory',
        'styles/globals.css': this.generateBasicCSS,
        'public/': 'directory',
        '.gitignore': this.generateGitignore,
        'README.md': this.generateReadme
      }
    });
  }

  generateProject(projectName, template, description) {
    const templateConfig = this.templates.get(template);
    if (!templateConfig) {
      throw new Error(`Template ${template} not found`);
    }

    const files = [];

    for (const [path, generator] of Object.entries(templateConfig.structure)) {
      if (generator === 'directory') {
        files.push({
          path,
          type: 'directory',
          content: null
        });
      } else if (typeof generator === 'function') {
        files.push({
          path,
          type: 'file',
          content: generator(projectName, description)
        });
      }
    }

    return {
      projectName,
      template,
      framework: templateConfig.framework,
      type: templateConfig.type,
      files
    };
  }

  generatePackageJson(projectName, description) {
    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: description || `${projectName} application`,
      main: 'src/index.js',
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-scripts': '5.0.1'
      },
      devDependencies: {
        '@testing-library/react': '^13.4.0',
        '@testing-library/jest-dom': '^5.16.5'
      },
      eslintConfig: {
        extends: ['react-app']
      },
      browserslist: {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version']
      }
    }, null, 2);
  }

  generateNodePackageJson(projectName, description) {
    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: description || `${projectName} API`,
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'nodemon server.js',
        test: 'jest'
      },
      dependencies: {
        'express': '^4.18.2',
        'cors': '^2.8.5',
        'dotenv': '^16.0.3',
        'morgan': '^1.10.0'
      },
      devDependencies: {
        'nodemon': '^2.0.22',
        'jest': '^29.5.0'
      }
    }, null, 2);
  }

  generateRNPackageJson(projectName, description) {
    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: description || `${projectName} mobile app`,
      main: 'node_modules/expo/AppEntry.js',
      scripts: {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web'
      },
      dependencies: {
        'expo': '~49.0.0',
        'react': '18.2.0',
        'react-native': '0.72.6',
        '@react-navigation/native': '^6.1.9',
        '@react-navigation/stack': '^6.3.20',
        'axios': '^1.6.0'
      },
      devDependencies: {
        '@babel/core': '^7.20.0'
      }
    }, null, 2);
  }

  generateNextPackageJson(projectName, description) {
    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: description || `${projectName} Next.js app`,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        'next': '14.0.0',
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        'eslint': '^8.54.0',
        'eslint-config-next': '14.0.0'
      }
    }, null, 2);
  }

  generateReactApp(projectName) {
    return `import React from 'react';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${projectName}</h1>
        <p>Welcome to your new React application!</p>
      </header>
    </div>
  );
}

export default App;`;
  }

  generateReactIndex() {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  generateExpressServer(projectName) {
    return `const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${projectName} API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`${projectName} API running on port \${PORT}\`);
});`;
  }

  generateRNApp(projectName) {
    return `import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>${projectName}</Text>
        <Text style={styles.subtitle}>Welcome to your React Native app!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});`;
  }

  generateNextPage(projectName) {
    return `export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>${projectName}</h1>
      <p>Welcome to your Next.js application!</p>
    </div>
  );
}`;
  }

  generateAppJson(projectName) {
    return JSON.stringify({
      expo: {
        name: projectName,
        slug: projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff'
        },
        updates: {
          fallbackToCacheTimeout: 0
        },
        assetBundlePatterns: ['**/*'],
        ios: {
          supportsTablet: true,
          bundleIdentifier: `com.${projectName.toLowerCase().replace(/\s+/g, '')}`
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#FFFFFF'
          },
          package: `com.${projectName.toLowerCase().replace(/\s+/g, '')}`
        }
      }
    }, null, 2);
  }

  generateHTML(projectName) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="${projectName} web application" />
  <title>${projectName}</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>`;
  }

  generateBasicCSS() {
    return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}`;
  }

  generateGitignore() {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo`;
  }

  generateEnvExample() {
    return `# Environment Variables
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=

# API Keys
API_KEY=`;
  }

  generateReadme(projectName, description) {
    return `# ${projectName}

${description || 'A new application'}

## Getting Started

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm start
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

## Project Structure

Generated with DEV-TOOL-KIT-A2A
`;
  }

  getAvailableTemplates() {
    return Array.from(this.templates.keys()).map(key => ({
      name: key,
      ...this.templates.get(key)
    }));
  }
}

const projectScaffolder = new ProjectScaffolder();

// API endpoint to create project and run agents
app.post('/api/create-project', async (req, res) => {
  const { description } = req.body;

  try {
    console.log('[API] Starting multi-agent workflow for:', description);

    // Execute full agent workflow with orchestrator
    const workflow = await orchestrator.executeWorkflow(description);

    res.json({
      success: true,
      workflowId: workflow.id,
      message: 'AI Agents completed your request!',
      results: {
        design: workflow.results.design,
        infrastructure: workflow.results.infrastructure,
        code: workflow.results.code,
        subtasks: {
          design: workflow.results.designSubtasks || {},
          infrastructure: workflow.results.infraSubtasks || {},
          code: workflow.results.codeSubtasks || {}
        }
      }
    });
  } catch (error) {
    console.error('[API] Error:', error);
    res.json({ success: false, error: error.message });
  }
});

// New endpoint to get workflow status
app.get('/api/workflow/:workflowId', (req, res) => {
  const { workflowId } = req.params;
  const workflow = orchestrator.getWorkflowStatus(workflowId);

  if (workflow) {
    res.json({ success: true, workflow });
  } else {
    res.json({ success: false, error: 'Workflow not found' });
  }
});

// New endpoint to manually delegate tasks between agents
app.post('/api/delegate-task', async (req, res) => {
  const { taskType, description, workflowId } = req.body;

  try {
    const task = taskQueue.createTask({
      type: taskType,
      description,
      workflowId: workflowId || uuidv4()
    });

    const agentType = orchestrator.getAgentForTaskType(taskType);
    const agent = agents[agentType];

    if (!agent) {
      return res.json({ success: false, error: 'Invalid agent type' });
    }

    const result = await agent.executeTask(task);

    res.json({
      success: true,
      taskId: task.id,
      result: result.content,
      subtasks: task.subtasks || []
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// API Tools Registry Endpoint
app.get('/api/tools', (req, res) => {
  res.json({
    success: true,
    tools: toolRegistry.getToolInfo(),
    categories: {
      weather: toolRegistry.getToolsByCategory('weather').length,
      maps: toolRegistry.getToolsByCategory('maps').length,
      news: toolRegistry.getToolsByCategory('news').length,
      finance: toolRegistry.getToolsByCategory('finance').length,
      email: toolRegistry.getToolsByCategory('email').length,
      sms: toolRegistry.getToolsByCategory('sms').length,
      ai: toolRegistry.getToolsByCategory('ai').length,
      payment: toolRegistry.getToolsByCategory('payment').length,
      database: toolRegistry.getToolsByCategory('database').length,
      translation: toolRegistry.getToolsByCategory('translation').length,
      images: toolRegistry.getToolsByCategory('images').length
    }
  });
});

// Register new API tool dynamically
app.post('/api/tools/register', (req, res) => {
  const { name, category, description, baseURL, authType, endpoints, envKey } = req.body;

  try {
    toolRegistry.registerTool({
      name,
      category,
      description,
      connector: new APIConnector(name, baseURL, authType),
      endpoints,
      envKey
    });

    res.json({
      success: true,
      message: `Tool ${name} registered successfully`,
      tool: toolRegistry.getTool(name)
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Call an API tool
app.post('/api/tools/call', async (req, res) => {
  const { toolName, endpoint, params } = req.body;

  try {
    const result = await toolRegistry.callTool(toolName, endpoint, params);
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Project Scaffolding Endpoints
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    templates: projectScaffolder.getAvailableTemplates()
  });
});

app.post('/api/scaffold', async (req, res) => {
  const { projectName, template, description } = req.body;

  try {
    const project = projectScaffolder.generateProject(projectName, template, description);

    // Optionally save to Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectName,
          template,
          description,
          files: project.files,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Supabase error:', error);
      }
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Supabase Project Management Endpoints
app.post('/api/projects/save', async (req, res) => {
  const { workflowId, projectData } = req.body;

  try {
    const workflow = taskQueue.getWorkflow(workflowId);

    if (!workflow) {
      return res.json({ success: false, error: 'Workflow not found' });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        workflow_id: workflowId,
        description: workflow.description,
        results: workflow.results,
        status: workflow.status,
        created_at: workflow.createdAt,
        updated_at: new Date().toISOString(),
        ...projectData
      }])
      .select();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      project: data[0]
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      projects: data
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      project: data
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/projects/:id/version', async (req, res) => {
  const { id } = req.params;
  const { changes, versionNotes } = req.body;

  try {
    // Get current project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Create version history entry
    const { data: version, error: versionError } = await supabase
      .from('project_versions')
      .insert([{
        project_id: id,
        version_number: (project.version_number || 0) + 1,
        changes,
        notes: versionNotes,
        snapshot: project.results,
        created_at: new Date().toISOString()
      }])
      .select();

    if (versionError) {
      throw versionError;
    }

    // Update project version number
    await supabase
      .from('projects')
      .update({ version_number: version[0].version_number, updated_at: new Date().toISOString() })
      .eq('id', id);

    res.json({
      success: true,
      version: version[0]
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/projects/:id/versions', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', id)
      .order('version_number', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      versions: data
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Function to call Claude API
async function callClaude(agentType, input) {
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('[Claude API] API key not configured');
    return 'Claude API not configured - Please set CLAUDE_API_KEY environment variable';
  }

  const prompts = {
    design: `You are a Software Architect. Create a technical specification for: ${input}. Include features, tech stack, and architecture.`,
    infrastructure: `You are a DevOps Engineer. Plan the infrastructure for: ${input}`,
    code: `You are a Full Stack Developer. Generate HTML/CSS/JS code for: ${input}`,
    api_integration: input,
    mobile_design: input,
    generic: input
  };

  // Try models in order - use first one that works
  const modelsToTry = [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1'
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Claude API] Trying ${agentType} agent with model: ${model}`);

      const requestBody = {
        model,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompts[agentType] || input
        }]
      };

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log(`[Claude API] Model ${model} - Response status: ${response.status}`);

      if (!response.ok) {
        console.error(`[Claude API] Model ${model} failed: ${responseText}`);

        // Try to parse error
        try {
          const errorData = JSON.parse(responseText);
          const errorMsg = errorData.error?.message || responseText;

          // If it's a model not found error (404), try next model
          if (response.status === 404 && (errorMsg.includes('model') || errorData.error?.type === 'not_found_error')) {
            console.log(`[Claude API] Model ${model} not available, trying next...`);
            lastError = `Model ${model} not found`;
            continue; // Try next model
          }

          // For other errors (auth, rate limit, etc), throw immediately
          throw new Error(`Claude API error (${response.status}): ${errorMsg}`);
        } catch (parseError) {
          // If we can't parse the error, check if it's 404
          if (response.status === 404) {
            console.log(`[Claude API] Model ${model} returned 404, trying next...`);
            lastError = `Model ${model} returned 404`;
            continue;
          }
          throw new Error(`Claude API error (${response.status}): ${responseText}`);
        }
      }

      // Success! Parse and return
      const data = JSON.parse(responseText);

      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('[Claude API] Unexpected response format:', data);
        throw new Error('Unexpected response format from Claude API');
      }

      console.log(`[Claude API] ✅ Success with model ${model} - received ${data.content[0].text.length} characters`);
      return data.content[0].text;

    } catch (error) {
      console.error(`[Claude API] Model ${model} error:`, error.message);

      // Provide helpful error messages for non-model errors
      if (error.message.includes('401')) {
        return 'Error: Invalid Claude API key. Please check your CLAUDE_API_KEY environment variable.';
      } else if (error.message.includes('429')) {
        return 'Error: Claude API rate limit exceeded. Please try again in a moment.';
      } else if (!error.message.includes('not found') && !error.message.includes('404')) {
        // If it's not a model error, return immediately
        return `Error calling Claude AI: ${error.message}`;
      }

      // Store error and continue to next model
      lastError = error.message;
    }
  }

  // If we get here, all models failed
  console.error('[Claude API] All models failed. Last error:', lastError);
  return `Error: None of the Claude models are available with your API key. Last error: ${lastError}. Please check your API key tier and model access.`;
}

// Main page with working form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DEV-TOOL-KIT-A2A</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, system-ui, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          max-width: 1000px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #333; margin-bottom: 20px; }
        .status { 
          background: #4caf50;
          color: white;
          padding: 8px 16px; 
          border-radius: 20px;
          display: inline-block;
          margin: 20px 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .card {
          background: #f5f7fa;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }
        .card h3 { color: #667eea; margin-bottom: 10px; }
        input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          margin: 20px 0;
        }
        button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        #output {
          margin-top: 20px;
          padding: 20px;
          background: #f0f0f0;
          border-radius: 10px;
          display: none;
          white-space: pre-wrap;
          font-family: monospace;
          max-height: 400px;
          overflow-y: auto;
        }
        .loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 DEV-TOOL-KIT-A2A</h1>
        <p style="color: #666; font-size: 18px;">Multi-Agent Development Orchestrator</p>
        <div class="status">✅ System Online</div>
        
        <div class="grid">
          <div class="card">
            <h3>📐 Design Agent</h3>
            <p>Creates technical specifications and delegates architecture tasks</p>
          </div>
          <div class="card">
            <h3>☁️ Infrastructure Agent</h3>
            <p>Plans backend services and delegates DevOps tasks</p>
          </div>
          <div class="card">
            <h3>💻 Code Agent</h3>
            <p>Generates code and delegates frontend/backend tasks</p>
          </div>
          <div class="card">
            <h3>🔌 API Agent</h3>
            <p>Integrates external APIs (Weather, Maps, etc.)</p>
          </div>
          <div class="card">
            <h3>📱 Mobile Agent</h3>
            <p>Designs iOS/Android apps and React Native solutions</p>
          </div>
        </div>
        
        <input type="text" id="projectInput" placeholder="Describe your application (e.g., Build a real-time chat app)">
        <button id="buildBtn" onclick="buildWithAI()">Build with AI Agents</button>
        
        <div id="output"></div>
        
        <p style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px;">
          <strong>Status:</strong> Server running on Render<br>
          <strong>Supabase:</strong> ${process.env.SUPABASE_URL ? 'Connected ✅' : 'Not configured ❌'}<br>
          <strong>Claude AI:</strong> ${process.env.CLAUDE_API_KEY ? 'Ready ✅' : 'Not configured ❌'}
        </p>
      </div>
      
      <script>
        async function buildWithAI() {
          const input = document.getElementById('projectInput');
          const output = document.getElementById('output');
          const btn = document.getElementById('buildBtn');

          if (!input.value.trim()) {
            alert('Please describe your application first!');
            return;
          }

          output.style.display = 'block';
          output.innerHTML = '🤖 Multi-Agent Orchestration Starting...\\n';
          output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n';
          btn.disabled = true;
          btn.innerHTML = '<span class="loading"></span> Processing...';

          try {
            output.innerHTML += '📐 Phase 1: Design Agent analyzing requirements...\\n';

            const response = await fetch('/api/create-project', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ description: input.value })
            });

            const data = await response.json();

            if (data.success) {
              output.innerHTML += '✅ Workflow ID: ' + data.workflowId + '\\n\\n';

              // Design results
              output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
              output.innerHTML += '📐 DESIGN SPECIFICATION\\n';
              output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
              output.innerHTML += data.results.design + '\\n\\n';

              // Design subtasks
              if (Object.keys(data.results.subtasks.design).length > 0) {
                output.innerHTML += '📋 Design Agent delegated subtasks:\\n';
                for (const [type, result] of Object.entries(data.results.subtasks.design)) {
                  output.innerHTML += '  ├─ ' + type + ': Completed\\n';
                }
                output.innerHTML += '\\n';
              }

              // Infrastructure results
              output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
              output.innerHTML += '☁️ INFRASTRUCTURE PLAN\\n';
              output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
              output.innerHTML += data.results.infrastructure + '\\n\\n';

              // Infrastructure subtasks
              if (Object.keys(data.results.subtasks.infrastructure).length > 0) {
                output.innerHTML += '📋 Infrastructure Agent delegated subtasks:\\n';
                for (const [type, result] of Object.entries(data.results.subtasks.infrastructure)) {
                  output.innerHTML += '  ├─ ' + type + ': Completed\\n';
                }
                output.innerHTML += '\\n';
              }

              // Code results
              output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
              output.innerHTML += '💻 GENERATED CODE\\n';
              output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
              output.innerHTML += data.results.code + '\\n\\n';

              // Code subtasks
              if (Object.keys(data.results.subtasks.code).length > 0) {
                output.innerHTML += '📋 Code Agent delegated subtasks:\\n';
                for (const [type, result] of Object.entries(data.results.subtasks.code)) {
                  output.innerHTML += '  ├─ ' + type + ': Completed\\n';
                  output.innerHTML += '\\n' + result + '\\n\\n';
                }
              }

              output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
              output.innerHTML += '✅ Multi-Agent Workflow Complete!\\n';
              output.innerHTML += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n';
            } else {
              output.innerHTML += '❌ Error: ' + data.error;
            }
          } catch (error) {
            output.innerHTML += '❌ Error: ' + error.message;
          } finally {
            btn.disabled = false;
            btn.innerHTML = 'Build with AI Agents';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    supabase: process.env.SUPABASE_URL ? 'connected' : 'not configured',
    claude: process.env.CLAUDE_API_KEY ? 'ready' : 'not configured'
  });
});

// Diagnostic endpoint to check API key configuration
app.get('/api/diagnostics', (req, res) => {
  const claudeKey = process.env.CLAUDE_API_KEY;

  res.json({
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      port: PORT
    },
    apiKeys: {
      claude: {
        configured: !!claudeKey,
        keyLength: claudeKey ? claudeKey.length : 0,
        keyPrefix: claudeKey ? claudeKey.substring(0, 7) + '...' : 'NOT SET',
        keyFormat: claudeKey ? (claudeKey.startsWith('sk-ant-') ? 'valid format' : 'INVALID FORMAT') : 'missing'
      },
      supabase: {
        url: !!process.env.SUPABASE_URL,
        key: !!process.env.SUPABASE_ANON_KEY
      },
      externalAPIs: {
        openweather: !!process.env.OPENWEATHER_API_KEY,
        mapbox: !!process.env.MAPBOX_API_KEY,
        googlemaps: !!process.env.GOOGLE_MAPS_API_KEY,
        newsapi: !!process.env.NEWS_API_KEY,
        alphavantage: !!process.env.ALPHAVANTAGE_API_KEY,
        sendgrid: !!process.env.SENDGRID_API_KEY,
        twilio: !!process.env.TWILIO_API_KEY,
        huggingface: !!process.env.HUGGINGFACE_API_KEY,
        stripe: !!process.env.STRIPE_API_KEY,
        airtable: !!process.env.AIRTABLE_API_KEY,
        deepl: !!process.env.DEEPL_API_KEY,
        unsplash: !!process.env.UNSPLASH_API_KEY
      }
    },
    toolRegistry: {
      totalTools: toolRegistry.getAllTools().length,
      configuredTools: toolRegistry.getToolInfo().filter(t => t.configured).length
    }
  });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Environment check:');
  console.log('- Supabase:', process.env.SUPABASE_URL ? 'Connected' : 'Missing SUPABASE_URL');
  console.log('- Claude:', process.env.CLAUDE_API_KEY ? 'Ready' : 'Missing CLAUDE_API_KEY');
});