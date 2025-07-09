import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Super simple JSON file storage - perfect for vibe coding
class JsonStorage {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.ticketsFile = path.join(this.dataDir, 'tickets.json');
    this.articlesFile = path.join(this.dataDir, 'articles.json');
    this.commentsFile = path.join(this.dataDir, 'comments.json');
    
    // Initialize files synchronously in constructor
    this.initSync();
  }
  
  initSync() {
    try {
      // Create directory if it doesn't exist
      if (!fsSync.existsSync(this.dataDir)) {
        fsSync.mkdirSync(this.dataDir, { recursive: true });
      }
      
      // Initialize files if they don't exist
      if (!fsSync.existsSync(this.ticketsFile)) {
        fsSync.writeFileSync(this.ticketsFile, JSON.stringify([], null, 2));
      }
      if (!fsSync.existsSync(this.articlesFile)) {
        fsSync.writeFileSync(this.articlesFile, JSON.stringify(this.getDefaultArticles(), null, 2));
      }
      if (!fsSync.existsSync(this.commentsFile)) {
        fsSync.writeFileSync(this.commentsFile, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error('Error initializing JSON storage:', error);
    }
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize files if they don't exist
      await this.ensureFileExists(this.ticketsFile, []);
      await this.ensureFileExists(this.articlesFile, this.getDefaultArticles());
      await this.ensureFileExists(this.commentsFile, []);
    } catch (error) {
      console.error('Error initializing JSON storage:', error);
    }
  }

  async ensureFileExists(filePath, defaultData) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  async readJson(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return [];
    }
  }

  async writeJson(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
    }
  }

  // Mock database query interface
  async query(sql, params = []) {
    // Super basic SQL parsing for common operations
    const sqlLower = sql.toLowerCase();
    
    // Handle COUNT queries first
    if (sqlLower.includes('select count(*) as count from tickets')) {
      const tickets = await this.readJson(this.ticketsFile);
      return { rows: [{ count: tickets.length }] };
    }
    
    if (sqlLower.includes('select count(*) as count from knowledge_articles')) {
      const articles = await this.readJson(this.articlesFile);
      return { rows: [{ count: articles.length }] };
    }
    
    if (sqlLower.includes('select count(*) as count from comments')) {
      const comments = await this.readJson(this.commentsFile);
      return { rows: [{ count: comments.length }] };
    }
    
    if (sqlLower.includes('select * from tickets')) {
      const tickets = await this.readJson(this.ticketsFile);
      
      if (sqlLower.includes('where archived = false')) {
        return { rows: tickets.filter(t => !t.archived) };
      }
      if (sqlLower.includes('where archived = true')) {
        return { rows: tickets.filter(t => t.archived) };
      }
      if (sqlLower.includes('where id = ?')) {
        const ticket = tickets.find(t => t.id === params[0]);
        return { rows: ticket ? [ticket] : [] };
      }
      
      return { rows: tickets };
    }
    
    if (sqlLower.includes('select * from comments')) {
      const comments = await this.readJson(this.commentsFile);
      
      if (sqlLower.includes('where ticket_id = ?')) {
        return { rows: comments.filter(c => c.ticket_id === params[0]) };
      }
      
      return { rows: comments };
    }
    
    if (sqlLower.includes('select * from knowledge_articles')) {
      const articles = await this.readJson(this.articlesFile);
      return { rows: articles };
    }
    
    if (sqlLower.includes('update knowledge_articles set views = views + 1')) {
      const articles = await this.readJson(this.articlesFile);
      const articleIndex = articles.findIndex(a => a.id === params[0]);
      
      if (articleIndex !== -1) {
        articles[articleIndex].views += 1;
        await this.writeJson(this.articlesFile, articles);
        return { rowCount: 1 };
      }
      
      return { rowCount: 0 };
    }
    
    if (sqlLower.includes('insert into tickets')) {
      const tickets = await this.readJson(this.ticketsFile);
      const newTicket = {
        id: params[0],
        title: params[1],
        description: params[2],
        type: params[3],
        status: params[4],
        priority: params[5],
        submitter_name: params[6],
        submitter_email: params[7],
        created_at: params[8],
        updated_at: params[9],
        archived: false
      };
      
      tickets.push(newTicket);
      await this.writeJson(this.ticketsFile, tickets);
      return { rows: [newTicket] };
    }
    
    if (sqlLower.includes('update tickets')) {
      const tickets = await this.readJson(this.ticketsFile);
      const ticketIndex = tickets.findIndex(t => t.id === params[params.length - 1]);
      
      if (ticketIndex !== -1) {
        if (sqlLower.includes('archived = true')) {
          tickets[ticketIndex].archived = true;
        }
        if (sqlLower.includes('archived = false')) {
          tickets[ticketIndex].archived = false;
        }
        if (params.length > 1) {
          tickets[ticketIndex].status = params[0] || tickets[ticketIndex].status;
          tickets[ticketIndex].priority = params[1] || tickets[ticketIndex].priority;
          tickets[ticketIndex].updated_at = new Date().toISOString();
        }
        
        await this.writeJson(this.ticketsFile, tickets);
        return { rows: [tickets[ticketIndex]], rowCount: 1 };
      }
      
      return { rows: [], rowCount: 0 };
    }
    
    if (sqlLower.includes('delete from tickets')) {
      const tickets = await this.readJson(this.ticketsFile);
      const ticketIndex = tickets.findIndex(t => t.id === params[0] && t.archived === true);
      
      if (ticketIndex !== -1) {
        tickets.splice(ticketIndex, 1);
        await this.writeJson(this.ticketsFile, tickets);
        return { rowCount: 1 };
      }
      
      return { rowCount: 0 };
    }
    
    if (sqlLower.includes('delete from comments where ticket_id')) {
      const comments = await this.readJson(this.commentsFile);
      const originalLength = comments.length;
      const filteredComments = comments.filter(c => c.ticket_id !== params[0]);
      
      if (filteredComments.length !== originalLength) {
        await this.writeJson(this.commentsFile, filteredComments);
        return { rowCount: originalLength - filteredComments.length };
      }
      
      return { rowCount: 0 };
    }
    
    if (sqlLower.includes('insert into comments')) {
      const comments = await this.readJson(this.commentsFile);
      const newComment = {
        id: params[0],
        ticket_id: params[1],
        author: params[2],
        content: params[3],
        is_admin_comment: params[4],
        created_at: params[5]
      };
      
      comments.push(newComment);
      await this.writeJson(this.commentsFile, comments);
      return { rows: [newComment] };
    }
    
    if (sqlLower.includes('insert into knowledge_articles')) {
      const articles = await this.readJson(this.articlesFile);
      const newArticle = {
        id: params[0],
        title: params[1],
        content: params[2],
        category: params[3],
        tags: params[4],
        created_at: params[5],
        updated_at: params[6],
        views: params[7]
      };
      
      articles.push(newArticle);
      await this.writeJson(this.articlesFile, articles);
      return { rows: [newArticle] };
    }
    
    // Handle CREATE TABLE queries (no-op for JSON storage)
    if (sqlLower.includes('create table if not exists')) {
      return { rows: [] };
    }
    
    // Handle other queries with empty results
    return { rows: [] };
  }

  async end() {
    // No cleanup needed for JSON files
  }

  getDefaultArticles() {
    return [
      {
        id: uuidv4(),
        title: "Getting Started with G'day AI",
        content: "Welcome to G'day AI! This comprehensive guide will help you get started with our Open WebUI LLM tool. Learn how to create your first conversation, customize settings, and make the most of our AI assistant.",
        category: "Getting Started",
        tags: JSON.stringify(["beginner", "setup", "introduction"]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 125
      },
      {
        id: uuidv4(),
        title: "Advanced Prompt Engineering",
        content: "Master the art of prompt engineering with G'day AI. Learn advanced techniques for crafting effective prompts that get better results from our AI models.",
        category: "Advanced",
        tags: JSON.stringify(["prompts", "advanced", "optimization"]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 89
      },
      {
        id: uuidv4(),
        title: "Troubleshooting Common Issues",
        content: "Having trouble with G'day AI? This comprehensive troubleshooting guide covers the most common issues users face and provides step-by-step solutions.",
        category: "Troubleshooting",
        tags: JSON.stringify(["help", "troubleshooting", "common-issues"]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 203
      }
    ];
  }
}

export const getJsonStorage = () => new JsonStorage(); 