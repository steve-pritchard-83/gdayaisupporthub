import { Ticket, KnowledgeArticle, TicketStats, Category } from '@/types';

// Storage keys
const TICKETS_KEY = 'gday-support-tickets';
const KNOWLEDGE_KEY = 'gday-support-knowledge';

// 🔧 BASIC ERROR HANDLING - localStorage operations can fail
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
      return false;
    }
  }
};

// Generate unique ID for new tickets
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// TICKET OPERATIONS
export const getTickets = (): Ticket[] => {
  const data = safeLocalStorage.getItem(TICKETS_KEY);
  if (!data) return [];
  
  try {
    const tickets: Ticket[] = JSON.parse(data);
    
    // Data migration: Update 'Bug Report' to 'Bug Ticket'
    const migratedTickets = tickets.map(ticket => {
      if ((ticket.category as string) === 'Bug Report') {
        return { ...ticket, category: 'Bug Ticket' as Category };
      }
      return ticket;
    });

    return migratedTickets;
  } catch (error) {
    console.error('Failed to parse tickets data:', error);
    return [];
  }
};

export const saveTicket = (ticket: Ticket): boolean => {
  const tickets = getTickets();
  const existingIndex = tickets.findIndex(t => t.id === ticket.id);
  
  if (existingIndex >= 0) {
    // Update existing ticket
    tickets[existingIndex] = { ...ticket, updatedDate: new Date().toISOString() };
  } else {
    // Add new ticket
    tickets.push(ticket);
  }
  
  return safeLocalStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
};

export const deleteTicket = (id: string): boolean => {
  const tickets = getTickets();
  const filteredTickets = tickets.filter(t => t.id !== id);
  return safeLocalStorage.setItem(TICKETS_KEY, JSON.stringify(filteredTickets));
};

export const getTicketById = (id: string): Ticket | null => {
  const tickets = getTickets();
  return tickets.find(t => t.id === id) || null;
};

// KNOWLEDGE BASE OPERATIONS
export const getKnowledgeArticles = (): KnowledgeArticle[] => {
  const data = safeLocalStorage.getItem(KNOWLEDGE_KEY);
  if (!data) return getDefaultKnowledgeArticles();
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse knowledge articles data:', error);
    return getDefaultKnowledgeArticles();
  }
};

// Hardcoded FAQ articles as requested
export const getDefaultKnowledgeArticles = (): KnowledgeArticle[] => {
  return [
    {
      id: 'faq-1',
      title: 'How do I submit a bug ticket effectively?',
      content: 'To submit a bug ticket effectively: 1) Choose "Bug Ticket" category, 2) Include steps to reproduce the issue, 3) Describe expected vs actual behavior, 4) Mention which AI tool is affected, 5) Include screenshots if possible. The more details you provide, the faster we can resolve the issue.',
      category: 'Bug Ticket',
      tags: ['bug-ticket', 'troubleshooting', 'ticketing'],
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-2',
      title: 'What makes a good feature request?',
      content: 'A good feature request includes: 1) Clear problem statement, 2) Specific use case or user story, 3) Expected benefits, 4) Suggested implementation (if you have ideas), 5) Priority level and business justification. Focus on the "why" not just the "what".',
      category: 'Feature Request',
      tags: ['feature-request', 'guidelines', 'best-practices'],
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-3',
      title: 'Common AI tool troubleshooting steps',
      content: 'Before submitting a bug ticket, try these steps: 1) Refresh your browser/restart the application, 2) Check internet connection, 3) Clear browser cache and cookies, 4) Try a different browser, 5) Check if the issue happens with different AI tools. If problems persist, submit a bug ticket with these steps documented.',
      category: 'Bug Ticket',
      tags: ['troubleshooting', 'technical', 'self-help'],
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-4',
      title: 'How long does bug resolution take?',
      content: 'Bug resolution timelines vary by severity: Critical bugs (system down) - 4 hours, High priority bugs - 1-2 days, Medium priority bugs - 1 week, Low priority bugs - 2-4 weeks. You\'ll receive updates on progress and be notified when the bug is resolved.',
      category: 'Bug Ticket',
      tags: ['timeline', 'resolution', 'priority'],
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-5',
      title: 'How are feature requests prioritized?',
      content: 'Feature requests are prioritized based on: 1) Number of users who would benefit, 2) Business impact and ROI, 3) Technical complexity, 4) Alignment with product roadmap. Community voting and feedback also influence prioritization decisions.',
      category: 'Feature Request',
      tags: ['prioritization', 'process', 'roadmap'],
      createdDate: '2024-01-01T00:00:00Z'
    }
  ];
};

// STATS CALCULATIONS
export const getTicketStats = (): TicketStats => {
  const tickets = getTickets();
  
  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
    highPriority: tickets.filter(t => t.priority === 'High').length
  };
};

// Example tickets for demonstration
export const getDefaultTickets = (): Ticket[] => {
  return [
    {
      id: 'example-1',
      title: 'ChatGPT returns error when generating long responses',
      description: 'When requesting ChatGPT to generate responses longer than 2000 characters, it returns a "Request timeout" error. This happens consistently across different prompts.\n\nSteps to reproduce:\n1. Open ChatGPT interface\n2. Request a long response (e.g., "Write a 3000-word essay about AI")\n3. Error appears after 30 seconds\n\nExpected: Long response should be generated successfully\nActual: Timeout error is shown',
      priority: 'High',
      category: 'Bug Ticket',
      status: 'Open',
      email: 'sarah.johnson@discoveryparks.com.au',
      createdDate: '2024-12-13T10:30:00Z'
    },
    {
      id: 'example-2',
      title: 'Add dark mode toggle to AI tools interface',
      description: 'Many team members work in low-light environments and would benefit from a dark mode option for all AI tools. This would reduce eye strain and improve user experience.\n\nBenefits:\n• Reduced eye strain during long work sessions\n• Better battery life on laptops\n• Improved accessibility for users with light sensitivity\n• Modern, professional appearance\n\nSuggested implementation: Toggle switch in the top navigation bar that persists across sessions.',
      priority: 'Medium',
      category: 'Feature Request',
      status: 'In Progress',
      email: 'mike.chen@discoveryparks.com.au',
      createdDate: '2024-12-12T14:15:00Z'
    },
    {
      id: 'example-3',
      title: 'GitHub Copilot suggestions not appearing in VS Code',
      description: 'GitHub Copilot is not showing any code suggestions in VS Code, even though the extension is installed and I have active access.\n\nTroubleshooting attempted:\n• Restarted VS Code\n• Disabled and re-enabled the extension\n• Checked internet connection\n• Verified account permissions\n\nThe status bar shows "Copilot: Ready" but no suggestions appear while typing.',
      priority: 'High',
      category: 'Bug Ticket',
      status: 'Closed',
      email: 'alex.rodriguez@discoveryparks.com.au',
      createdDate: '2024-12-11T09:45:00Z'
    },
    {
      id: 'example-4',
      title: 'Bulk export feature for AI tool usage reports',
      description: 'As a team manager, I need the ability to export usage reports for all AI tools in bulk for compliance and budgeting purposes.\n\nCurrent limitation: Reports must be exported individually for each tool\nDesired feature: Single export button that generates a comprehensive report\n\nUse case: Monthly reporting to leadership about AI tool adoption and ROI\nFormat preference: CSV or Excel with separate sheets for each tool',
      priority: 'Low',
      category: 'Feature Request',
      status: 'Open',
      email: 'jennifer.wong@discoveryparks.com.au',
      createdDate: '2024-12-10T16:20:00Z'
    },
    {
      id: 'example-5',
      title: 'Midjourney images fail to load in shared workspace',
      description: 'When multiple users try to access Midjourney-generated images in our shared workspace, images fail to load with a "403 Forbidden" error.\n\nError details:\n• Occurs only in shared workspace, not personal workspaces\n• Affects all image formats (PNG, JPG, WEBP)\n• Browser console shows CORS policy error\n• Images load fine when accessed directly from Midjourney\n\nImpact: Team cannot collaborate on visual projects effectively',
      priority: 'Medium',
      category: 'Bug Ticket',
      status: 'In Progress',
      email: 'david.taylor@discoveryparks.com.au',
      createdDate: '2024-12-09T11:30:00Z'
    }
  ];
};

// Initialize default knowledge articles and example tickets on first run
export const initializeDefaultData = (): void => {
  if (!safeLocalStorage.getItem(KNOWLEDGE_KEY)) {
    const defaultArticles = getDefaultKnowledgeArticles();
    safeLocalStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(defaultArticles));
  }
  
  // Add example tickets if none exist
  if (!safeLocalStorage.getItem(TICKETS_KEY)) {
    const defaultTickets = getDefaultTickets();
    safeLocalStorage.setItem(TICKETS_KEY, JSON.stringify(defaultTickets));
  }
}; 