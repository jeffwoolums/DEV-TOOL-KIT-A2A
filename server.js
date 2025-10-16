cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://plvwmhcjldivomlejnxz.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-key-here'
);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'DEV-TOOL-KIT-A2A Multi-Agent Orchestrator is running!'
  });
});

// Home route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DEV-TOOL-KIT-A2A</title>
      <style>
        body { font-family: system-ui; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; }
        h1 { margin-bottom: 20px; }
        .status { background: rgba(0,255,0,0.2); padding: 10px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 DEV-TOOL-KIT-A2A</h1>
        <p>Multi-Agent Development Orchestrator</p>
        <div class="status">✅ System Online</div>
        <p>Endpoints available:</p>
        <ul>
          <li>/health - System health check</li>
          <li>/api/projects - Project management</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// API Routes
app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = {
      id: uuidv4(),
      name,
      description,
      created_at: new Date().toISOString()
    };
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 DEV-TOOL-KIT-A2A Server running on port ' + PORT);
  console.log('📍 Render Workspace: tea-d3ohtq56ubrc73af50lg');
  console.log('🗄️ Supabase Project: plvwmhcjldivomlejnxz');
});
EOF