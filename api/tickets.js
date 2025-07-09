// Tickets endpoint for Vercel serverless functions - JSON storage only
import { getJsonStorage } from '../server/json-storage.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const storage = getJsonStorage();
    
    if (req.method === 'GET') {
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
      
      await storage.query(
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
  }
} 