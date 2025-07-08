// Articles endpoint for Vercel serverless functions
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
      "INSERT INTO knowledge_articles (id, title, content, category, tags, created_at, updated_at, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [article.id, article.title, article.content, article.category, article.tags, article.created_at, article.updated_at, article.views]
    );
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

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

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
    if (client && client.end) {
      await client.end();
    }
  }
} 