import type { Ticket, Comment, AdminUser } from '../types';

interface DemoEvent {
  timestamp: number;
  type: 'new_ticket' | 'admin_response' | 'status_change' | 'bulk_update';
  data: any;
}

interface DemoNotification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
}

class DemoService {
  private isRunning = false;
  private startTime = 0;
  private events: DemoEvent[] = [];
  private notifications: DemoNotification[] = [];
  private onTicketCreate?: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => Promise<void>;
  private onTicketUpdate?: (id: string, updates: Partial<Ticket>) => Promise<void>;
  private onCommentAdd?: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
  private onNotification?: (notification: DemoNotification) => void;
  private getCurrentTickets?: () => Ticket[];

  // Realistic demo data
  private demoTickets = [
    {
      title: "Unable to access G'day AI dashboard",
      description: "Getting a 403 error when trying to log into the main dashboard. Tried clearing cache and cookies but still having issues.",
      type: 'bug' as const,
      priority: 'high' as const,
      status: 'pending' as const,
      submitterName: "Sarah Chen",
      submitterEmail: "sarah.chen@techcorp.com"
    },
    {
      title: "Feature request: Dark mode support",
      description: "Would love to have a dark mode option for the interface. Working late nights and the bright interface is tough on the eyes.",
      type: 'feature' as const,
      priority: 'medium' as const,
      status: 'pending' as const,
      submitterName: "Mike Rodriguez",
      submitterEmail: "mike.r@startup.io"
    },
    {
      title: "API rate limiting too aggressive",
      description: "Our integration is hitting rate limits with just 50 requests per minute. Can this be increased for enterprise accounts?",
      type: 'bug' as const,
      priority: 'high' as const,
      status: 'pending' as const,
      submitterName: "David Kim",
      submitterEmail: "david@enterprise.com"
    },
    {
      title: "Training materials needed",
      description: "New team members need comprehensive training docs. Current documentation is quite sparse.",
      type: 'feature' as const,
      priority: 'medium' as const,
      status: 'pending' as const,
      submitterName: "Lisa Thompson",
      submitterEmail: "lisa.t@bigcompany.com"
    },
    {
      title: "Integration with Slack not working",
      description: "The Slack integration stopped working after the latest update. No notifications are coming through.",
      type: 'bug' as const,
      priority: 'high' as const,
      status: 'pending' as const,
      submitterName: "James Wilson",
      submitterEmail: "james@growthstage.com"
    }
  ];

  private demoResponses = [
    "Thanks for reporting this! I've escalated to our engineering team and they're investigating now. We'll have an update within 2 hours.",
    "Great suggestion! This is actually on our roadmap for Q1. I'll add your vote to the feature request.",
    "I see the issue - this is related to our recent security update. Pushing a fix now, should be resolved in 10 minutes.",
    "I've sent you the comprehensive training materials via email. Let me know if you need anything else!",
    "This is a known issue with our latest release. Rolling back the problematic change now - ETA 15 minutes.",
    "I've increased your rate limit to 500 requests/minute. The change should be active immediately."
  ];

  private demoAdmin: AdminUser = {
    id: 'demo-admin',
    name: 'Alex Demo',
    role: 'admin',
    isActive: true
  };

  constructor() {
    this.setupDemoSequence();
  }

  private setupDemoSequence() {
    // Create a 60-second demo sequence
    this.events = [
      { timestamp: 2000, type: 'new_ticket', data: { ticketIndex: 0 } },
      { timestamp: 8000, type: 'admin_response', data: { responseIndex: 0 } },
      { timestamp: 12000, type: 'status_change', data: { status: 'in-progress' } },
      { timestamp: 18000, type: 'new_ticket', data: { ticketIndex: 1 } },
      { timestamp: 25000, type: 'admin_response', data: { responseIndex: 1 } },
      { timestamp: 30000, type: 'new_ticket', data: { ticketIndex: 2 } },
      { timestamp: 35000, type: 'status_change', data: { status: 'completed' } },
      { timestamp: 40000, type: 'admin_response', data: { responseIndex: 2 } },
      { timestamp: 45000, type: 'new_ticket', data: { ticketIndex: 3 } },
      { timestamp: 50000, type: 'bulk_update', data: { count: 3 } },
      { timestamp: 55000, type: 'new_ticket', data: { ticketIndex: 4 } },
    ];
  }

  public startDemo(callbacks: {
    onTicketCreate: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => Promise<void>;
    onTicketUpdate: (id: string, updates: Partial<Ticket>) => Promise<void>;
    onCommentAdd: (ticketId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>;
    onNotification: (notification: DemoNotification) => void;
    getCurrentTickets: () => Ticket[];
  }) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = Date.now();
    this.onTicketCreate = callbacks.onTicketCreate;
    this.onTicketUpdate = callbacks.onTicketUpdate;
    this.onCommentAdd = callbacks.onCommentAdd;
    this.onNotification = callbacks.onNotification;
    this.getCurrentTickets = callbacks.getCurrentTickets;

    // Show demo start notification
    this.showNotification('info', 'Demo Started', 'Watch live ticket management in action!');

    // Schedule all events
    this.events.forEach(event => {
      setTimeout(async () => {
        if (this.isRunning) {
          await this.executeEvent(event);
        }
      }, event.timestamp);
    });

    // Auto-stop after 60 seconds
    setTimeout(() => {
      this.stopDemo();
    }, 60000);
  }

  private async executeEvent(event: DemoEvent) {
    switch (event.type) {
      case 'new_ticket':
        await this.createDemoTicket(event.data.ticketIndex);
        break;
      case 'admin_response':
        const tickets = this.getCurrentTickets?.() || [];
        if (tickets.length > 0) {
          const ticketId = tickets[tickets.length - 1].id; // Get the most recent ticket
          this.addDemoResponse(ticketId, event.data.responseIndex);
        }
        break;
      case 'status_change':
        const ticketsForStatus = this.getCurrentTickets?.() || [];
        if (ticketsForStatus.length > 0) {
          const ticketId = ticketsForStatus[ticketsForStatus.length - 1].id; // Get the most recent ticket
          this.updateTicketStatus(ticketId, event.data.status);
        }
        break;
      case 'bulk_update':
        this.showBulkUpdateDemo(event.data.count);
        break;
    }
  }

  private async createDemoTicket(index: number) {
    const ticketData = this.demoTickets[index % this.demoTickets.length];
    if (this.onTicketCreate) {
      try {
        await this.onTicketCreate(ticketData);
        this.showNotification('success', 'New Ticket', `"${ticketData.title}" from ${ticketData.submitterName}`);
      } catch (error) {
        console.error('Error creating demo ticket:', error);
      }
    }
  }

  private addDemoResponse(ticketId: string, responseIndex: number) {
    const response = this.demoResponses[responseIndex % this.demoResponses.length];
    if (this.onCommentAdd) {
      this.onCommentAdd(ticketId, {
        ticketId,
        author: this.demoAdmin.name,
        content: response,
        isAdminComment: true
      });
    }
    this.showNotification('info', 'Admin Response', `${this.demoAdmin.name} responded to ticket`);
  }

  private updateTicketStatus(ticketId: string, status: string) {
    if (this.onTicketUpdate) {
      this.onTicketUpdate(ticketId, { status: status as any });
    }
    this.showNotification('success', 'Status Updated', `Ticket moved to ${status}`);
  }

  private showBulkUpdateDemo(count: number) {
    this.showNotification('info', 'Bulk Action', `${count} tickets updated automatically`);
  }

  private showNotification(type: 'success' | 'info' | 'warning', title: string, message: string) {
    const notification: DemoNotification = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now()
    };
    
    this.notifications.push(notification);
    if (this.onNotification) {
      this.onNotification(notification);
    }
  }



  public stopDemo() {
    this.isRunning = false;
    this.showNotification('info', 'Demo Complete', 'Thanks for watching! Demo mode will continue with enhanced features.');
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public getNotifications(): DemoNotification[] {
    return this.notifications;
  }

  public clearNotifications() {
    this.notifications = [];
  }
}

export default new DemoService();
export type { DemoNotification }; 