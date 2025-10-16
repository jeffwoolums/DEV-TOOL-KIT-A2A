# DEV-TOOL-KIT-A2A API Documentation

Complete API reference for the multi-agent development orchestrator.

## Base URL
- **Production**: `https://dev-tool-kit-a2a-2.onrender.com`
- **Local**: `http://localhost:3000`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Multi-Agent Workflows](#multi-agent-workflows)
3. [Task Delegation](#task-delegation)
4. [API Tools Registry](#api-tools-registry)
5. [Project Scaffolding](#project-scaffolding)
6. [Project Management](#project-management)
7. [Health & Status](#health--status)

---

## Authentication

Currently, the API uses environment-based authentication. User authentication with Supabase Auth can be implemented.

### Headers (Future)
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Multi-Agent Workflows

### Create Project with Full Workflow
Execute a complete 3-phase multi-agent development workflow.

**Endpoint**: `POST /api/create-project`

**Request Body**:
```json
{
  "description": "Build a weather dashboard with maps integration"
}
```

**Response**:
```json
{
  "success": true,
  "workflowId": "uuid-v4",
  "message": "AI Agents completed your request!",
  "results": {
    "design": "Technical specification from Design Agent...",
    "infrastructure": "Infrastructure plan from Infrastructure Agent...",
    "code": "Generated code from Code Agent...",
    "subtasks": {
      "design": {},
      "infrastructure": {},
      "code": {
        "mobile_design": "Mobile implementation...",
        "api_integration": "API integration details..."
      }
    }
  }
}
```

**Agents Involved**:
1. **Design Agent** - Creates technical specifications
2. **Infrastructure Agent** - Plans deployment and infrastructure
3. **Code Agent** - Generates implementation code
4. **API Agent** (if needed) - Integrates external APIs
5. **Mobile Agent** (if needed) - Creates mobile implementations

---

### Get Workflow Status
Retrieve the status of a specific workflow.

**Endpoint**: `GET /api/workflow/:workflowId`

**Response**:
```json
{
  "success": true,
  "workflow": {
    "id": "workflow-uuid",
    "description": "Build a weather dashboard",
    "type": "full_development",
    "status": "completed",
    "tasks": [],
    "results": {},
    "createdAt": "2025-01-15T10:00:00Z",
    "completedAt": "2025-01-15T10:05:30Z"
  }
}
```

---

## Task Delegation

### Delegate Task to Specific Agent
Manually delegate a specific task to an agent.

**Endpoint**: `POST /api/delegate-task`

**Request Body**:
```json
{
  "taskType": "mobile_design",
  "description": "Create iOS app for weather tracking",
  "workflowId": "optional-workflow-uuid"
}
```

**Task Types**:
- `design` - Software architecture and specifications
- `infrastructure` - DevOps and deployment planning
- `code` - Code generation
- `api_integration` - External API integration
- `mobile_design` - Mobile app development

**Response**:
```json
{
  "success": true,
  "taskId": "task-uuid",
  "result": "Mobile implementation details...",
  "subtasks": ["subtask-uuid-1", "subtask-uuid-2"]
}
```

---

## API Tools Registry

### List All Available Tools
Get all registered API tools.

**Endpoint**: `GET /api/tools`

**Response**:
```json
{
  "success": true,
  "tools": [
    {
      "name": "openweathermap",
      "category": "weather",
      "description": "Get current weather, forecasts, and historical weather data",
      "configured": true,
      "endpoints": ["current", "forecast"]
    },
    {
      "name": "stripe",
      "category": "payment",
      "description": "Process payments and manage subscriptions",
      "configured": false,
      "endpoints": ["charges", "customers"]
    }
  ],
  "categories": {
    "weather": 1,
    "maps": 2,
    "news": 1,
    "finance": 1,
    "email": 1,
    "sms": 1,
    "ai": 1,
    "payment": 1,
    "database": 1,
    "translation": 1,
    "images": 1
  }
}
```

### Register New API Tool
Dynamically register a new API integration.

**Endpoint**: `POST /api/tools/register`

**Request Body**:
```json
{
  "name": "custom-api",
  "category": "custom",
  "description": "My custom API integration",
  "baseURL": "https://api.example.com",
  "authType": "bearer",
  "endpoints": {
    "list": {
      "path": "/items",
      "method": "GET"
    },
    "create": {
      "path": "/items",
      "method": "POST"
    }
  },
  "envKey": "CUSTOM_API_KEY"
}
```

**Auth Types**: `none`, `apikey`, `bearer`, `oauth`

**Response**:
```json
{
  "success": true,
  "message": "Tool custom-api registered successfully",
  "tool": {
    "name": "custom-api",
    "category": "custom",
    "configured": false
  }
}
```

### Call API Tool
Execute a call to a registered API tool.

**Endpoint**: `POST /api/tools/call`

**Request Body**:
```json
{
  "toolName": "openweathermap",
  "endpoint": "current",
  "params": {
    "q": "London"
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "weather": [...],
    "main": {...}
  }
}
```

---

## Project Scaffolding

### List Available Templates
Get all project templates.

**Endpoint**: `GET /api/templates`

**Response**:
```json
{
  "success": true,
  "templates": [
    {
      "name": "react-app",
      "type": "web",
      "framework": "React"
    },
    {
      "name": "node-api",
      "type": "api",
      "framework": "Express"
    },
    {
      "name": "react-native-app",
      "type": "mobile",
      "framework": "React Native"
    },
    {
      "name": "nextjs-app",
      "type": "web",
      "framework": "Next.js"
    }
  ]
}
```

### Generate Project Scaffold
Create a complete project structure with all files.

**Endpoint**: `POST /api/scaffold`

**Request Body**:
```json
{
  "projectName": "My Awesome App",
  "template": "react-app",
  "description": "A weather tracking application"
}
```

**Response**:
```json
{
  "success": true,
  "project": {
    "projectName": "My Awesome App",
    "template": "react-app",
    "framework": "React",
    "type": "web",
    "files": [
      {
        "path": "package.json",
        "type": "file",
        "content": "{\n  \"name\": \"my-awesome-app\",\n  ..."
      },
      {
        "path": "src/App.js",
        "type": "file",
        "content": "import React from 'react';\n..."
      },
      {
        "path": "src/components/",
        "type": "directory",
        "content": null
      }
    ]
  }
}
```

---

## Project Management

### Save Project
Save a workflow result as a project in Supabase.

**Endpoint**: `POST /api/projects/save`

**Request Body**:
```json
{
  "workflowId": "workflow-uuid",
  "projectData": {
    "name": "Weather Dashboard",
    "template": "react-app"
  }
}
```

**Response**:
```json
{
  "success": true,
  "project": {
    "id": "project-uuid",
    "workflow_id": "workflow-uuid",
    "description": "Build a weather dashboard",
    "results": {...},
    "status": "completed",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### List All Projects
Get all saved projects.

**Endpoint**: `GET /api/projects`

**Response**:
```json
{
  "success": true,
  "projects": [
    {
      "id": "project-uuid",
      "name": "Weather Dashboard",
      "description": "Build a weather dashboard",
      "template": "react-app",
      "status": "active",
      "version_number": 2,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T11:00:00Z"
    }
  ]
}
```

### Get Single Project
Retrieve a specific project.

**Endpoint**: `GET /api/projects/:id`

**Response**:
```json
{
  "success": true,
  "project": {
    "id": "project-uuid",
    "workflow_id": "workflow-uuid",
    "name": "Weather Dashboard",
    "description": "Build a weather dashboard",
    "results": {...},
    "files": [...],
    "status": "active",
    "version_number": 1,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### Create Project Version
Save a new version of a project.

**Endpoint**: `POST /api/projects/:id/version`

**Request Body**:
```json
{
  "changes": {
    "added": ["New mobile component"],
    "modified": ["Updated API integration"],
    "removed": []
  },
  "versionNotes": "Added mobile support and improved API error handling"
}
```

**Response**:
```json
{
  "success": true,
  "version": {
    "id": "version-uuid",
    "project_id": "project-uuid",
    "version_number": 2,
    "changes": {...},
    "notes": "Added mobile support...",
    "snapshot": {...},
    "created_at": "2025-01-15T11:00:00Z"
  }
}
```

### Get Project Version History
List all versions of a project.

**Endpoint**: `GET /api/projects/:id/versions`

**Response**:
```json
{
  "success": true,
  "versions": [
    {
      "id": "version-2-uuid",
      "version_number": 2,
      "changes": {...},
      "notes": "Added mobile support",
      "created_at": "2025-01-15T11:00:00Z"
    },
    {
      "id": "version-1-uuid",
      "version_number": 1,
      "changes": {...},
      "notes": "Initial version",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## Health & Status

### Health Check
Check if the API is running and healthy.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "supabase": "connected",
  "claude": "ready"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- API tool calls have built-in rate limiting (1000ms between requests per tool)
- Claude API calls are subject to Anthropic's rate limits

---

## Environment Variables

Required for full functionality:

### Core
- `CLAUDE_API_KEY` - **Required** for AI functionality
- `SUPABASE_URL` - Database connection
- `SUPABASE_ANON_KEY` - Database auth
- `PORT` - Server port (default: 3000)

### Optional API Tools
- `OPENWEATHER_API_KEY`
- `MAPBOX_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `NEWS_API_KEY`
- `ALPHAVANTAGE_API_KEY`
- `SENDGRID_API_KEY`
- `TWILIO_API_KEY`
- `HUGGINGFACE_API_KEY`
- `STRIPE_API_KEY`
- `AIRTABLE_API_KEY`
- `DEEPL_API_KEY`
- `UNSPLASH_API_KEY`

---

## Example Workflows

### Complete Application Development
```bash
# 1. Create project with multi-agent workflow
curl -X POST https://dev-tool-kit-a2a-2.onrender.com/api/create-project \
  -H "Content-Type: application/json" \
  -d '{"description": "Build a task management app with mobile support"}'

# 2. Save the project
curl -X POST https://dev-tool-kit-a2a-2.onrender.com/api/projects/save \
  -H "Content-Type: application/json" \
  -d '{"workflowId": "workflow-id-from-step-1", "projectData": {"name": "Task Manager"}}'

# 3. Generate project scaffold
curl -X POST https://dev-tool-kit-a2a-2.onrender.com/api/scaffold \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Task Manager", "template": "react-app", "description": "Task management application"}'

# 4. Create a version
curl -X POST https://dev-tool-kit-a2a-2.onrender.com/api/projects/{project-id}/version \
  -H "Content-Type: application/json" \
  -d '{"changes": {"added": ["Dark mode"]}, "versionNotes": "Added dark mode support"}'
```

### Mobile App Development
```bash
# Delegate mobile design task
curl -X POST https://dev-tool-kit-a2a-2.onrender.com/api/delegate-task \
  -H "Content-Type: application/json" \
  -d '{"taskType": "mobile_design", "description": "Create iOS and Android app for task management"}'
```

### API Integration
```bash
# List available API tools
curl https://dev-tool-kit-a2a-2.onrender.com/api/tools

# Call weather API
curl -X POST https://dev-tool-kit-a2a-2.onrender.com/api/tools/call \
  -H "Content-Type: application/json" \
  -d '{"toolName": "openweathermap", "endpoint": "current", "params": {"q": "London"}}'
```

---

## Support

For issues or questions:
- GitHub: https://github.com/jeffwoolums/DEV-TOOL-KIT-A2A
- Create an issue with detailed information about your problem

---

**Generated with DEV-TOOL-KIT-A2A**
