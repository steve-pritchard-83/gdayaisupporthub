// Individual ticket operations for Vercel serverless functions - JSON storage only
import { getJsonStorage } from '../../server/json-storage.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  
  try {
    const storage = getJsonStorage();
    
    if (req.method === 'GET') {
      // Get specific ticket with comments
      const ticketResult = await storage.query("SELECT * FROM tickets WHERE id = ?", [id]);
      
      if (ticketResult.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      const ticket = ticketResult.rows[0];
      const commentsResult = await storage.query("SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC", [id]);
      
      const response = {
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
        comments: commentsResult.rows.map(comment => ({
          id: comment.id,
          ticketId: comment.ticket_id,
          author: comment.author,
          content: comment.content,
          isAdminComment: Boolean(comment.is_admin_comment),
          createdAt: comment.created_at
        }))
      };
      
      res.json(response);
    } else if (req.method === 'PUT') {
      // Update ticket
      const { status, priority } = req.body;
      
      const result = await storage.query(
        "UPDATE tickets SET status = ?, priority = ?, updated_at = ? WHERE id = ?",
        [status, priority, new Date().toISOString(), id]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      
      res.json({ message: 'Ticket updated successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in ticket operations:', error);
    res.status(500).json({ error: error.message });
  }
} 