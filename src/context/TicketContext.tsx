import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Ticket, Comment, KnowledgeArticle, AdminUser } from '../types';
import { ticketApi, articleApi } from '../utils/api';
// import { io, Socket } from 'socket.io-client'; // Disabled for Vercel deployment

interface TicketState {
  tickets: Ticket[];
  articles: KnowledgeArticle[];
  currentAdmin: AdminUser | null;
  loading: boolean;
  error: string | null;
}

interface TicketContextType {
  state: TicketState;
  // Actions
  loadTickets: () => Promise<void>;
  loadArticles: () => Promise<void>;
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>;
  archiveTicket: (id: string) => Promise<void>;
  loadArchivedTickets: () => Promise<Ticket[]>;
  restoreTicket: (id: string) => Promise<void>;
  deletePermanent: (id: string) => Promise<void>;
  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  setAdmin: (admin: AdminUser) => void;
  incrementArticleView: (articleId: string) => Promise<void>;
}

const initialState: TicketState = {
  tickets: [],
  articles: [],
  currentAdmin: null,
  loading: false,
  error: null
};

const TicketContext = createContext<TicketContextType | null>(null);

interface TicketProviderProps {
  children: ReactNode;
}

// Utility function to normalize ticket data from API
const normalizeTicket = (ticket: any): Ticket => {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    status: ticket.status,
    priority: ticket.priority,
    submitterName: ticket.submitterName || ticket.submitter_name,
    submitterEmail: ticket.submitterEmail || ticket.submitter_email,
    createdAt: ticket.createdAt || ticket.created_at,
    updatedAt: ticket.updatedAt || ticket.updated_at,
    comments: ticket.comments ? ticket.comments.map(normalizeComment) : []
  };
};

// Utility function to normalize comment data from API
const normalizeComment = (comment: any): Comment => {
  return {
    id: comment.id,
    ticketId: comment.ticketId || comment.ticket_id,
    author: comment.author,
    content: comment.content,
    createdAt: comment.createdAt || comment.created_at,
    isAdminComment: comment.isAdminComment || comment.is_admin_comment
  };
};

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const [state, setState] = useState<TicketState>(initialState);
  // const [socket, setSocket] = useState<Socket | null>(null); // Disabled for Vercel

  // Socket.io initialization disabled for Vercel deployment
  // Vercel doesn't support WebSocket connections
  /*
  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on('new-ticket', (rawTicket: any) => {
      const ticket = normalizeTicket(rawTicket);
      setState(prev => ({
        ...prev,
        tickets: [ticket, ...prev.tickets]
      }));
    });

    newSocket.on('ticket-updated', (rawUpdatedTicket: any) => {
      const updatedTicket = normalizeTicket(rawUpdatedTicket);
      setState(prev => ({
        ...prev,
        tickets: prev.tickets.map(ticket => 
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      }));
    });

    newSocket.on('new-comment', (rawComment: any) => {
      const comment = normalizeComment(rawComment);
      setState(prev => ({
        ...prev,
        tickets: prev.tickets.map(ticket => 
          ticket.id === comment.ticketId 
            ? { ...ticket, comments: [...(ticket.comments || []), comment] }
            : ticket
        )
      }));
    });

    newSocket.on('ticket-archived', (data: { id: string }) => {
      setState(prev => ({
        ...prev,
        tickets: prev.tickets.filter(ticket => ticket.id !== data.id)
      }));
    });

    newSocket.on('ticket-restored', (rawTicket: any) => {
      const ticket = normalizeTicket(rawTicket);
      setState(prev => ({
        ...prev,
        tickets: [ticket, ...prev.tickets]
      }));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Join admin room when admin is set
  useEffect(() => {
    if (socket && state.currentAdmin) {
      socket.emit('join-admin');
    }
  }, [socket, state.currentAdmin]);
  */

  // Load initial data
  useEffect(() => {
    loadTickets();
    loadArticles();
  }, []);

  const loadTickets = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const rawTickets = await ticketApi.getAll();
      const tickets = rawTickets.map(normalizeTicket);
      setState(prev => ({ ...prev, tickets, loading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load tickets'
      }));
    }
  };

  const loadArticles = async () => {
    try {
      const articles = await articleApi.getAll();
      setState(prev => ({ ...prev, articles }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load articles'
      }));
    }
  };

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    try {
      const newTicket = await ticketApi.create({
        title: ticketData.title,
        description: ticketData.description,
        type: ticketData.type,
        priority: ticketData.priority,
        submitterName: ticketData.submitterName,
        submitterEmail: ticketData.submitterEmail
      });
      
      // Without socket.io, we need to update local state manually
      const normalizedTicket = normalizeTicket(newTicket);
      setState(prev => ({
        ...prev,
        tickets: [normalizedTicket, ...prev.tickets]
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create ticket'
      }));
      throw error;
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      await ticketApi.update(id, {
        status: updates.status,
        priority: updates.priority
      });
      
      // Without socket.io, we need to update local state manually
      setState(prev => ({
        ...prev,
        tickets: prev.tickets.map(ticket => 
          ticket.id === id ? { ...ticket, ...updates } : ticket
        )
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to update ticket'
      }));
      throw error;
    }
  };

  const addComment = async (ticketId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      const newComment = await ticketApi.addComment(ticketId, {
        author: commentData.author,
        content: commentData.content,
        isAdminComment: commentData.isAdminComment
      });
      
      // Without socket.io, we need to update local state manually
      const normalizedComment = normalizeComment(newComment);
      setState(prev => ({
        ...prev,
        tickets: prev.tickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, comments: [...(ticket.comments || []), normalizedComment] }
            : ticket
        )
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to add comment'
      }));
      throw error;
    }
  };

  const archiveTicket = async (id: string) => {
    try {
      await ticketApi.archive(id);
      
      // Without socket.io, we need to update local state manually
      setState(prev => ({
        ...prev,
        tickets: prev.tickets.filter(ticket => ticket.id !== id)
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to archive ticket'
      }));
      throw error;
    }
  };

  const loadArchivedTickets = async (): Promise<Ticket[]> => {
    try {
      const rawTickets = await ticketApi.getArchived();
      return rawTickets.map(normalizeTicket);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load archived tickets'
      }));
      throw error;
    }
  };

  const restoreTicket = async (id: string) => {
    try {
      await ticketApi.restore(id);
      
      // Without socket.io, we need to reload tickets to show the restored one
      await loadTickets();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to restore ticket'
      }));
      throw error;
    }
  };

  const deletePermanent = async (id: string) => {
    try {
      await ticketApi.deletePermanent(id);
      // No need to update local state as this only affects archived tickets
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to delete ticket permanently'
      }));
      throw error;
    }
  };

  const setAdmin = (admin: AdminUser) => {
    setState(prev => ({ ...prev, currentAdmin: admin }));
  };

  const incrementArticleView = async (articleId: string) => {
    try {
      await articleApi.incrementView(articleId);
      // Update local state
      setState(prev => ({
        ...prev,
        articles: prev.articles.map(article => 
          article.id === articleId 
            ? { ...article, views: article.views + 1 }
            : article
        )
      }));
    } catch (error) {
      // Don't show error for view increment failures
      console.error('Failed to increment article view:', error);
    }
  };

  const contextValue: TicketContextType = {
    state,
    loadTickets,
    loadArticles,
    createTicket,
    updateTicket,
    addComment,
    archiveTicket,
    loadArchivedTickets,
    restoreTicket,
    deletePermanent,
    setAdmin,
    incrementArticleView
  };

  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export default TicketProvider; 