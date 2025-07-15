import { AdminCredentials, AdminUser, AdminSession, AdminAnalytics } from '@/types/admin';
import { getTickets } from './localStorage';

// 🔧 HARDCODED ADMIN CREDENTIALS - For POC development
const ADMIN_EMAIL = 'steve.pritchard@discoveryparks.com.au';
const ADMIN_PASSWORD = '123456';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const ADMIN_SESSION_KEY = 'gday-admin-session';

// Safe localStorage for admin session
const safeAdminStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get admin session:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to set admin session:', error);
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove admin session:', error);
      return false;
    }
  }
};

// Authenticate admin user
export const authenticateAdmin = (credentials: AdminCredentials): boolean => {
  // 🔧 HARDCODED AUTHENTICATION - Simple but effective for POC
  if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
    const session: AdminSession = {
      isAuthenticated: true,
      user: {
        email: ADMIN_EMAIL,
        role: 'admin',
        loginTime: new Date().toISOString(),
      },
      expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
    };
    
    safeAdminStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    return true;
  }
  
  return false;
};

// Check if admin is authenticated
export const isAdminAuthenticated = (): boolean => {
  const sessionData = safeAdminStorage.getItem(ADMIN_SESSION_KEY);
  if (!sessionData) return false;
  
  try {
    const session: AdminSession = JSON.parse(sessionData);
    const now = new Date().getTime();
    const expiresAt = new Date(session.expiresAt).getTime();
    
    if (now > expiresAt) {
      // Session expired, clear it
      safeAdminStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    
    return session.isAuthenticated;
  } catch (error) {
    console.error('Failed to parse admin session:', error);
    return false;
  }
};

// Get current admin session
export const getAdminSession = (): AdminSession | null => {
  const sessionData = safeAdminStorage.getItem(ADMIN_SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    const session: AdminSession = JSON.parse(sessionData);
    const now = new Date().getTime();
    const expiresAt = new Date(session.expiresAt).getTime();
    
    if (now > expiresAt) {
      // Session expired, clear it
      safeAdminStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to parse admin session:', error);
    return null;
  }
};

// Logout admin
export const logoutAdmin = (): boolean => {
  return safeAdminStorage.removeItem(ADMIN_SESSION_KEY);
};

// Calculate admin analytics
export const calculateAdminAnalytics = (): AdminAnalytics => {
  const tickets = getTickets();
  const today = new Date().toISOString().split('T')[0];
  
  // Count tickets by status
  const ticketsByStatus = {
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
  };
  
  // Count tickets by priority
  const ticketsByPriority = {
    low: tickets.filter(t => t.priority === 'Low').length,
    medium: tickets.filter(t => t.priority === 'Medium').length,
    high: tickets.filter(t => t.priority === 'High').length,
  };
  
  // Count tickets by category
  const ticketsByCategory = {
    accessRequest: tickets.filter(t => t.category === 'Access Request').length,
    bugReport: tickets.filter(t => t.category === 'Bug Report').length,
    featureRequest: tickets.filter(t => t.category === 'Feature Request').length,
    generalSupport: tickets.filter(t => t.category === 'General Support').length,
  };
  
  // Calculate recent activity
  const todayTickets = tickets.filter(t => t.createdDate.startsWith(today));
  const closedToday = tickets.filter(t => 
    t.status === 'Closed' && 
    (t.updatedDate?.startsWith(today) || t.createdDate.startsWith(today))
  );
  
  // 🔧 BASIC CALCULATION - Average response time (simplified)
  const avgResponseTime = tickets.length > 0 ? 
    Math.round((closedToday.length / tickets.length) * 24) : 0;
  
  return {
    totalTickets: tickets.length,
    ticketsByStatus,
    ticketsByPriority,
    ticketsByCategory,
    recentActivity: {
      newTicketsToday: todayTickets.length,
      closedTicketsToday: closedToday.length,
      averageResponseTime: avgResponseTime,
    },
  };
};

// Extend admin session (refresh)
export const extendAdminSession = (): boolean => {
  const currentSession = getAdminSession();
  if (!currentSession) return false;
  
  const extendedSession: AdminSession = {
    ...currentSession,
    expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
  };
  
  return safeAdminStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(extendedSession));
};

// Check if user is admin by email
export const isAdminUser = (email: string): boolean => {
  return email === ADMIN_EMAIL;
}; 