// Tickets endpoint for Vercel serverless functions
import { getTursoClient } from '../server/turso-client.js';
import { getJsonStorage } from '../server/json-storage.js';
import { v4 as uuidv4 } from 'uuid';

async function getDbClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return getTursoClient();
  }
  
  console.log('🗂️  No database configured, using JSON file storage');
  return getJsonStorage();
}

async function initializeTables(client) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        submitter_name TEXT NOT NULL,
        submitter_email TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        archived BOOLEAN DEFAULT FALSE
      )
    `);
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let client;
  try {
    client = await getDbClient();
    await initializeTables(client);
    
    if (req.method === 'GET') {
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
    } else if (req.method === 'POST') {
      const { title, description, type, priority, submitterName, submitterEmail } = req.body;
      
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
        updated_at: new Date().toISOString(),
        archived: false
      };
      
      await client.query(
        "INSERT INTO tickets (id, title, description, type, status, priority, submitter_name, submitter_email, created_at, updated_at, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [ticket.id, ticket.title, ticket.description, ticket.type, ticket.status, ticket.priority, ticket.submitter_name, ticket.submitter_email, ticket.created_at, ticket.updated_at, ticket.archived]
      );
      
      res.status(201).json({
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
        archived: ticket.archived
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in tickets endpoint:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client && client.end) {
      await client.end();
    }
  }
} 