import express from 'express';
import { Client } from 'pg';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
// Dynamic CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (isProduction) {
      // Allow all vercel.app subdomains for this project
      const allowedPatterns = [
        /^https:\/\/gdayai-support-.*\.vercel\.app$/,
        /^https:\/\/gdayai-support-hub\.vercel\.app$/
      ];
      
      if (allowedPatterns.some(pattern => pattern.test(origin))) {
        return callback(null, true);
      }
    } else {
      // Development origins
      const devOrigins = ['http://localhost:5174', 'http://localhost:3000'];
      if (devOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files in production
if (isProduction) {
  app.use(express.static('dist'));
}

// Database setup
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Connect to database
async function connectDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Initialize database tables
    await initializeTables();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Initialize database tables
async function initializeTables() {
  try {
    // Create tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('bug', 'feature')),
        status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'closed')) DEFAULT 'pending',
        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        submitter_name TEXT NOT NULL,
        submitter_email TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        archived INTEGER DEFAULT 0
      )
    `);

    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        is_admin_comment INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL,
        FOREIGN KEY (ticket_id) REFERENCES tickets (id)
      )
    `);

    // Create knowledge articles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS knowledge_articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        views INTEGER DEFAULT 0
      )
    `);

    // Insert initial knowledge articles if none exist
    const articlesResult = await client.query("SELECT COUNT(*) as count FROM knowledge_articles");
    if (parseInt(articlesResult.rows[0].count) === 0) {
      await insertInitialArticles();
    }
    
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}

// Insert initial knowledge articles
async function insertInitialArticles() {
  const articles = [
    {
      id: uuidv4(),
      title: "Getting Started with G'day AI",
      content: "Welcome to G'day AI! This guide will help you get started with our Open WebUI LLM tool. Learn how to create your first conversation, customize settings, and make the most of our AI assistant.",
      category: "Getting Started",
      tags: JSON.stringify(["beginner", "setup", "introduction"]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 45
    },
    {
      id: uuidv4(),
      title: "Advanced Prompt Engineering",
      content: "Learn advanced techniques for crafting effective prompts that get better results from G'day AI. Discover how to structure your requests, use context effectively, and optimize for specific use cases.",
      category: "Advanced",
      tags: JSON.stringify(["prompts", "advanced", "optimization"]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 32
    },
    {
      id: uuidv4(),
      title: "Troubleshooting Common Issues",
      content: "Having trouble with G'day AI? This article covers the most common issues users face and how to resolve them. From connection problems to unexpected responses, we've got you covered.",
      category: "Troubleshooting",
      tags: JSON.stringify(["help", "troubleshooting", "common-issues"]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 78
    }
  ];

  for (const article of articles) {
    await client.query(
      "INSERT INTO knowledge_articles (id, title, content, category, tags, created_at, updated_at, views) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [article.id, article.title, article.content, article.category, article.tags, article.created_at, article.updated_at, article.views]
    );
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-admin', () => {
    socket.join('admins');
    console.log('Admin joined:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// API Routes

// Get all tickets (non-archived only)
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM tickets WHERE archived = 0 ORDER BY created_at DESC");
    
    // Transform field names to match frontend expectations
    const tickets = result.rows.map(ticket => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      submitterName: ticket.submitter_name,
      submitterEmail: ticket.submitter_email,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      comments: [] // Empty array for list view
    }));
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get archived tickets (admin only)
app.get('/api/tickets/archived', async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM tickets WHERE archived = 1 ORDER BY updated_at DESC");
    
    // Transform field names to match frontend expectations
    const tickets = result.rows.map(ticket => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      submitterName: ticket.submitter_name,
      submitterEmail: ticket.submitter_email,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      archived: Boolean(ticket.archived),
      comments: [] // Empty array for list view
    }));
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single ticket with comments
app.get('/api/tickets/:id', async (req, res) => {
  const ticketId = req.params.id;
  
  try {
    const ticketResult = await client.query("SELECT * FROM tickets WHERE id = $1", [ticketId]);
    
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];
    const commentsResult = await client.query("SELECT * FROM comments WHERE ticket_id = $1 ORDER BY created_at ASC", [ticketId]);
    
    // Transform field names to match frontend expectations
    const transformedTicket = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      submitterName: ticket.submitter_name,
      submitterEmail: ticket.submitter_email,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      comments: commentsResult.rows.map(comment => ({
        id: comment.id,
        ticketId: comment.ticket_id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.created_at,
        isAdminComment: Boolean(comment.is_admin_comment)
      }))
    };
    
    res.json(transformedTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new ticket
app.post('/api/tickets', async (req, res) => {
  const { title, description, type, priority, submitterName, submitterEmail } = req.body;
  
  if (!title || !description || !type || !submitterName || !submitterEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const ticket = {
    id: uuidv4(),
    title,
    description,
    type,
    status: 'pending',
    priority: priority || 'medium',
    submitter_name: submitterName,
    submitter_email: submitterEmail,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    await client.query(
      "INSERT INTO tickets (id, title, description, type, status, priority, submitter_name, submitter_email, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [ticket.id, ticket.title, ticket.description, ticket.type, ticket.status, ticket.priority, ticket.submitter_name, ticket.submitter_email, ticket.created_at, ticket.updated_at]
    );
    
    // Transform field names to match frontend expectations
    const transformedTicket = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      submitterName: ticket.submitter_name,
      submitterEmail: ticket.submitter_email,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      comments: []
    };
    
    // Notify admins of new ticket
    io.to('admins').emit('new-ticket', transformedTicket);
    
    res.status(201).json(transformedTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
app.put('/api/tickets/:id', async (req, res) => {
  const ticketId = req.params.id;
  const { status, priority } = req.body;
  
  const updates = [];
  const values = [];
  let paramIndex = 1;
  
  if (status) {
    updates.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (priority) {
    updates.push(`priority = $${paramIndex++}`);
    values.push(priority);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid updates provided' });
  }
  
  updates.push(`updated_at = $${paramIndex++}`);
  values.push(new Date().toISOString());
  values.push(ticketId);
  
  try {
    await client.query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
    
    // Get updated ticket and broadcast
    const ticketResult = await client.query("SELECT * FROM tickets WHERE id = $1", [ticketId]);
    if (ticketResult.rows.length > 0) {
      const ticket = ticketResult.rows[0];
      const transformedTicket = {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        type: ticket.type,
        status: ticket.status,
        priority: ticket.priority,
        submitterName: ticket.submitter_name,
        submitterEmail: ticket.submitter_email,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        comments: []
      };
      io.emit('ticket-updated', transformedTicket);
    }
    
    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to ticket
app.post('/api/tickets/:id/comments', async (req, res) => {
  const ticketId = req.params.id;
  const { author, content, isAdminComment } = req.body;
  
  if (!author || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const comment = {
    id: uuidv4(),
    ticket_id: ticketId,
    author,
    content,
    is_admin_comment: isAdminComment ? 1 : 0,
    created_at: new Date().toISOString()
  };

  try {
    await client.query(
      "INSERT INTO comments (id, ticket_id, author, content, is_admin_comment, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [comment.id, comment.ticket_id, comment.author, comment.content, comment.is_admin_comment, comment.created_at]
    );
    
    // Update ticket's updated_at
    await client.query("UPDATE tickets SET updated_at = $1 WHERE id = $2", [new Date().toISOString(), ticketId]);
    
    // Transform field names to match frontend expectations
    const transformedComment = {
      id: comment.id,
      ticketId: comment.ticket_id,
      author: comment.author,
      content: comment.content,
      createdAt: comment.created_at,
      isAdminComment: Boolean(comment.is_admin_comment)
    };
    
    // Broadcast comment to all users
    io.emit('new-comment', transformedComment);
    
    res.status(201).json(transformedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Archive ticket
app.patch('/api/tickets/:id/archive', async (req, res) => {
  const ticketId = req.params.id;
  
  try {
    const result = await client.query("UPDATE tickets SET archived = 1, updated_at = $1 WHERE id = $2 AND archived = 0", [new Date().toISOString(), ticketId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found or already archived' });
    }
    
    // Broadcast ticket archival to all users
    io.emit('ticket-archived', { id: ticketId });
    
    res.json({ message: 'Ticket archived successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore archived ticket
app.patch('/api/tickets/:id/restore', async (req, res) => {
  const ticketId = req.params.id;
  
  try {
    const result = await client.query("UPDATE tickets SET archived = 0, updated_at = $1 WHERE id = $2 AND archived = 1", [new Date().toISOString(), ticketId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Archived ticket not found' });
    }
    
    // Get restored ticket and broadcast
    const ticketResult = await client.query("SELECT * FROM tickets WHERE id = $1", [ticketId]);
    if (ticketResult.rows.length > 0) {
      const ticket = ticketResult.rows[0];
      const transformedTicket = {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        type: ticket.type,
        status: ticket.status,
        priority: ticket.priority,
        submitterName: ticket.submitter_name,
        submitterEmail: ticket.submitter_email,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        archived: Boolean(ticket.archived),
        comments: []
      };
      io.emit('ticket-restored', transformedTicket);
    }
    
    res.json({ message: 'Ticket restored successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Permanently delete ticket (admin only)
app.delete('/api/tickets/:id/permanent', async (req, res) => {
  const ticketId = req.params.id;
  
  try {
    // First, delete all comments associated with the ticket
    await client.query("DELETE FROM comments WHERE ticket_id = $1", [ticketId]);
    
    // Then permanently delete the ticket (only if archived)
    const result = await client.query("DELETE FROM tickets WHERE id = $1 AND archived = 1", [ticketId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Archived ticket not found' });
    }
    
    // Broadcast permanent deletion to admins
    io.to('admins').emit('ticket-deleted-permanently', { id: ticketId });
    
    res.json({ message: 'Ticket permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all knowledge articles
app.get('/api/articles', async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM knowledge_articles ORDER BY created_at DESC");
    
    // Parse tags from JSON string and transform field names
    const articles = result.rows.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      tags: JSON.parse(article.tags),
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      views: article.views
    }));
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article views
app.post('/api/articles/:id/view', async (req, res) => {
  const articleId = req.params.id;
  
  try {
    await client.query("UPDATE knowledge_articles SET views = views + 1 WHERE id = $1", [articleId]);
    res.json({ message: 'View count updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes in production
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

// Connect to database and start server
connectDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await client.end();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 