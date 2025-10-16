# AI Development Studio Orchestrator

A sophisticated multi-agent system built with Google Agent Development Kit (ADK) that manages the entire lifecycle of application development from idea to code.

## Architecture

The system is structured as a hierarchical multi-agent system with specialized compartments:

### Root Agent: ProjectManager
- Main orchestrator managing the development workflow
- Uses Gemini 2.5 Flash for optimal performance
- Controls sequential execution of sub-agents

### Specialized Agents
1. **DesignAgent**
   - Translates user requests into technical specifications
   - Integrates with IdeaGeneratorTool for creative augmentation
   - Produces structured technical plans

2. **InfraAgent**
   - Manages infrastructure setup
   - Handles Firestore database configuration
   - Configures Cloud Run deployments
   - Requires user approval for critical operations

3. **CodeAgent**
   - Generates production-ready application code
   - Creates single-file HTML/JS/CSS applications
   - Implements Tailwind CSS for modern styling

### Specialized Tools
- **IdeaGeneratorTool**: AI-powered feature ideation
- Built-in error handling with exponential backoff
- Structured JSON output format

## Requirements

- Python 3.8+
- Google ADK
- Google Cloud Project with enabled APIs:
  - Gemini API
  - Firestore
  - Cloud Run

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Unix/macOS
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
- Copy `.env.example` to `.env`
- Add your Gemini API key
- Add your Google Cloud Project ID

## Usage

1. Test the system:
```bash
python test_agent.py
```

2. Run with ADK CLI:
```bash
adk run
```

3. Use the web interface:
```bash
adk web
```

Example request:
```python
request = {
    "goal": "Build a task list app",
    "project_name": "TaskMaster"
}
```

## Development Workflow

1. **Design Phase**
   - User request analysis
   - Feature ideation
   - Technical specification generation

2. **Infrastructure Phase**
   - Database schema design
   - Cloud infrastructure planning
   - Security configuration
   - User approval checkpoint

3. **Code Generation Phase**
   - Application code generation
   - Style implementation
   - Integration with infrastructure

4. **Verification**
   - Code quality checks
   - Security validation
   - Deployment readiness assessment

## Security Best Practices

- Store API keys in `.env` file (never commit)
- Review all infrastructure changes
- Validate generated code
- Follow least-privilege principle

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
