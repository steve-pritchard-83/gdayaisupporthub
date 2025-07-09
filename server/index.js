import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
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
      const devOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
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

// JSON storage function - perfect for vibe coding
function getDbClient() {
  console.log('🗂️  Using JSON file storage');
  return getJsonStorage();
}

// JSON storage is automatically initialized in the constructor

// Initial articles are automatically created by JSON storage

// API Routes

// Get all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const storage = getDbClient();
    
    const result = await storage.query("SELECT * FROM tickets WHERE archived = false ORDER BY created_at DESC");
    
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
  }
});

// Get archived tickets
app.get('/api/tickets/archived', async (req, res) => {
  try {
    const storage = getDbClient();
    
    const result = await storage.query("SELECT * FROM tickets WHERE archived = true ORDER BY created_at DESC");
    
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
  }
});

// Get specific ticket with comments
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const storage = getDbClient();
    const ticketId = req.params.id;
    
    // Get ticket
    const ticketResult = await storage.query("SELECT * FROM tickets WHERE id = ?", [ticketId]);
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get comments
    const commentsResult = await storage.query("SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC", [ticketId]);
    
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
  }
});

// Create new ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const storage = getDbClient();
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
    
    await storage.query(
      "INSERT INTO tickets (id, title, description, type, status, priority, submitter_name, submitter_email, created_at, updated_at, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [ticket.id, ticket.title, ticket.description, ticket.type, ticket.status, ticket.priority, ticket.submitterName, ticket.submitterEmail, ticket.createdAt, ticket.updatedAt, ticket.archived]
    );
    
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const storage = getDbClient();
    const ticketId = req.params.id;
    const { title, description, type, status, priority } = req.body;
    const updatedAt = new Date().toISOString();
    
    const result = await storage.query(
      "UPDATE tickets SET title = ?, description = ?, type = ?, status = ?, priority = ?, updated_at = ? WHERE id = ?",
      [title, description, type, status, priority, updatedAt, ticketId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add comment to ticket
app.post('/api/tickets/:id/comments', async (req, res) => {
  try {
    const storage = getDbClient();
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
    
    await storage.query(
      "INSERT INTO comments (id, ticket_id, author, content, is_admin_comment, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [comment.id, comment.ticketId, comment.author, comment.content, comment.isAdminComment, comment.createdAt]
    );
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Archive ticket
app.patch('/api/tickets/:id/archive', async (req, res) => {
  try {
    const storage = getDbClient();
    const ticketId = req.params.id;
    
    const result = await storage.query(
      "UPDATE tickets SET archived = true, updated_at = ? WHERE id = ?",
      [new Date().toISOString(), ticketId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket archived successfully' });
  } catch (error) {
    console.error('Error archiving ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Restore archived ticket
app.patch('/api/tickets/:id/restore', async (req, res) => {
  try {
    const storage = getDbClient();
    const ticketId = req.params.id;
    
    const result = await storage.query(
      "UPDATE tickets SET archived = false, updated_at = ? WHERE id = ?",
      [new Date().toISOString(), ticketId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket restored successfully' });
  } catch (error) {
    console.error('Error restoring ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Permanently delete ticket (only archived tickets)
app.delete('/api/tickets/:id/permanent', async (req, res) => {
  try {
    const storage = getDbClient();
    const ticketId = req.params.id;
    
    const result = await storage.query(
      "DELETE FROM tickets WHERE id = ? AND archived = true",
      [ticketId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found or not archived' });
    }
    
    res.json({ message: 'Ticket permanently deleted' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all knowledge articles
app.get('/api/articles', async (req, res) => {
  try {
    const storage = getDbClient();
    
    const result = await storage.query("SELECT * FROM knowledge_articles ORDER BY created_at DESC");
    
    // Parse tags from JSON string and transform field names
    const articles = result.rows.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      tags: typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      views: article.views
    }));
    
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Increment article view count
app.post('/api/articles/:id/view', async (req, res) => {
  try {
    const storage = getDbClient();
    const articleId = req.params.id;
    
    const result = await storage.query(
      "UPDATE knowledge_articles SET views = views + 1 WHERE id = ?",
      [articleId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ message: 'View count incremented' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const storage = getDbClient();
    
    const ticketResult = await storage.query("SELECT COUNT(*) as count FROM tickets");
    const articleResult = await storage.query("SELECT COUNT(*) as count FROM knowledge_articles");
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      storage_type: 'json_files',
      ticket_count: ticketResult.rows[0].count,
      article_count: articleResult.rows[0].count,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: error.message });
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