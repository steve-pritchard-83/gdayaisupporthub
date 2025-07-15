import { Ticket, KnowledgeArticle, TicketStats } from '@/types';

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
    return JSON.parse(data);
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
      title: 'How do I request access to ChatGPT?',
      content: 'To request access to ChatGPT, create a new ticket with the category "Access Request" and specify which AI tool you need access to. Include your business justification and expected usage.',
      category: 'Access Request',
      tags: ['chatgpt', 'access', 'ai-tools'],
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-2',
      title: 'What AI tools are available?',
      content: 'Currently available AI tools include: ChatGPT, Claude, GitHub Copilot, Midjourney, and Stable Diffusion. Each tool requires separate access approval.',
      category: 'General Support',
      tags: ['ai-tools', 'available', 'list'],
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-3',
      title: 'Why is my AI tool not working?',
      content: 'Common issues include: 1) Expired access token, 2) Network connectivity problems, 3) Service maintenance. Try refreshing your session first, then create a technical issue ticket if the problem persists.',
      category: 'Technical Issue',
      tags: ['troubleshooting', 'technical', 'not-working'],
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-4',
      title: 'How long does access approval take?',
      content: 'Access requests are typically processed within 1-2 business days. High priority requests may be processed faster. You\'ll receive an email notification once approved.',
      category: 'Access Request',
      tags: ['approval', 'timeline', 'processing'],
      createdDate: '2024-01-01T00:00:00Z'
    },
    {
      id: 'faq-5',
      title: 'Can I use AI tools for personal projects?',
      content: 'AI tools provided through this system are for work-related projects only. Personal use is not permitted under the current licensing agreement.',
      category: 'General Support',
      tags: ['policy', 'personal-use', 'licensing'],
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

// Initialize default knowledge articles on first run
export const initializeDefaultData = (): void => {
  if (!safeLocalStorage.getItem(KNOWLEDGE_KEY)) {
    const defaultArticles = getDefaultKnowledgeArticles();
    safeLocalStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(defaultArticles));
  }
}; 