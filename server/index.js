import express from 'express';
import { Client } from 'pg';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { getTursoClient } from './turso-client.js';
import { getJsonStorage } from './json-storage.js';

const app = express();

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

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database connection function (per-request in serverless)
async function getDbClient() {
  // Option 1: Turso (SQLite edge database - recommended)
  if (process.env.TURSO_DATABASE_URL) {
    return getTursoClient();
  }
  
  // Option 2: PostgreSQL (traditional)
  if (process.env.DATABASE_URL) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });
    await client.connect();
    return client;
  }
  
  // Option 3: JSON files (zero setup - perfect for vibe coding)
  console.log('🗂️  No database configured, using JSON file storage');
  return getJsonStorage();
}

// Initialize database tables
async function initializeTables(client) {
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
        archived BOOLEAN DEFAULT FALSE
      )
    `);

    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        is_admin_comment BOOLEAN DEFAULT FALSE,
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
      await insertInitialArticles(client);
    }
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}

// Insert initial knowledge articles
async function insertInitialArticles(client) {
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

// API Routes

// Get all tickets
app.get('/api/tickets', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const result = await client.query("SELECT * FROM tickets WHERE archived = false ORDER BY created_at DESC");
    
    // Transform database field names to match frontend expectations
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
      comments: []
    }));
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Get archived tickets
app.get('/api/tickets/archived', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const result = await client.query("SELECT * FROM tickets WHERE archived = true ORDER BY created_at DESC");
    
    // Transform database field names to match frontend expectations
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
      comments: []
    }));
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching archived tickets:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Get specific ticket with comments
app.get('/api/tickets/:id', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const ticketId = req.params.id;
    
    // Get ticket
    const ticketResult = await client.query("SELECT * FROM tickets WHERE id = $1", [ticketId]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get comments
    const commentsResult = await client.query("SELECT * FROM comments WHERE ticket_id = $1 ORDER BY created_at ASC", [ticketId]);
    
    const ticket = ticketResult.rows[0];
    const comments = commentsResult.rows.map(comment => ({
      id: comment.id,
      ticketId: comment.ticket_id,
      author: comment.author,
      content: comment.content,
      isAdminComment: Boolean(comment.is_admin_comment),
      createdAt: comment.created_at
    }));
    
    // Transform database field names to match frontend expectations
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
      comments: comments
    };
    
    res.json(transformedTicket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Create new ticket
app.post('/api/tickets', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const { title, description, type, priority, submitterName, submitterEmail } = req.body;
    
    const ticket = {
      id: uuidv4(),
      title,
      description,
      type,
      status: 'pending',
      priority,
      submitterName,
      submitterEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false
    };
    
    await client.query(
      "INSERT INTO tickets (id, title, description, type, status, priority, submitter_name, submitter_email, created_at, updated_at, archived) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [ticket.id, ticket.title, ticket.description, ticket.type, ticket.status, ticket.priority, ticket.submitterName, ticket.submitterEmail, ticket.createdAt, ticket.updatedAt, ticket.archived]
    );
    
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Update ticket
app.put('/api/tickets/:id', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const ticketId = req.params.id;
    const { title, description, type, status, priority } = req.body;
    const updatedAt = new Date().toISOString();
    
    const result = await client.query(
      "UPDATE tickets SET title = $1, description = $2, type = $3, status = $4, priority = $5, updated_at = $6 WHERE id = $7",
      [title, description, type, status, priority, updatedAt, ticketId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Add comment to ticket
app.post('/api/tickets/:id/comments', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const ticketId = req.params.id;
    const { author, content, isAdminComment } = req.body;
    
    const comment = {
      id: uuidv4(),
      ticketId,
      author,
      content,
      isAdminComment: Boolean(isAdminComment),
      createdAt: new Date().toISOString()
    };
    
    await client.query(
      "INSERT INTO comments (id, ticket_id, author, content, is_admin_comment, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [comment.id, comment.ticketId, comment.author, comment.content, comment.isAdminComment, comment.createdAt]
    );
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Archive ticket
app.patch('/api/tickets/:id/archive', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const ticketId = req.params.id;
    
    const result = await client.query("UPDATE tickets SET archived = true, updated_at = $1 WHERE id = $2 AND archived = false", [new Date().toISOString(), ticketId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found or already archived' });
    }
    
    res.json({ message: 'Ticket archived successfully' });
  } catch (error) {
    console.error('Error archiving ticket:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Restore archived ticket
app.patch('/api/tickets/:id/restore', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const ticketId = req.params.id;
    
    const result = await client.query("UPDATE tickets SET archived = false, updated_at = $1 WHERE id = $2 AND archived = true", [new Date().toISOString(), ticketId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Archived ticket not found' });
    }
    
    res.json({ message: 'Ticket restored successfully' });
  } catch (error) {
    console.error('Error restoring ticket:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Permanently delete ticket (admin only)
app.delete('/api/tickets/:id/permanent', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const ticketId = req.params.id;
    
    // First, delete all comments associated with the ticket
    await client.query("DELETE FROM comments WHERE ticket_id = $1", [ticketId]);
    
    // Then permanently delete the ticket (only if archived)
    const result = await client.query("DELETE FROM tickets WHERE id = $1 AND archived = true", [ticketId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Archived ticket not found' });
    }
    
    res.json({ message: 'Ticket permanently deleted' });
  } catch (error) {
    console.error('Error permanently deleting ticket:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Get all knowledge articles
app.get('/api/articles', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
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
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Update article views
app.post('/api/articles/:id/view', async (req, res) => {
  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    const articleId = req.params.id;
    
    await client.query("UPDATE knowledge_articles SET views = views + 1 WHERE id = $1", [articleId]);
    res.json({ message: 'View count updated' });
  } catch (error) {
    console.error('Error updating article views:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) await client.end();
  }
});

// Health check endpoint with database testing
app.get('/api/health', async (req, res) => {
  let client;
  try {
    console.log('🔍 Health check requested');
    console.log('Environment:', process.env.NODE_ENV || 'not set');
    console.log('TURSO_DATABASE_URL present:', !!process.env.TURSO_DATABASE_URL);
    console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
    
    client = await getDbClient();
    await initializeTables(client);
    
    // Determine storage type
    let storageType = 'JSON files';
    if (process.env.TURSO_DATABASE_URL) {
      storageType = 'Turso (SQLite Edge)';
    } else if (process.env.DATABASE_URL) {
      storageType = 'PostgreSQL';
    }
    
    // Test database connection
    const ticketCount = await client.query('SELECT COUNT(*) as count FROM tickets');
    const articleCount = await client.query('SELECT COUNT(*) as count FROM knowledge_articles');
    
    res.json({
      status: 'healthy',
      storage_type: storageType,
      database: 'connected',
      server_time: new Date().toISOString(),
      ticket_count: ticketCount.rows[0].count,
      article_count: articleCount.rows[0].count,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code,
      environment: process.env.NODE_ENV || 'not set',
      turso_url_present: !!process.env.TURSO_DATABASE_URL,
      database_url_present: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (client) await client.end();
  }
});

// For development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel
export default app; 