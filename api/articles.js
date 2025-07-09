// Articles endpoint for Vercel serverless functions - JSON storage only
import { getJsonStorage } from '../server/json-storage.js';
import { randomUUID } from 'crypto';

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
      const result = await storage.query("SELECT * FROM knowledge_articles ORDER BY created_at DESC");
      
      // Transform database field names to match frontend expectations
      const articles = result.rows.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        category: article.category,
        tags: typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        views: article.views || 0
      }));
      
      res.json(articles);
    } else if (req.method === 'POST') {
      const { title, content, category, tags } = req.body;
      
      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Title, content, and category are required' });
      }
      
      const articleId = randomUUID();
      const now = new Date().toISOString();
      
      const result = await storage.query(
        `INSERT INTO knowledge_articles (id, title, content, category, tags, created_at, updated_at, views) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [articleId, title, content, category, JSON.stringify(tags || []), now, now, 0]
      );
      
      const newArticle = {
        id: articleId,
        title,
        content,
        category,
        tags: tags || [],
        createdAt: now,
        updatedAt: now,
        views: 0
      };
      
      res.status(201).json(newArticle);
    } else if (req.method === 'PUT') {
      const { id, title, content, category, tags } = req.body;
      
      if (!id || !title || !content || !category) {
        return res.status(400).json({ error: 'ID, title, content, and category are required' });
      }
      
      const now = new Date().toISOString();
      
      const result = await storage.query(
        `UPDATE knowledge_articles 
         SET title = ?, content = ?, category = ?, tags = ?, updated_at = ? 
         WHERE id = ?`,
        [title, content, category, JSON.stringify(tags || []), now, id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      const updatedArticle = {
        id,
        title,
        content,
        category,
        tags: tags || [],
        updatedAt: now
      };
      
      res.json(updatedArticle);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Article ID is required' });
      }
      
      const result = await storage.query(
        'DELETE FROM knowledge_articles WHERE id = ?',
        [id]
      );
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      res.json({ message: 'Article deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in articles endpoint:', error);
    res.status(500).json({ error: error.message });
  }
} 