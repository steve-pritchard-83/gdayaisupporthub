'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, ArrowLeft, Clock, CheckCircle, AlertCircle, Calendar, User, Mail } from 'lucide-react';
import { Ticket, TicketFilters, Priority, Category, Status } from '@/types';
import { getTickets, saveTicket, deleteTicket } from '@/utils/localStorage';
import { isAdminAuthenticated } from '@/utils/adminAuth';

export default function ViewTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [filters, setFilters] = useState<TicketFilters>({
    searchTerm: '',
    status: undefined,
    priority: undefined,
    category: undefined,
  });

  // Load tickets on component mount
  useEffect(() => {
    const loadTickets = () => {
      const allTickets = getTickets();
      setTickets(allTickets);
      setLoading(false);
    };
    
    // Check admin authentication
    setIsAdmin(isAdminAuthenticated());
    
    loadTickets();
  }, []);

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status && ticket.status !== filters.status) {
        return false;
      }
      
      // Priority filter
      if (filters.priority && ticket.priority !== filters.priority) {
        return false;
      }
      
      // Category filter
      if (filters.category && ticket.category !== filters.category) {
        return false;
      }
      
      return true;
    });
  }, [tickets, filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: undefined,
      priority: undefined,
      category: undefined,
    });
  };

  // Handle status change
  const handleStatusChange = async (ticketId: string, newStatus: Status) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedDate: new Date().toISOString() }
        : ticket
    );
    
    setTickets(updatedTickets);
    
    // Save to localStorage
    const updatedTicket = updatedTickets.find(t => t.id === ticketId);
    if (updatedTicket) {
      await saveTicket(updatedTicket);
    }
  };

  // Handle ticket deletion
  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      const success = await deleteTicket(ticketId);
      if (success) {
        setTickets(tickets.filter(t => t.id !== ticketId));
      }
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  // Get status color
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-progress';
      case 'Closed': return 'status-closed';
      default: return 'status-open';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'Open': return Clock;
      case 'In Progress': return AlertCircle;
      case 'Closed': return CheckCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-secondary hover:text-primary mr-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Bug Reports & Feature Requests</h1>
          <p className="text-secondary text-lg">
            Track and manage all submitted reports and requests
          </p>
        </div>
        
        <Link href="/create" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card-compact">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 search-container">
            <input
              type="text"
              placeholder="Search reports..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="search-input"
            />
            <Search className="search-icon w-5 h-5" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-primary pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-3">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    status: e.target.value as Status || undefined 
                  }))}
                  className="form-select"
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-3">
                  Priority
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priority: e.target.value as Priority || undefined 
                  }))}
                  className="form-select"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-3">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    category: e.target.value as Category || undefined 
                  }))}
                  className="form-select"
                >
                  <option value="">All Categories</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Access Request">Access Request</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
            </div>
            
            {/* Clear Filters */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-secondary hover:text-accent transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary">
          {filteredTickets.length} of {tickets.length} reports
        </p>
        
        {filteredTickets.length === 0 && tickets.length > 0 && (
          <p className="text-sm text-muted">
            No reports match your current filters
          </p>
        )}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-dark-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              {tickets.length === 0 ? 'No Reports Yet' : 'No Reports Found'}
            </h3>
            <p className="text-secondary mb-6">
              {tickets.length === 0 
                ? 'Start by creating your first bug report or feature request.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {tickets.length === 0 && (
              <Link href="/create" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Report
              </Link>
            )}
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const StatusIcon = getStatusIcon(ticket.status);
            
            return (
              <div key={ticket.id} className="card-compact card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <StatusIcon className="w-5 h-5 text-secondary" />
                      <h3 className="text-lg font-semibold text-primary">{ticket.title}</h3>
                    </div>
                    
                    <p className="text-secondary mb-4 leading-relaxed">
                      {ticket.description.length > 150 
                        ? `${ticket.description.substring(0, 150)}...` 
                        : ticket.description
                      }
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(ticket.createdDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{ticket.category}</span>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{ticket.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-6">
                    <div className="flex flex-col items-end gap-2">
                      <span className={`${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex flex-col gap-2">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as Status)}
                          className="form-select text-sm py-1"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                        
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="btn-small-secondary text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 