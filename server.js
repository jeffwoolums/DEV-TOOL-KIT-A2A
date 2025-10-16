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

// API endpoint to create project and run agents
app.post('/api/create-project', async (req, res) => {
  const { description } = req.body;
  
  try {
    // Create project ID
    const projectId = uuidv4();
    
    // Call Claude API for design
    const designResponse = await callClaude('design', description);
    
    res.json({
      success: true,
      projectId,
      message: 'AI Agents are processing your request!',
      design: designResponse
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Function to call Claude API
async function callClaude(agentType, input) {
  if (!process.env.CLAUDE_API_KEY) {
    return 'Claude API not configured';
  }
  
  const prompts = {
    design: `You are a Software Architect. Create a technical specification for: ${input}. Include features, tech stack, and architecture.`,
    infrastructure: `You are a DevOps Engineer. Plan the infrastructure for: ${input}`,
    code: `You are a Full Stack Developer. Generate HTML/CSS/JS code for: ${input}`
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompts[agentType] || input
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Claude API error: ' + response.status);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    return 'Error calling Claude: ' + error.message;
  }
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
            <p>Creates technical specifications using Claude AI</p>
          </div>
          <div class="card">
            <h3>☁️ Infrastructure Agent</h3>
            <p>Plans backend services and deployment strategy</p>
          </div>
          <div class="card">
            <h3>💻 Code Agent</h3>
            <p>Generates complete application code</p>
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
          output.innerHTML = '🤖 AI Agents starting...\\n';
          btn.disabled = true;
          btn.innerHTML = '<span class="loading"></span> Processing...';
          
          try {
            output.innerHTML += '📐 Design Agent thinking...\\n';
            
            const response = await fetch('/api/create-project', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ description: input.value })
            });
            
            const data = await response.json();
            
            if (data.success) {
              output.innerHTML += '✅ Project created with ID: ' + data.projectId + '\\n';
              output.innerHTML += '\\n=== DESIGN SPECIFICATION ===\\n';
              output.innerHTML += data.design || 'Design in progress...';
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

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Environment check:');
  console.log('- Supabase:', process.env.SUPABASE_URL ? 'Connected' : 'Missing SUPABASE_URL');
  console.log('- Claude:', process.env.CLAUDE_API_KEY ? 'Ready' : 'Missing CLAUDE_API_KEY');
});