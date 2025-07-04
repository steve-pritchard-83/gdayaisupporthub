export interface Ticket {
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
  comments: Comment[];
}

export interface Comment {
  id: string;
  ticketId: string;
  author: string;
  content: string;
  createdAt: string;
  isAdminComment: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface AdminUser {
  id: string;
  name: string;
  isActive: boolean;
}

export type TicketStatus = 'pending' | 'in-progress' | 'completed' | 'closed';
export type TicketType = 'bug' | 'feature';
export type Priority = 'low' | 'medium' | 'high'; 