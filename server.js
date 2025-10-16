const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
            <p>Creates technical specifications and architecture plans</p>
          </div>
          <div class="card">
            <h3>☁️ Infrastructure Agent</h3>
            <p>Plans backend services, databases, and deployment</p>
          </div>
          <div class="card">
            <h3>💻 Code Agent</h3>
            <p>Generates complete application code ready to deploy</p>
          </div>
        </div>
        
        <input type="text" placeholder="Describe your application (e.g., Build a real-time chat app)">
        <button onclick="alert('AI Agents will be configured soon!')">Build with AI Agents</button>
        
        <p style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 10px;">
          <strong>Status:</strong> Server running on Render<br>
          <strong>Supabase:</strong> ${process.env.SUPABASE_URL ? 'Connected' : 'Not configured'}<br>
          <strong>Claude AI:</strong> ${process.env.CLAUDE_API_KEY ? 'Ready' : 'Not configured'}
        </p>
      </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'dev-tool-kit-a2a-2',
    supabase: process.env.SUPABASE_URL ? 'connected' : 'not configured',
    claude: process.env.CLAUDE_API_KEY ? 'ready' : 'not configured'
  });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Supabase:', process.env.SUPABASE_URL ? 'Connected' : 'Not configured');
  console.log('Claude:', process.env.CLAUDE_API_KEY ? 'Ready' : 'Not configured');
});
