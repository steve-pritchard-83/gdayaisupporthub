import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Initialize database with test data
async function initializeTestData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database for initialization');

    // Check if we already have test data
    const ticketCount = await client.query("SELECT COUNT(*) as count FROM tickets");
    const articleCount = await client.query("SELECT COUNT(*) as count FROM knowledge_articles");

    if (parseInt(ticketCount.rows[0].count) === 0) {
      console.log('Adding test tickets...');
      
      // Add test tickets
      const testTickets = [
        {
          id: uuidv4(),
          title: 'Welcome to G\'day AI Support Hub!',
          description: 'This is your first support ticket. Our AI-powered support hub is ready to help you with any questions or issues you might have.',
          type: 'feature',
          status: 'open',
          priority: 'low',
          submitter_name: 'G\'day AI Team',
          submitter_email: 'support@gdayai.com',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          archived: false
        },
        {
          id: uuidv4(),
          title: 'How to submit a support ticket',
          description: 'Learn how to submit support tickets effectively. Include details about your issue, steps to reproduce, and any error messages you\'ve encountered.',
          type: 'feature',
          status: 'open',
          priority: 'medium',
          submitter_name: 'Demo User',
          submitter_email: 'demo@example.com',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          archived: false
        },
        {
          id: uuidv4(),
          title: 'Feature request: Dark mode',
          description: 'It would be great to have a dark mode option for the support hub interface. This would be helpful for users working in low-light environments.',
          type: 'feature',
          status: 'pending',
          priority: 'low',
          submitter_name: 'Sarah Johnson',
          submitter_email: 'sarah@example.com',
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          updated_at: new Date(Date.now() - 7200000).toISOString(),
          archived: false
        }
      ];

      for (const ticket of testTickets) {
        await client.query(
          "INSERT INTO tickets (id, title, description, type, status, priority, submitter_name, submitter_email, created_at, updated_at, archived) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
          [ticket.id, ticket.title, ticket.description, ticket.type, ticket.status, ticket.priority, ticket.submitter_name, ticket.submitter_email, ticket.created_at, ticket.updated_at, ticket.archived]
        );
      }

      // Add some comments
      const comments = [
        {
          id: uuidv4(),
          ticket_id: testTickets[0].id,
          author: 'G\'day AI Support',
          content: 'Thanks for using G\'day AI Support Hub! We\'re here to help you with any questions.',
          is_admin_comment: true,
          created_at: new Date(Date.now() - 82800000).toISOString() // 23 hours ago
        },
        {
          id: uuidv4(),
          ticket_id: testTickets[1].id,
          author: 'Demo User',
          content: 'This is really helpful! The interface is very intuitive.',
          is_admin_comment: false,
          created_at: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        }
      ];

      for (const comment of comments) {
        await client.query(
          "INSERT INTO comments (id, ticket_id, author, content, is_admin_comment, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
          [comment.id, comment.ticket_id, comment.author, comment.content, comment.is_admin_comment, comment.created_at]
        );
      }

      console.log('Test tickets and comments added successfully');
    }

    if (parseInt(articleCount.rows[0].count) === 0) {
      console.log('Adding knowledge articles...');
      
      // Add knowledge articles
      const articles = [
        {
          id: uuidv4(),
          title: "Getting Started with G'day AI",
          content: "Welcome to G'day AI! This comprehensive guide will help you get started with our Open WebUI LLM tool. Learn how to create your first conversation, customize settings, and make the most of our AI assistant. Our platform is designed to be intuitive and user-friendly, providing you with powerful AI capabilities right at your fingertips.",
          category: "Getting Started",
          tags: JSON.stringify(["beginner", "setup", "introduction"]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 125
        },
        {
          id: uuidv4(),
          title: "Advanced Prompt Engineering",
          content: "Master the art of prompt engineering with G'day AI. Learn advanced techniques for crafting effective prompts that get better results from our AI models. Discover how to structure your requests, use context effectively, and optimize for specific use cases. This guide covers everything from basic prompt structure to advanced techniques used by power users.",
          category: "Advanced",
          tags: JSON.stringify(["prompts", "advanced", "optimization"]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 89
        },
        {
          id: uuidv4(),
          title: "Troubleshooting Common Issues",
          content: "Having trouble with G'day AI? This comprehensive troubleshooting guide covers the most common issues users face and provides step-by-step solutions. From connection problems to unexpected responses, we've got you covered. Learn how to diagnose problems, clear cache, check settings, and when to contact support.",
          category: "Troubleshooting",
          tags: JSON.stringify(["help", "troubleshooting", "common-issues"]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 203
        },
        {
          id: uuidv4(),
          title: "Privacy and Security",
          content: "Your privacy and security are our top priorities. Learn about how G'day AI protects your data, what information we collect, and how you can control your privacy settings. This guide explains our security measures, data retention policies, and provides tips for keeping your account secure.",
          category: "Security",
          tags: JSON.stringify(["privacy", "security", "data-protection"]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 67
        }
      ];

      for (const article of articles) {
        await client.query(
          "INSERT INTO knowledge_articles (id, title, content, category, tags, created_at, updated_at, views) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [article.id, article.title, article.content, article.category, article.tags, article.created_at, article.updated_at, article.views]
        );
      }

      console.log('Knowledge articles added successfully');
    }

    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeTestData().catch(console.error);
}

export { initializeTestData }; 