import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Ticket, Comment, KnowledgeArticle, AdminUser } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TicketState {
  tickets: Ticket[];
  articles: KnowledgeArticle[];
  adminUsers: AdminUser[];
  currentAdmin: AdminUser | null;
}

type TicketAction = 
  | { type: 'ADD_TICKET'; payload: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'> }
  | { type: 'UPDATE_TICKET'; payload: { id: string; updates: Partial<Ticket> } }
  | { type: 'ADD_COMMENT'; payload: { ticketId: string; comment: Omit<Comment, 'id' | 'createdAt'> } }
  | { type: 'SET_ADMIN'; payload: AdminUser }
  | { type: 'LOAD_INITIAL_DATA' };

const initialState: TicketState = {
  tickets: [],
  articles: [
    {
      id: '1',
      title: 'Getting Started with G\'day AI',
      content: 'Welcome to G\'day AI! This guide will help you get started with our Open WebUI LLM tool. Learn how to create your first conversation, customize settings, and make the most of our AI assistant.',
      category: 'Getting Started',
      tags: ['beginner', 'setup', 'introduction'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 45
    },
    {
      id: '2',
      title: 'Advanced Prompt Engineering',
      content: 'Learn advanced techniques for crafting effective prompts that get better results from G\'day AI. Discover how to structure your requests, use context effectively, and optimize for specific use cases.',
      category: 'Advanced',
      tags: ['prompts', 'advanced', 'optimization'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 32
    },
    {
      id: '3',
      title: 'Troubleshooting Common Issues',
      content: 'Having trouble with G\'day AI? This article covers the most common issues users face and how to resolve them. From connection problems to unexpected responses, we\'ve got you covered.',
      category: 'Troubleshooting',
      tags: ['help', 'troubleshooting', 'common-issues'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 78
    }
  ],
  adminUsers: [
    { id: '1', name: 'Steve', isActive: true },
    { id: '2', name: 'Nolan', isActive: true }
  ],
  currentAdmin: null
};

const ticketReducer = (state: TicketState, action: TicketAction): TicketState => {
  switch (action.type) {
    case 'ADD_TICKET':
      const newTicket: Ticket = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: []
      };
      return {
        ...state,
        tickets: [...state.tickets, newTicket]
      };
    
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.id
            ? { ...ticket, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : ticket
        )
      };
    
    case 'ADD_COMMENT':
      const comment: Comment = {
        ...action.payload.comment,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      return {
        ...state,
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.ticketId
            ? { ...ticket, comments: [...ticket.comments, comment], updatedAt: new Date().toISOString() }
            : ticket
        )
      };
    
    case 'SET_ADMIN':
      return {
        ...state,
        currentAdmin: action.payload
      };
    
    case 'LOAD_INITIAL_DATA':
      // Load some sample data for demonstration
      const sampleTickets: Ticket[] = [
        {
          id: uuidv4(),
          title: 'G\'day AI not responding to complex queries',
          description: 'When I ask complex multi-part questions, G\'day AI sometimes doesn\'t respond or gives incomplete answers. This happens especially with technical questions about data analysis.',
          type: 'bug',
          status: 'pending',
          priority: 'high',
          submitterName: 'John Smith',
          submitterEmail: 'john.smith@example.com',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          comments: []
        },
        {
          id: uuidv4(),
          title: 'Add support for file uploads',
          description: 'It would be great if G\'day AI could analyze uploaded documents, images, and spreadsheets. This would make it much more useful for business workflows.',
          type: 'feature',
          status: 'in-progress',
          priority: 'medium',
          submitterName: 'Sarah Johnson',
          submitterEmail: 'sarah.j@company.com',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updatedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          comments: [
            {
              id: uuidv4(),
              ticketId: '',
              author: 'Steve',
              content: 'Great suggestion! We\'re currently evaluating different approaches for file upload support. Will keep you updated on progress.',
              createdAt: new Date(Date.now() - 43200000).toISOString(),
              isAdminComment: true
            }
          ]
        }
      ];
      
      // Fix the comment ticketId references
      sampleTickets[1].comments[0].ticketId = sampleTickets[1].id;
      
      return {
        ...state,
        tickets: sampleTickets
      };
    
    default:
      return state;
  }
};

const TicketContext = createContext<{
  state: TicketState;
  dispatch: React.Dispatch<TicketAction>;
} | null>(null);

interface TicketProviderProps {
  children: ReactNode;
}

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(ticketReducer, initialState);

  // Load initial data on mount
  React.useEffect(() => {
    dispatch({ type: 'LOAD_INITIAL_DATA' });
  }, []);

  return (
    <TicketContext.Provider value={{ state, dispatch }}>
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