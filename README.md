# 🚀 DEV-TOOL-KIT-A2A

**Multi-Agent Development Orchestrator** - AI-powered platform for automated application development with agent-to-agent collaboration.

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://dev-tool-kit-a2a-2.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

---

## 🌟 Features

### 🤖 **5 Specialized AI Agents**
- **Design Agent**: Software architecture and technical specifications
- **Infrastructure Agent**: DevOps, deployment, and infrastructure planning
- **Code Agent**: Full-stack code generation (HTML/CSS/JS)
- **API Agent**: External API integration (12 pre-integrated services)
- **Mobile Agent**: iOS (Swift/SwiftUI), Android (Kotlin), React Native development

### 🔗 **Agent-to-Agent Communication**
- Agents autonomously create and delegate tasks
- Multi-phase workflow coordination
- Context passing between agents
- Automatic subtask discovery and execution

### 🛠️ **12 Pre-Integrated APIs**
- **Weather**: OpenWeatherMap
- **Maps**: Mapbox, Google Maps
- **News**: NewsAPI
- **Finance**: Alpha Vantage
- **Communication**: SendGrid (email), Twilio (SMS)
- **AI/ML**: HuggingFace
- **Payments**: Stripe
- **Database**: Airtable
- **Translation**: DeepL
- **Images**: Unsplash

### 📦 **Project Scaffolding**
- 4 ready-to-use templates:
  - React App
  - Node.js API (Express)
  - React Native Mobile App
  - Next.js Application
- Complete file structure generation
- Multi-file output with actual code

### 💾 **Persistent Storage**
- Supabase integration
- Project versioning and history
- Workflow tracking
- User authentication ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- Claude API Key ([Get one here](https://console.anthropic.com))
- Supabase Account (optional, for persistence)

### Installation

```bash
# Clone the repository
git clone https://github.com/jeffwoolums/DEV-TOOL-KIT-A2A.git
cd DEV-TOOL-KIT-A2A

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Start the server
npm start
```

### Environment Variables

Create a `.env` file with:

```env
# Required
CLAUDE_API_KEY=your_claude_api_key_here
PORT=3000

# Optional - Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - API Tools
OPENWEATHER_API_KEY=your_key
MAPBOX_API_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key
NEWS_API_KEY=your_key
ALPHAVANTAGE_API_KEY=your_key
SENDGRID_API_KEY=your_key
TWILIO_API_KEY=your_key
HUGGINGFACE_API_KEY=your_key
STRIPE_API_KEY=your_key
AIRTABLE_API_KEY=your_key
DEEPL_API_KEY=your_key
UNSPLASH_API_KEY=your_key
```

---

## 📖 Usage

### Web Interface

Visit `http://localhost:3000` and describe your application:

```
"Build a weather dashboard with maps integration and mobile support"
```

The system will automatically:
1. Design the architecture
2. Plan the infrastructure
3. Generate the code
4. Create mobile implementations (if needed)
5. Integrate external APIs (if needed)

### API Usage

#### Create a Project
```bash
curl -X POST http://localhost:3000/api/create-project \
  -H "Content-Type: application/json" \
  -d '{"description": "Build a task management app"}'
```

#### Generate Project Scaffold
```bash
curl -X POST http://localhost:3000/api/scaffold \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My App",
    "template": "react-app",
    "description": "A task management application"
  }'
```

#### List Available APIs
```bash
curl http://localhost:3000/api/tools
```

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Interface (Frontend)                  │
│  - Beautiful gradient UI with agent status display          │
│  - Real-time workflow visualization                          │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/JSON
                 ▼
┌─────────────────────────────────────────────────────────────┐
│           Express.js Server (API Layer)                      │
│  - 15+ RESTful endpoints                                    │
│  - Multi-agent orchestration                                │
│  - Project scaffolding                                      │
│  - API tools registry                                       │
└─────┬───────────────────────┬──────────────────┬────────────┘
      │                       │                  │
      ▼                       ▼                  ▼
┌──────────────┐    ┌──────────────────┐   ┌──────────────┐
│ TaskQueue    │    │ AgentOrchestrator│   │ ToolRegistry │
│              │    │                  │   │              │
│ - Tasks Map  │    │ - 5 Agents       │   │ - 12 APIs    │
│ - Workflows  │    │ - Workflow Mgmt  │   │ - Connectors │
└──────┬───────┘    └────────┬─────────┘   └──────┬───────┘
       │                     │                     │
       │            ┌────────▼────────┐            │
       │            │  Agent Classes  │            │
       │            │                 │            │
       │            │ • DesignAgent   │            │
       │            │ • InfraAgent    │◄───────────┤
       │            │ • CodeAgent     │ Uses APIs  │
       │            │ • APIAgent      │            │
       │            │ • MobileAgent   │            │
       │            └────────┬────────┘            │
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  Claude API (AI)    Supabase (DB)    External APIs (12)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
DEV-TOOL-KIT-A2A/
├── server.js                    # Main application (1500+ lines)
├── package.json                 # Dependencies
├── .env                          # Environment variables (not committed)
├── supabase-schema.sql          # Database schema
├── API_DOCUMENTATION.md         # Complete API docs
├── IMPLEMENTATION_SUMMARY.md    # Technical implementation details
├── README.md                    # This file
└── .git/                        # Version control
```

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Engine**: Claude 3.5 Sonnet (Anthropic)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Render
- **Version Control**: Git/GitHub

---

## 📚 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Technical details
- [Supabase Schema](supabase-schema.sql) - Database setup

---

## 🌐 Deployment

### Render (Current)

The application is deployed on Render:
- **URL**: https://dev-tool-kit-a2a-2.onrender.com
- **Service ID**: srv-d3oisc0dl3ps73c0v6k0
- **Auto-deploy**: From `main` branch

### Deploy to Render

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your forked repository
4. Add environment variables in Render dashboard
5. Deploy!

### Deploy Elsewhere

Works on any Node.js hosting platform:
- Heroku
- Railway
- Vercel (with serverless functions)
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

---

## 🗄️ Database Setup

### Supabase

1. Create a Supabase project
2. Run the SQL in [supabase-schema.sql](supabase-schema.sql)
3. Copy your Supabase URL and anon key to `.env`

The schema includes:
- `projects` - Generated projects
- `project_versions` - Version history
- `workflows` - Workflow tracking
- `tasks` - Task management
- `api_tools` - API registry
- `user_preferences` - User settings

Row Level Security (RLS) policies are included for multi-tenancy.

---

## 🔐 Security

- Environment-based configuration (no hardcoded secrets)
- API key validation
- CORS enabled
- Supabase RLS policies for data isolation
- Rate limiting on API tool calls

---

## 🧪 Testing

```bash
# Check syntax
node -c server.js

# Run server
npm start

# Test health endpoint
curl http://localhost:3000/health

# Test workflow creation
curl -X POST http://localhost:3000/api/create-project \
  -H "Content-Type: application/json" \
  -d '{"description": "Build a simple todo app"}'
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Claude AI** by Anthropic - Powering all agent intelligence
- **Supabase** - Backend infrastructure
- **Render** - Hosting platform
- All the amazing open-source projects that make this possible

---

## 📞 Support

- **GitHub Issues**: [Create an issue](https://github.com/jeffwoolums/DEV-TOOL-KIT-A2A/issues)
- **Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Live Demo**: https://dev-tool-kit-a2a-2.onrender.com

---

## 🗺️ Roadmap

- [x] Agent-to-agent communication
- [x] Multi-agent orchestration
- [x] 12 API integrations
- [x] Project scaffolding (4 templates)
- [x] Supabase integration
- [x] Project versioning
- [ ] User authentication UI
- [ ] File download/export functionality
- [ ] Real-time collaboration
- [ ] More project templates
- [ ] CI/CD pipeline generation
- [ ] Docker containerization
- [ ] Kubernetes deployment configs

---

## 📊 Stats

- **Total Lines of Code**: ~1,700
- **API Endpoints**: 15+
- **AI Agents**: 5
- **Pre-integrated APIs**: 12
- **Project Templates**: 4
- **Workflow Phases**: 3

---

## 🎯 Use Cases

1. **Rapid Prototyping**: Generate complete app specifications in minutes
2. **Learning**: See how AI architects design applications
3. **Project Kickstart**: Get a complete scaffold for your next project
4. **API Discovery**: Explore 12 pre-integrated APIs
5. **Mobile Development**: Generate iOS, Android, and React Native code
6. **Infrastructure Planning**: Get DevOps recommendations
7. **Team Collaboration**: Save and version control AI-generated designs

---

**Built with ❤️ using Claude AI**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
