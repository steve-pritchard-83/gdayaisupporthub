// Admin authentication types
export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  email: string;
  role: 'admin';
  loginTime: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  user: AdminUser | null;
  expiresAt: string;
}

// Admin dashboard analytics
export interface AdminAnalytics {
  totalTickets: number;
  ticketsByStatus: {
    open: number;
    inProgress: number;
    closed: number;
  };
  ticketsByPriority: {
    low: number;
    medium: number;
    high: number;
  };
  ticketsByCategory: {
    accessRequest: number;
    bugReport: number;
    featureRequest: number;
    generalSupport: number;
  };
  recentActivity: {
    newTicketsToday: number;
    closedTicketsToday: number;
    averageResponseTime: number;
  };
}

// Admin ticket actions
export interface AdminTicketAction {
  id: string;
  action: 'status_change' | 'priority_change' | 'delete' | 'bulk_update';
  ticketId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface BulkUpdateOptions {
  ticketIds: string[];
  status?: 'Open' | 'In Progress' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High';
} 