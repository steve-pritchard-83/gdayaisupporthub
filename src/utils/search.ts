import type { Ticket, KnowledgeArticle } from '../types';

// Search utility functions
export const searchTickets = (tickets: Ticket[], query: string): Ticket[] => {
  if (!query.trim()) return tickets;
  
  const searchTerm = query.toLowerCase().trim();
  
  return tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchTerm) ||
    ticket.description.toLowerCase().includes(searchTerm) ||
    ticket.submitterName.toLowerCase().includes(searchTerm) ||
    ticket.type.toLowerCase().includes(searchTerm) ||
    ticket.status.toLowerCase().includes(searchTerm) ||
    ticket.priority.toLowerCase().includes(searchTerm) ||
    ticket.comments.some(comment => 
      comment.content.toLowerCase().includes(searchTerm) ||
      comment.author.toLowerCase().includes(searchTerm)
    )
  );
};

export const searchArticles = (articles: KnowledgeArticle[], query: string): KnowledgeArticle[] => {
  if (!query.trim()) return articles;
  
  const searchTerm = query.toLowerCase().trim();
  
  return articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm) ||
    article.content.toLowerCase().includes(searchTerm) ||
    article.category.toLowerCase().includes(searchTerm) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

// Advanced search with multiple criteria
export const advancedTicketSearch = (
  tickets: Ticket[], 
  filters: {
    query?: string;
    type?: 'bug' | 'feature' | 'all';
    status?: 'pending' | 'in-progress' | 'completed' | 'closed' | 'all';
    priority?: 'low' | 'medium' | 'high' | 'all';
    submitter?: string;
    dateRange?: { start: string; end: string };
  }
): Ticket[] => {
  let filtered = tickets;

  // Text search
  if (filters.query) {
    filtered = searchTickets(filtered, filters.query);
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(ticket => ticket.type === filters.type);
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(ticket => ticket.status === filters.status);
  }

  // Priority filter
  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(ticket => ticket.priority === filters.priority);
  }

  // Submitter filter
  if (filters.submitter) {
    filtered = filtered.filter(ticket => 
      ticket.submitterName.toLowerCase().includes(filters.submitter!.toLowerCase())
    );
  }

  // Date range filter
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    filtered = filtered.filter(ticket => {
      const created = new Date(ticket.createdAt);
      return created >= start && created <= end;
    });
  }

  return filtered;
};

// Search highlighting utility
export const highlightSearchText = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  const searchTerm = query.toLowerCase().trim();
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  return text.replace(regex, '<mark>$1</mark>');
};

// Search suggestions
export const getSearchSuggestions = (tickets: Ticket[], query: string): string[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const suggestions = new Set<string>();
  
  tickets.forEach(ticket => {
    // Title suggestions
    if (ticket.title.toLowerCase().includes(searchTerm)) {
      suggestions.add(ticket.title);
    }
    
    // Category suggestions
    if (ticket.type.toLowerCase().includes(searchTerm)) {
      suggestions.add(ticket.type);
    }
    
    // Status suggestions
    if (ticket.status.toLowerCase().includes(searchTerm)) {
      suggestions.add(ticket.status);
    }
  });
  
  return Array.from(suggestions).slice(0, 5);
}; 