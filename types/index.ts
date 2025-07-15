// Ticket priority levels
export type Priority = 'Low' | 'Medium' | 'High';

// Ticket categories
export type Category = 'Access Request' | 'Technical Issue' | 'General Support';

// Ticket status
export type Status = 'Open' | 'In Progress' | 'Closed';

// Main ticket interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  status: Status;
  createdDate: string; // ISO string format
  updatedDate?: string; // ISO string format
}

// Knowledge base article interface
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdDate: string; // ISO string format
  updatedDate?: string; // ISO string format
}

// Filter options for tickets
export interface TicketFilters {
  status?: Status;
  priority?: Priority;
  category?: Category;
  searchTerm?: string;
}

// Stats interface for dashboard
export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  highPriority: number;
} 