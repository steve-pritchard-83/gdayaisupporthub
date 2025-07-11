// Local storage implementation to replace API calls for GitHub Pages deployment
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const TICKETS_KEY = 'gdayai_tickets';
const ARTICLES_KEY = 'gdayai_articles';
const COMMENTS_KEY = 'gdayai_comments';

// Types
interface StoredTicket {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature';
  status: 'pending' | 'in-progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high';
  submitterName: string;
  submitterEmail: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

interface StoredComment {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  createdAt: string;
  isAdminComment: boolean;
}

interface StoredArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
}

// Original seed data from your data files
const defaultTickets: StoredTicket[] = [
  {
    id: "421f947d-e311-4e9a-a26c-f0f023c131bc",
    title: "Test Ticket - Production Verification",
    description: "This is a test ticket created during production testing to verify the Turso database integration is working correctly.",
    type: "bug",
    status: "completed",
    priority: "high",
    submitterName: "Test User",
    submitterEmail: "test@example.com",
    createdAt: "2025-07-08T05:55:50.197Z",
    updatedAt: "2025-07-08T05:55:50.462Z",
    archived: false
  },
  {
    id: "c495df68-f94b-4be2-a736-a564eca4567f",
    title: "Test Ticket - JSON Implementation",
    description: "This is a test ticket to verify JSON file storage is working correctly.",
    type: "bug",
    status: "in-progress",
    priority: "medium",
    submitterName: "Test User",
    submitterEmail: "test@example.com",
    createdAt: "2025-07-09T02:13:09.574Z",
    updatedAt: "2025-07-09T02:13:09.637Z",
    archived: false
  },
  {
    id: "76d56c49-b08c-486e-b7d8-f941437a0b4f",
    title: "Test Ticket - JSON Implementation",
    description: "This is a test ticket to verify JSON file storage is working correctly.",
    type: "bug",
    status: "pending",
    priority: "medium",
    submitterName: "Test User",
    submitterEmail: "test@example.com",
    createdAt: "2025-07-09T02:13:16.203Z",
    updatedAt: "2025-07-09T02:25:56.667Z",
    archived: false
  },
  {
    id: "feat-001-dark-mode",
    title: "Add Dark Mode Theme Support",
    description: "Users have requested a dark mode option for the support hub interface. This would improve usability in low-light environments and provide a more modern user experience. The dark mode should:\n\n• Toggle between light and dark themes\n• Remember user preference in localStorage\n• Apply to all pages (tickets, knowledge base, admin)\n• Use accessible color contrast ratios\n• Include smooth transitions between themes",
    type: "feature",
    status: "pending",
    priority: "medium",
    submitterName: "Sarah Chen",
    submitterEmail: "sarah.chen@company.com",
    createdAt: "2025-07-08T14:30:00.000Z",
    updatedAt: "2025-07-08T14:30:00.000Z",
    archived: false
  },
  {
    id: "feat-002-notifications",
    title: "Email Notifications for Ticket Updates",
    description: "Implement email notifications to keep users informed about ticket status changes. This feature should include:\n\n• Email when ticket status changes (pending → in-progress → completed)\n• Notification when admin adds comments\n• Daily digest of ticket activity for admins\n• User preference settings to control notification frequency\n• Professional email templates with branding\n• Integration with popular email services (SendGrid, AWS SES)",
    type: "feature",
    status: "pending",
    priority: "high",
    submitterName: "Mike Rodriguez",
    submitterEmail: "mike.rodriguez@company.com",
    createdAt: "2025-07-07T09:15:00.000Z",
    updatedAt: "2025-07-07T09:15:00.000Z",
    archived: false
  },
  {
    id: "feat-003-file-attachments",
    title: "File Attachment Support for Tickets",
    description: "Add the ability to attach files to support tickets. This would help users provide screenshots, logs, and documents to better explain their issues. Requirements:\n\n• Support common file types (images, PDFs, text files, logs)\n• File size limit of 10MB per attachment\n• Multiple attachments per ticket\n• Secure file storage and access\n• Thumbnail previews for images\n• Download tracking for analytics",
    type: "feature",
    status: "pending",
    priority: "high",
    submitterName: "Alex Thompson",
    submitterEmail: "alex.thompson@company.com",
    createdAt: "2025-07-06T16:45:00.000Z",
    updatedAt: "2025-07-06T16:45:00.000Z",
    archived: false
  },
  {
    id: "feat-004-search-filters",
    title: "Advanced Search and Filtering",
    description: "Enhance the ticket and knowledge base search capabilities with advanced filtering options:\n\n• Full-text search across tickets and articles\n• Filter by ticket status, priority, type, and date range\n• Filter knowledge base by category and tags\n• Save frequently used search filters\n• Export search results to CSV\n• Search suggestions and autocomplete\n• Search analytics to improve content",
    type: "feature",
    status: "pending",
    priority: "medium",
    submitterName: "Jessica Park",
    submitterEmail: "jessica.park@company.com",
    createdAt: "2025-07-05T11:20:00.000Z",
    updatedAt: "2025-07-05T11:20:00.000Z",
    archived: false
  },
  {
    id: "feat-005-mobile-app",
    title: "Mobile App for iOS and Android",
    description: "Develop native mobile applications for iOS and Android to provide on-the-go access to the support system. Features should include:\n\n• Submit and track tickets from mobile devices\n• Push notifications for ticket updates\n• Offline mode for viewing previously loaded content\n• Camera integration for easy photo attachments\n• Touch-optimized interface\n• Admin features for mobile ticket management\n• Biometric authentication support",
    type: "feature",
    status: "pending",
    priority: "low",
    submitterName: "David Kumar",
    submitterEmail: "david.kumar@company.com",
    createdAt: "2025-07-04T13:10:00.000Z",
    updatedAt: "2025-07-04T13:10:00.000Z",
    archived: false
  },
  {
    id: "feat-006-analytics-dashboard",
    title: "Analytics and Reporting Dashboard",
    description: "Create a comprehensive analytics dashboard for administrators to track support metrics and performance:\n\n• Ticket volume and resolution time trends\n• Most common issue categories and patterns\n• Knowledge base article popularity and effectiveness\n• Customer satisfaction ratings and feedback\n• Team performance metrics and workload distribution\n• Exportable reports (PDF, Excel)\n• Custom date ranges and filtering options\n• Real-time data visualization with charts and graphs",
    type: "feature",
    status: "pending",
    priority: "medium",
    submitterName: "Emma Wilson",
    submitterEmail: "emma.wilson@company.com",
    createdAt: "2025-07-03T10:30:00.000Z",
    updatedAt: "2025-07-03T10:30:00.000Z",
    archived: false
  },
  {
    id: "feat-007-ai-assistant",
    title: "AI-Powered Support Assistant",
    description: "Integrate an AI assistant to help users find solutions and assist support agents:\n\n• Intelligent ticket routing based on content analysis\n• Suggested knowledge base articles for common issues\n• Auto-generated ticket summaries\n• Chatbot for initial user support and FAQ answers\n• Sentiment analysis for ticket prioritization\n• Smart reply suggestions for support agents\n• Integration with popular AI services (OpenAI, Google AI)",
    type: "feature",
    status: "pending",
    priority: "low",
    submitterName: "Ryan Foster",
    submitterEmail: "ryan.foster@company.com",
    createdAt: "2025-07-02T15:45:00.000Z",
    updatedAt: "2025-07-02T15:45:00.000Z",
    archived: false
  },
  {
    id: "feat-008-sso-integration",
    title: "Single Sign-On (SSO) Integration",
    description: "Implement SSO integration to streamline user authentication and improve security:\n\n• Support for popular SSO providers (Google, Microsoft, Okta, Auth0)\n• SAML 2.0 and OAuth 2.0 protocol support\n• Automatic user provisioning and role assignment\n• Multi-factor authentication (MFA) support\n• Session management and automatic logout\n• Admin controls for SSO configuration\n• Fallback to local authentication if needed",
    type: "feature",
    status: "pending",
    priority: "high",
    submitterName: "Lisa Anderson",
    submitterEmail: "lisa.anderson@company.com",
    createdAt: "2025-07-01T12:00:00.000Z",
    updatedAt: "2025-07-01T12:00:00.000Z",
    archived: false
  }
];

const defaultArticles: StoredArticle[] = [
  {
    id: "6d0bb1f3-a61b-4fcb-b5b8-b531f8c7a1f4",
    title: "Getting Started with G'day AI",
    content: "Welcome to G'day AI! This comprehensive guide will help you get started with our Open WebUI LLM tool.\n\n## First Steps\n1. **Create Your Account**: Sign up at gdayai.gdaygroup.com.au\n2. **Choose Your Model**: Select from our range of AI models optimized for Australian businesses\n3. **Start Chatting**: Begin your first conversation using natural language\n\n## Key Features\n- **Multi-model Support**: Access GPT-4, Claude, and other leading AI models\n- **Australian Context**: Models trained on Australian business practices and terminology\n- **Secure Environment**: Enterprise-grade security for your conversations\n- **Real-time Collaboration**: Share conversations with team members\n\n## Tips for Success\n- Be specific in your queries for better results\n- Use follow-up questions to refine responses\n- Save important conversations for future reference\n- Explore different models for different tasks",
    category: "Getting Started",
    tags: ["beginner", "setup", "introduction", "tutorial"],
    createdAt: "2025-01-08T04:00:46.275Z",
    updatedAt: "2025-01-15T09:30:12.542Z",
    views: 1247
  },
  {
    id: "f03e96d2-f6c5-4194-82e8-bdbe26ee4b14",
    title: "Advanced Prompt Engineering",
    content: "Master the art of prompt engineering with G'day AI to get the best results from our AI models.\n\n## Prompt Structure\n**Good prompts follow this pattern:**\n- Context: Background information\n- Task: What you want accomplished\n- Format: How you want the response structured\n- Constraints: Any limitations or requirements\n\n## Effective Techniques\n\n### 1. Chain of Thought\n```\nLet's think through this step by step:\n1. First, analyze the problem\n2. Then, consider possible solutions\n3. Finally, recommend the best approach\n```\n\n### 2. Role-Based Prompting\n```\nAct as a senior business analyst. Review this quarterly report and provide insights on...\n```\n\n### 3. Few-Shot Examples\nProvide 2-3 examples of the desired output format before asking for your specific task.\n\n## Australian Business Context\n- Use Australian spelling and terminology\n- Reference local regulations (ACCC, ASIC, etc.)\n- Consider time zones (AEST, AEDT)\n- Include GST calculations where relevant\n\n## Common Mistakes to Avoid\n- Being too vague or general\n- Not specifying the desired output format\n- Forgetting to set the appropriate context\n- Using ambiguous pronouns",
    category: "Advanced",
    tags: ["prompts", "advanced", "optimization", "techniques"],
    createdAt: "2025-01-08T04:00:46.275Z",
    updatedAt: "2025-01-15T14:22:18.768Z",
    views: 893
  },
  {
    id: "30b66629-cfda-4452-9f7c-71fb0f07b5ef",
    title: "Troubleshooting Common Issues",
    content: "Having trouble with G'day AI? This comprehensive troubleshooting guide covers the most common issues users face and provides step-by-step solutions.\n\n## Connection Issues\n\n### Problem: Can't access G'day AI\n**Solutions:**\n1. Check your internet connection\n2. Clear browser cache and cookies\n3. Try incognito/private browsing mode\n4. Disable browser extensions temporarily\n5. Contact support if issue persists\n\n### Problem: Slow response times\n**Solutions:**\n1. Check if multiple users are accessing simultaneously\n2. Switch to a different AI model\n3. Reduce prompt complexity\n4. Try during off-peak hours\n\n## Model-Specific Issues\n\n### GPT-4 Not Responding\n- Check your usage limits\n- Verify your subscription status\n- Try GPT-3.5 as an alternative\n\n### Claude Giving Unexpected Results\n- Ensure prompts are clear and specific\n- Check for conflicting instructions\n- Try rephrasing your question\n\n## Account & Billing\n\n### Subscription Issues\n- Verify payment method is current\n- Check for expired credit cards\n- Contact billing support for payment disputes\n\n### Access Permissions\n- Ensure you're logged into the correct account\n- Check with your admin for team access\n- Verify your user role permissions\n\n## Browser Compatibility\n**Supported Browsers:**\n- Chrome 90+\n- Firefox 85+\n- Safari 14+\n- Edge 90+\n\n## Still Need Help?\nIf these solutions don't resolve your issue:\n1. Check our Status page for known issues\n2. Submit a support ticket with detailed information\n3. Include screenshots if possible\n4. Mention your browser and operating system",
    category: "Troubleshooting",
    tags: ["help", "troubleshooting", "common-issues", "support"],
    createdAt: "2025-01-08T04:00:46.275Z",
    updatedAt: "2025-01-15T11:45:33.194Z",
    views: 2134
  },

  {
    id: "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
    title: "Security and Privacy Guide",
    content: "Understanding G'day AI's security features and how to protect your data.\n\n## Data Protection\n\n### What We Protect\n- All conversations are encrypted in transit and at rest\n- Personal information is never shared with third parties\n- Business data remains confidential and secure\n- Compliance with Australian Privacy Act 1988\n\n### What You Can Do\n- **Strong Passwords**: Use unique, complex passwords\n- **Two-Factor Authentication**: Enable 2FA for extra security\n- **Regular Reviews**: Monitor your conversation history\n- **Access Controls**: Limit sharing to trusted team members\n\n## Enterprise Security\n\n### Single Sign-On (SSO)\n- Connect with your organization's identity provider\n- Streamlined access management\n- Centralized security policies\n- Audit trail for compliance\n\n### Data Residency\n- All Australian data stored in Australian servers\n- Compliance with Notifiable Data Breaches scheme\n- Regular security audits and penetration testing\n- ISO 27001 certified infrastructure\n\n## Privacy Controls\n\n### Conversation Privacy\n- **Private Mode**: Conversations not saved to history\n- **Auto-Delete**: Set conversations to delete after specified time\n- **Export Data**: Download your conversation history\n- **Delete Account**: Complete data removal option\n\n### Information Sharing\n- **Team Visibility**: Control what team members can see\n- **Admin Controls**: Organizational oversight options\n- **Audit Logs**: Track all access and modifications\n- **Compliance Reports**: Regular security summaries\n\n## Best Practices\n\n### For Individual Users\n1. Never share login credentials\n2. Log out when using shared computers\n3. Be cautious with sensitive information\n4. Report suspicious activity immediately\n\n### For Organizations\n1. Implement access policies\n2. Regular security training\n3. Monitor user activity\n4. Maintain incident response procedures\n\n## Compliance\n\n### Australian Regulations\n- **Privacy Act 1988**: Personal information protection\n- **Notifiable Data Breaches**: Breach notification requirements\n- **ACCC Guidelines**: Consumer protection compliance\n- **Industry Standards**: Sector-specific requirements\n\n### International Standards\n- **ISO 27001**: Information security management\n- **SOC 2**: Service organization controls\n- **GDPR**: European data protection (where applicable)\n\n## Reporting Issues\nIf you suspect a security issue:\n1. Contact security@gdaygroup.com.au immediately\n2. Don't share details publicly\n3. Provide detailed information about the incident\n4. Follow up with our security team",
    category: "Security",
    tags: ["security", "privacy", "compliance", "data-protection"],
    createdAt: "2025-01-12T10:30:15.123Z",
    updatedAt: "2025-01-15T13:45:27.891Z",
    views: 445
  },
  {
    id: "c3d4e5f6-g7h8-9012-cdef-gh3456789012",
    title: "API Integration Guide",
    content: "Connect G'day AI with your existing systems using our powerful API.\n\n## Getting Started\n\n### API Authentication\n1. Generate API key from your dashboard\n2. Include key in request headers: `Authorization: Bearer YOUR_API_KEY`\n3. All requests must use HTTPS\n4. Rate limits apply (1000 requests/hour for standard plans)\n\n### Base URL\n```\nhttps://api.gdayai.gdaygroup.com.au/v1\n```\n\n## Core Endpoints\n\n### Chat Completion\n```javascript\nPOST /chat/completions\n\n{\n  \"model\": \"gpt-4\",\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"Hello, how can I help you today?\"\n    }\n  ],\n  \"max_tokens\": 1000,\n  \"temperature\": 0.7\n}\n```\n\n### Conversation Management\n```javascript\n// Create conversation\nPOST /conversations\n\n// Get conversation history\nGET /conversations/{id}\n\n// Update conversation\nPUT /conversations/{id}\n\n// Delete conversation\nDELETE /conversations/{id}\n```\n\n## Authentication Examples\n\n### cURL\n```bash\ncurl -X POST https://api.gdayai.gdaygroup.com.au/v1/chat/completions \\\n  -H \"Authorization: Bearer YOUR_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\": \"gpt-4\", \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}]}'\n```\n\n### Python\n```python\nimport requests\n\nheaders = {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json'\n}\n\ndata = {\n    'model': 'gpt-4',\n    'messages': [{'role': 'user', 'content': 'Hello'}]\n}\n\nresponse = requests.post(\n    'https://api.gdayai.gdaygroup.com.au/v1/chat/completions',\n    headers=headers,\n    json=data\n)\n```\n\n### JavaScript\n```javascript\nconst response = await fetch('https://api.gdayai.gdaygroup.com.au/v1/chat/completions', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    model: 'gpt-4',\n    messages: [{ role: 'user', content: 'Hello' }]\n  })\n});\n```\n\n## Error Handling\n\n### Common Status Codes\n- `200`: Success\n- `400`: Bad Request - Invalid parameters\n- `401`: Unauthorized - Invalid API key\n- `403`: Forbidden - Insufficient permissions\n- `429`: Too Many Requests - Rate limit exceeded\n- `500`: Internal Server Error\n\n### Error Response Format\n```json\n{\n  \"error\": {\n    \"message\": \"Invalid API key\",\n    \"type\": \"authentication_error\",\n    \"code\": \"invalid_api_key\"\n  }\n}\n```\n\n## Rate Limits\n\n### Standard Plan\n- 1,000 requests per hour\n- 50,000 tokens per hour\n- 5 requests per second\n\n### Enterprise Plan\n- 10,000 requests per hour\n- 500,000 tokens per hour\n- 50 requests per second\n\n## Webhooks\n\n### Setting Up Webhooks\n1. Configure webhook URL in dashboard\n2. Select events to subscribe to\n3. Verify webhook signature for security\n\n### Supported Events\n- `conversation.created`\n- `conversation.updated`\n- `message.sent`\n- `usage.threshold_reached`\n\n## SDKs and Libraries\n\n### Official SDKs\n- **Python**: `pip install gdayai-python`\n- **JavaScript**: `npm install @gdayai/sdk`\n- **PHP**: `composer require gdayai/php-sdk`\n\n### Community Libraries\n- **Ruby**: gdayai-ruby gem\n- **Java**: gdayai-java library\n- **Go**: gdayai-go package\n\n## Best Practices\n\n### Security\n1. Never expose API keys in client-side code\n2. Use environment variables for keys\n3. Implement proper error handling\n4. Rotate API keys regularly\n\n### Performance\n1. Implement request caching where appropriate\n2. Use batch requests for multiple operations\n3. Handle rate limits gracefully\n4. Monitor API usage and costs\n\n### Monitoring\n1. Track API response times\n2. Monitor error rates\n3. Set up alerts for unusual activity\n4. Regular usage reviews",
    category: "API",
    tags: ["api", "integration", "development", "automation"],
    createdAt: "2025-01-14T14:20:33.678Z",
    updatedAt: "2025-01-15T17:15:42.345Z",
    views: 234
  },
  {
    id: "d4e5f6g7-h8i9-0123-defg-hi4567890123",
    title: "Model Selection Guide",
    content: "Choose the right AI model for your specific needs with G'day AI's comprehensive model selection guide.\n\n## Available Models\n\n### GPT-4 Series\n**Best for:** Complex reasoning, creative tasks, detailed analysis\n- **GPT-4**: Most capable model, excellent for complex tasks\n- **GPT-4 Turbo**: Faster responses, good for most business needs\n- **GPT-4 Vision**: Can analyze images and documents\n\n**Typical Use Cases:**\n- Strategic planning and analysis\n- Creative writing and brainstorming\n- Complex problem-solving\n- Document analysis and summarization\n\n### Claude Series\n**Best for:** Long-form content, ethical reasoning, safe responses\n- **Claude 3.5 Sonnet**: Balanced performance and speed\n- **Claude 3 Opus**: Highest quality responses\n- **Claude 3 Haiku**: Fastest responses, good for simple tasks\n\n**Typical Use Cases:**\n- Legal document review\n- Policy analysis\n- Educational content creation\n- Research assistance\n\n### Specialized Models\n\n#### Code Assistant\n**Best for:** Software development, debugging, code review\n- Supports 50+ programming languages\n- Excellent for code explanation and optimization\n- Integrated with common development tools\n\n#### Business Intelligence\n**Best for:** Data analysis, reporting, business insights\n- Optimized for Australian business context\n- Understands local regulations and practices\n- Integrated with common business tools\n\n## Model Comparison\n\n| Feature | GPT-4 | Claude 3.5 | Code Assistant | Business Intelligence |\n|---------|-------|------------|----------------|----------------------|\n| Speed | Medium | Fast | Fast | Medium |\n| Accuracy | Excellent | Excellent | Very Good | Excellent |\n| Creativity | Excellent | Very Good | Good | Good |\n| Technical | Very Good | Good | Excellent | Very Good |\n| Cost | High | Medium | Medium | Medium |\n\n## Choosing the Right Model\n\n### For Different Tasks\n\n#### Content Creation\n- **Marketing copy**: GPT-4 or Claude 3.5\n- **Technical documentation**: Code Assistant\n- **Business reports**: Business Intelligence\n- **Creative writing**: GPT-4\n\n#### Analysis Tasks\n- **Financial analysis**: Business Intelligence\n- **Code review**: Code Assistant\n- **Legal analysis**: Claude 3.5\n- **Strategic planning**: GPT-4\n\n#### Quick Tasks\n- **Email responses**: Claude 3 Haiku\n- **Simple questions**: GPT-4 Turbo\n- **Data queries**: Business Intelligence\n- **Code snippets**: Code Assistant\n\n### Cost Considerations\n\n#### Token Pricing (AUD)\n- **GPT-4**: $0.03 per 1K tokens\n- **GPT-4 Turbo**: $0.01 per 1K tokens\n- **Claude 3.5**: $0.015 per 1K tokens\n- **Code Assistant**: $0.02 per 1K tokens\n- **Business Intelligence**: $0.025 per 1K tokens\n\n#### Optimization Tips\n1. Use simpler models for routine tasks\n2. Implement caching for repeated queries\n3. Optimize prompt length\n4. Monitor usage patterns\n\n## Performance Optimization\n\n### Response Time\n- **Fastest**: Claude 3 Haiku, GPT-4 Turbo\n- **Balanced**: Claude 3.5, Code Assistant\n- **Comprehensive**: GPT-4, Business Intelligence\n\n### Quality vs Speed\n- **High Quality**: Use GPT-4 or Claude 3 Opus for important tasks\n- **Balanced**: Claude 3.5 for most business needs\n- **Quick Tasks**: GPT-4 Turbo or Claude 3 Haiku\n\n## Model Limitations\n\n### General Limitations\n- Knowledge cutoff dates vary by model\n- Token limits apply to all models\n- Real-time information not available\n- May require multiple attempts for complex tasks\n\n### Specific Limitations\n- **GPT-4**: Higher cost, slower responses\n- **Claude**: Limited mathematical capabilities\n- **Code Assistant**: Focused on programming tasks\n- **Business Intelligence**: Australian market focused\n\n## Switching Between Models\n\n### In Conversations\n1. Click the model selector\n2. Choose your preferred model\n3. Continue the conversation\n4. Previous context is maintained\n\n### For Teams\n1. Set default models for different use cases\n2. Create model-specific templates\n3. Train team members on optimal usage\n4. Monitor costs and performance\n\n## Future Models\n\n### Coming Soon\n- **Multimodal GPT-4**: Enhanced image and video processing\n- **Real-time Claude**: Live data integration\n- **Industry Specialists**: Sector-specific models\n- **Collaborative Models**: Team-optimized responses\n\n### Beta Access\nJoin our beta program to test new models:\n1. Apply through your dashboard\n2. Provide feedback on performance\n3. Get early access to new features\n4. Influence future development",
    category: "Models",
    tags: ["models", "selection", "performance", "optimization"],
    createdAt: "2025-01-15T09:45:18.234Z",
    updatedAt: "2025-01-15T18:20:55.567Z",
    views: 167
  }
];

const defaultComments: StoredComment[] = [
  {
    id: "beb28d6a-0d8b-4824-90ef-36579b05f190",
    ticketId: "c495df68-f94b-4be2-a736-a564eca4567f",
    author: "Test Admin",
    content: "This is a test comment.",
    isAdminComment: true,
    createdAt: "2025-07-09T02:13:09.613Z"
  },
  {
    id: "0e0cf6f9-d594-44ba-9a07-dec4957f7a06",
    ticketId: "76d56c49-b08c-486e-b7d8-f941437a0b4f",
    author: "Test Admin",
    content: "This is a test comment.",
    isAdminComment: true,
    createdAt: "2025-07-09T02:13:16.235Z"
  },
  {
    id: "comment-dark-mode-1",
    ticketId: "feat-001-dark-mode",
    author: "Support Admin",
    content: "Thanks for this suggestion! Dark mode is definitely on our roadmap. We're planning to implement this in the next major release. I'll keep you updated on progress.",
    isAdminComment: true,
    createdAt: "2025-07-08T15:30:00.000Z"
  },
  {
    id: "comment-dark-mode-2",
    ticketId: "feat-001-dark-mode",
    author: "Sarah Chen",
    content: "That's great to hear! Would it be possible to also include an auto-switch based on system preferences?",
    isAdminComment: false,
    createdAt: "2025-07-08T16:15:00.000Z"
  },
  {
    id: "comment-dark-mode-3",
    ticketId: "feat-001-dark-mode",
    author: "Support Admin",
    content: "Absolutely! Auto-switching based on system preferences (prefers-color-scheme) is definitely part of the plan. We'll also include a manual toggle for users who want to override their system settings.",
    isAdminComment: true,
    createdAt: "2025-07-08T16:45:00.000Z"
  },
  {
    id: "comment-notifications-1",
    ticketId: "feat-002-notifications",
    author: "Product Manager",
    content: "This is a high-priority request that we're actively working on. We're evaluating email service providers and working on the notification templates. Expected timeline is 2-3 weeks for initial implementation.",
    isAdminComment: true,
    createdAt: "2025-07-07T10:30:00.000Z"
  },
  {
    id: "comment-notifications-2",
    ticketId: "feat-002-notifications",
    author: "Mike Rodriguez",
    content: "Fantastic! Will users be able to customize which notifications they receive? Some might only want critical updates.",
    isAdminComment: false,
    createdAt: "2025-07-07T11:00:00.000Z"
  },
  {
    id: "comment-notifications-3",
    ticketId: "feat-002-notifications",
    author: "Product Manager",
    content: "Yes! We're designing a comprehensive notification preferences panel where users can choose:\n• Which events trigger emails\n• Frequency (immediate, daily digest, weekly)\n• Email format preferences\n• Opt-out options for specific notification types",
    isAdminComment: true,
    createdAt: "2025-07-07T11:15:00.000Z"
  },
  {
    id: "comment-attachments-1",
    ticketId: "feat-003-file-attachments",
    author: "Technical Lead",
    content: "We're analyzing the technical requirements for file attachments. Key considerations:\n• Security scanning for uploaded files\n• CDN integration for fast delivery\n• Cost implications for storage\n\nWe'll need to implement virus scanning and validate file types carefully.",
    isAdminComment: true,
    createdAt: "2025-07-06T17:30:00.000Z"
  },
  {
    id: "comment-attachments-2",
    ticketId: "feat-003-file-attachments",
    author: "Alex Thompson",
    content: "Security is definitely important! Would it be possible to support .log files? Those are crucial for debugging issues.",
    isAdminComment: false,
    createdAt: "2025-07-06T18:00:00.000Z"
  },
  {
    id: "comment-attachments-3",
    ticketId: "feat-003-file-attachments",
    author: "Technical Lead",
    content: "Absolutely! .log files are essential for technical support. Our planned supported formats include:\n• Images: jpg, png, gif, webp\n• Documents: pdf, txt, md\n• Archives: zip (contents will be scanned)\n• Logs: .log, .txt, .json\n• Code: most common extensions with syntax highlighting",
    isAdminComment: true,
    createdAt: "2025-07-06T18:30:00.000Z"
  },
  {
    id: "comment-search-1",
    ticketId: "feat-004-search-filters",
    author: "UX Designer",
    content: "Great suggestion! We're working on wireframes for an advanced search interface. The design will include:\n• Quick filter buttons for common searches\n• Advanced filter panel that slides out\n• Search result highlighting\n• Saved search functionality\n\nWould love to get your feedback once we have mockups ready!",
    isAdminComment: true,
    createdAt: "2025-07-05T14:20:00.000Z"
  },
  {
    id: "comment-sso-1",
    ticketId: "feat-008-sso-integration",
    author: "Security Team",
    content: "SSO integration is critical for our enterprise customers. We're prioritizing this feature and have begun security reviews. Current plan includes:\n• Google Workspace integration (Phase 1)\n• Microsoft Azure AD (Phase 1) \n• Okta and Auth0 (Phase 2)\n• Custom SAML providers (Phase 3)\n\nPhase 1 should be ready within 4-6 weeks.",
    isAdminComment: true,
    createdAt: "2025-07-01T14:00:00.000Z"
  },
  {
    id: "comment-sso-2",
    ticketId: "feat-008-sso-integration",
    author: "Lisa Anderson",
    content: "Excellent! We use Azure AD, so Phase 1 timing works perfectly. Will there be any migration process needed for existing accounts?",
    isAdminComment: false,
    createdAt: "2025-07-01T14:30:00.000Z"
  },
  {
    id: "comment-sso-3",
    ticketId: "feat-008-sso-integration",
    author: "Security Team",
    content: "We're designing a smooth migration process! Existing users will be able to:\n• Link their current account to SSO during first SSO login\n• Maintain all their ticket history and preferences\n• Keep the same email address as their account identifier\n\nWe'll provide detailed migration guides before rollout.",
    isAdminComment: true,
    createdAt: "2025-07-01T15:00:00.000Z"
  },
  {
    id: "comment-mobile-app-1",
    ticketId: "feat-005-mobile-app",
    author: "Mobile Team Lead",
    content: "Mobile app development is complex and resource-intensive. We're currently evaluating whether to build native apps or focus on Progressive Web App (PWA) functionality first. PWA would give us:\n• Offline capabilities\n• Push notifications\n• Home screen installation\n• Much faster development timeline\n\nWhat are your thoughts on PWA vs native apps?",
    isAdminComment: true,
    createdAt: "2025-07-04T15:30:00.000Z"
  },
  {
    id: "comment-mobile-app-2",
    ticketId: "feat-005-mobile-app",
    author: "David Kumar",
    content: "PWA sounds like a great starting point! As long as it has offline access and push notifications, that covers 90% of our mobile needs. Native apps can come later if needed.",
    isAdminComment: false,
    createdAt: "2025-07-04T16:00:00.000Z"
  },
  {
    id: "comment-analytics-1",
    ticketId: "feat-006-analytics-dashboard",
    author: "Data Analytics Team",
    content: "Analytics dashboard is in active development! We're building this using modern data visualization tools. Current progress:\n• Basic ticket metrics - ✅ Complete\n• Response time analytics - 🔄 In Progress\n• Knowledge base analytics - 📋 Planned\n• Custom report builder - 📋 Planned\n\nExpected beta release in 3-4 weeks.",
    isAdminComment: true,
    createdAt: "2025-07-03T12:00:00.000Z"
  },
  {
    id: "comment-analytics-2",
    ticketId: "feat-006-analytics-dashboard",
    author: "Emma Wilson",
    content: "This is exactly what we need! Will the custom report builder allow scheduling of automated reports via email?",
    isAdminComment: false,
    createdAt: "2025-07-03T12:30:00.000Z"
  },
  {
    id: "comment-analytics-3",
    ticketId: "feat-006-analytics-dashboard",
    author: "Data Analytics Team",
    content: "Yes! Scheduled reports are part of Phase 2. You'll be able to:\n• Schedule daily/weekly/monthly reports\n• Send to multiple recipients\n• Customize report content and format\n• Set up alerts for specific metrics\n\nWe're also planning integration with Slack and Microsoft Teams for notifications.",
    isAdminComment: true,
    createdAt: "2025-07-03T13:00:00.000Z"
  },
  {
    id: "comment-ai-assistant-1",
    ticketId: "feat-007-ai-assistant",
    author: "AI/ML Team",
    content: "AI assistant integration is a fascinating challenge! We're exploring several approaches:\n• Rule-based routing (immediate implementation)\n• ML-powered categorization (6-8 weeks)\n• Advanced NLP analysis (longer term)\n\nThe chatbot for common questions could be ready much sooner - maybe 2-3 weeks for a basic version.",
    isAdminComment: true,
    createdAt: "2025-07-02T17:00:00.000Z"
  },
  {
    id: "comment-ai-assistant-2",
    ticketId: "feat-007-ai-assistant",
    author: "Ryan Foster",
    content: "A basic chatbot would be incredibly valuable! Even if it just handles common questions like \"how do I reset my password\" or \"what are your business hours\", that would reduce our support load significantly.",
    isAdminComment: false,
    createdAt: "2025-07-02T17:30:00.000Z"
  },
  {
    id: "comment-test-bug-1",
    ticketId: "421f947d-e311-4e9a-a26c-f0f023c131bc",
    author: "QA Team",
    content: "Production verification completed successfully! All database connections are working properly. This ticket can be closed.",
    isAdminComment: true,
    createdAt: "2025-07-08T06:00:00.000Z"
  },
  {
    id: "comment-test-bug-2",
    ticketId: "421f947d-e311-4e9a-a26c-f0f023c131bc",
    author: "System Admin",
    content: "Confirmed - all systems are operational. Monitoring shows normal performance metrics across all endpoints.",
    isAdminComment: true,
    createdAt: "2025-07-08T06:15:00.000Z"
  }
];

// Utility functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setInStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

// Initialize storage with default data
const initializeStorage = () => {
  if (!localStorage.getItem(TICKETS_KEY)) {
    setInStorage(TICKETS_KEY, defaultTickets);
  }
  if (!localStorage.getItem(ARTICLES_KEY)) {
    setInStorage(ARTICLES_KEY, defaultArticles);
  }
  if (!localStorage.getItem(COMMENTS_KEY)) {
    setInStorage(COMMENTS_KEY, defaultComments);
  }
};

// Initialize on import
initializeStorage();

// Ticket API functions
export const ticketApi = {
  // Get all tickets
  getAll: async (): Promise<StoredTicket[]> => {
    const tickets = getFromStorage<StoredTicket[]>(TICKETS_KEY, []);
    const comments = getFromStorage<StoredComment[]>(COMMENTS_KEY, []);
    
    return tickets
      .filter(ticket => !ticket.archived)
      .map(ticket => ({
        ...ticket,
        comments: comments.filter(c => c.ticketId === ticket.id)
      })) as StoredTicket[];
  },
  
  // Get single ticket with comments
  getById: async (id: string): Promise<StoredTicket & { comments: StoredComment[] }> => {
    const tickets = getFromStorage<StoredTicket[]>(TICKETS_KEY, []);
    const comments = getFromStorage<StoredComment[]>(COMMENTS_KEY, []);
    
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    const ticketComments = comments.filter(c => c.ticketId === id);
    return { ...ticket, comments: ticketComments };
  },
  
  // Create new ticket
  create: async (ticket: {
    title: string;
    description: string;
    type: 'bug' | 'feature';
    priority: 'low' | 'medium' | 'high';
    submitterName: string;
    submitterEmail: string;
  }): Promise<StoredTicket> => {
    const tickets = getFromStorage<StoredTicket[]>(TICKETS_KEY, []);
    const newTicket: StoredTicket = {
      id: uuidv4(),
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      status: 'pending',
      priority: ticket.priority,
      submitterName: ticket.submitterName,
      submitterEmail: ticket.submitterEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false
    };
    
    tickets.push(newTicket);
    setInStorage(TICKETS_KEY, tickets);
    return newTicket;
  },
  
  // Update ticket
  update: async (id: string, updates: {
    status?: 'pending' | 'in-progress' | 'completed' | 'closed';
    priority?: 'low' | 'medium' | 'high';
  }): Promise<StoredTicket> => {
    const tickets = getFromStorage<StoredTicket[]>(TICKETS_KEY, []);
    const ticketIndex = tickets.findIndex(t => t.id === id);
    
    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }
    
    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    setInStorage(TICKETS_KEY, tickets);
    return tickets[ticketIndex];
  },
  
  // Add comment to ticket
  addComment: async (ticketId: string, comment: {
    author: string;
    content: string;
    isAdminComment?: boolean;
  }): Promise<StoredComment> => {
    const comments = getFromStorage<StoredComment[]>(COMMENTS_KEY, []);
    const newComment: StoredComment = {
      id: uuidv4(),
      ticketId,
      author: comment.author,
      content: comment.content,
      createdAt: new Date().toISOString(),
      isAdminComment: comment.isAdminComment || false
    };
    
    comments.push(newComment);
    setInStorage(COMMENTS_KEY, comments);
    return newComment;
  },
  
  // Archive ticket
  archive: async (id: string): Promise<void> => {
    const tickets = getFromStorage<StoredTicket[]>(TICKETS_KEY, []);
    const ticketIndex = tickets.findIndex(t => t.id === id);
    
    if (ticketIndex !== -1) {
      tickets[ticketIndex].archived = true;
      tickets[ticketIndex].updatedAt = new Date().toISOString();
      setInStorage(TICKETS_KEY, tickets);
    }
  },
  
  // Get archived tickets
  getArchived: async (): Promise<StoredTicket[]> => {
    const tickets = getFromStorage<StoredTicket[]>(TICKETS_KEY, []);
    return tickets.filter(ticket => ticket.archived);
  },
  
  // Restore archived ticket
  restore: async (id: string): Promise<void> => {
    const tickets = getFromStorage<StoredTicket[]>(TICKETS_KEY, []);
    const ticketIndex = tickets.findIndex(t => t.id === id);
    
    if (ticketIndex !== -1) {
      tickets[ticketIndex].archived = false;
      tickets[ticketIndex].updatedAt = new Date().toISOString();
      setInStorage(TICKETS_KEY, tickets);
    }
  },
  
  // Permanently delete ticket
  deletePermanent: async (id: string): Promise<void> => {
    const tickets = getFromStorage<StoredTicket[]>(TICKETS_KEY, []);
    const comments = getFromStorage<StoredComment[]>(COMMENTS_KEY, []);
    
    // Remove ticket
    const filteredTickets = tickets.filter(t => t.id !== id);
    setInStorage(TICKETS_KEY, filteredTickets);
    
    // Remove associated comments
    const filteredComments = comments.filter(c => c.ticketId !== id);
    setInStorage(COMMENTS_KEY, filteredComments);
  }
};

// Knowledge article API functions
export const articleApi = {
  // Get all articles
  getAll: async (): Promise<StoredArticle[]> => {
    return getFromStorage<StoredArticle[]>(ARTICLES_KEY, defaultArticles);
  },
  
  // Increment view count
  incrementView: async (id: string): Promise<void> => {
    const articles = getFromStorage<StoredArticle[]>(ARTICLES_KEY, []);
    const articleIndex = articles.findIndex(a => a.id === id);
    
    if (articleIndex !== -1) {
      articles[articleIndex].views += 1;
      setInStorage(ARTICLES_KEY, articles);
    }
  },
  
  // Create new article (admin only)
  create: async (article: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }): Promise<StoredArticle> => {
    const articles = getFromStorage<StoredArticle[]>(ARTICLES_KEY, []);
    const newArticle: StoredArticle = {
      id: uuidv4(),
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };
    
    articles.push(newArticle);
    setInStorage(ARTICLES_KEY, articles);
    return newArticle;
  },
  
  // Update article (admin only)
  update: async (id: string, article: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }): Promise<StoredArticle> => {
    const articles = getFromStorage<StoredArticle[]>(ARTICLES_KEY, []);
    const articleIndex = articles.findIndex(a => a.id === id);
    
    if (articleIndex === -1) {
      throw new Error('Article not found');
    }
    
    articles[articleIndex] = {
      ...articles[articleIndex],
      ...article,
      updatedAt: new Date().toISOString()
    };
    
    setInStorage(ARTICLES_KEY, articles);
    return articles[articleIndex];
  },
  
  // Delete article (admin only)
  delete: async (id: string): Promise<void> => {
    const articles = getFromStorage<StoredArticle[]>(ARTICLES_KEY, []);
    const filteredArticles = articles.filter(a => a.id !== id);
    setInStorage(ARTICLES_KEY, filteredArticles);
  }
};

// Health check (always returns healthy for local storage)
export const healthCheck = async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    storage_type: 'local_storage',
    environment: 'github_pages'
  };
}; 