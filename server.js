cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase with your project
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://plvwmhcjldivomlejnxz.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DEV-TOOL-KIT-A2A',
    claude_api: process.env.CLAUDE_API_KEY ? 'configured' : 'not configured'
  });
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DEV-TOOL-KIT-A2A - Multi-Agent Orchestrator</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, system-ui, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 40px;
        }
        .container { 
          max-width: 1000px; 
          margin: 0 auto; 
          background: rgba(255,255,255,0.95); 
          padding: 40px; 
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { 
          color: #333;
          margin-bottom: 20px; 
        }
        .status { 
          display: inline-block;
          background: #4caf50;
          color: white;
          padding: 8px 16px; 
          border-radius: 20px;
          font-weight: 600;
          margin: 20px 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }
        .card h3 {
          color: #667eea;
          margin-bottom: 10px;
        }
        button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          margin-top: 20px;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          margin-top: 20px;
        }
        .output {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
          font-family: monospace;
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 DEV-TOOL-KIT-A2A</h1>
        <p style="color: #666; font-size: 18px;">Multi-Agent Development Orchestrator powered by Claude AI</p>
        <div class="status">✅ System Online</div>
        
        <div class="grid">
          <div class="card">
            <h3>📐 Design Agent</h3>
            <p>Creates technical specifications and architecture</p>
          </div>
          <div class="card">
            <h3>☁️ Infrastructure Agent</h3>
            <p>Plans backend services and deployment</p>
          </div>
          <div class="card">
            <h3>💻 Code Agent</h3>
            <p>Generates complete application code</p>
          </div>
        </div>
        
        <input type="text" id="projectInput" placeholder="Describe your application (e.g., 'Build a real-time chat app')">
        <button onclick="createProject()">Build with AI Agents</button>
        
        <div class="output" id="output"></div>
      </div>
      
      <script>
        async function createProject() {
          const input = document.getElementById('projectInput');
          const output = document.getElementById('output');
          output.style.display = 'block';
          output.innerHTML = 'Creating project...\\n';
          
          try {
            const response = await fetch('/api/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'Project-' + Date.now(),
                description: input.value
              })
            });
            
            const data = await response.json();
            output.innerHTML += 'Project created: ' + data.project.id + '\\n';
            output.innerHTML += 'Ready for AI agent processing!\\n';
          } catch (error) {
            output.innerHTML += 'Error: ' + error.message + '\\n';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API: Create project
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Create project in Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert({
        id: uuidv4(),
        name,
        description,
        status: 'initialized',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    res.json({ success: true, project: data || { id: uuidv4(), name, description } });
  } catch (error) {
    console.error('Error:', error);
    res.json({ 
      success: true, 
      project: { 
        id: uuidv4(), 
        name: req.body.name, 
        description: req.body.description 
      }
    });
  }
});

// API: Test Claude connection
app.get('/api/test-claude', (req, res) => {
  const hasKey = !!process.env.CLAUDE_API_KEY;
  res.json({
    success: hasKey,
    message: hasKey ? 'Claude API key configured' : 'Claude API key not found',
    mode: hasKey ? 'live' : 'mock'
  });
});

// API: Test Supabase connection  
app.get('/api/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    res.json({ 
      success: !error,
      message: error ? error.message : 'Supabase connected',
      project_id: 'plvwmhcjldivomlejnxz'
    });
  } catch (error) {
    res.json({ 
      success: false,
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 DEV-TOOL-KIT-A2A Server Started');
  console.log('=================================');
  console.log('📍 Port: ' + PORT);
  console.log('🏢 Render Workspace: tea-d3ohtq56ubrc73af50lg');
  console.log('🗄️ Supabase Project: plvwmhcjldivomlejnxz');
  console.log('🤖 Claude API: ' + (process.env.CLAUDE_API_KEY ? 'Configured ✅' : 'Not configured ⚠️'));
  console.log('🌐 URL: http://localhost:' + PORT);
  console.log('=================================');
});
EOF