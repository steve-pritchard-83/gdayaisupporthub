'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, ArrowLeft, Clock, CheckCircle, AlertCircle, Calendar, User } from 'lucide-react';
import { Ticket, TicketFilters, Priority, Category, Status } from '@/types';
import { getTickets, saveTicket, deleteTicket } from '@/utils/localStorage';

export default function ViewTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
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
    }).sort((a, b) => {
      // Sort by created date (newest first)
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });
  }, [tickets, filters]);

  // Update ticket status
  const updateTicketStatus = (ticketId: string, newStatus: Status) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        const updatedTicket = { ...ticket, status: newStatus };
        saveTicket(updatedTicket); // Save to localStorage
        return updatedTicket;
      }
      return ticket;
    });
    setTickets(updatedTickets);
  };

  // Delete ticket
  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      deleteTicket(ticketId);
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: undefined,
      priority: undefined,
      category: undefined,
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-progress';
      case 'Closed':
        return 'status-closed';
      default:
        return 'status-open';
    }
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Low':
        return 'priority-low';
      case 'Medium':
        return 'priority-medium';
      case 'High':
        return 'priority-high';
      default:
        return 'priority-medium';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-grey-600 hover:text-grey-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-grey-900">Support Tickets</h1>
          <p className="text-grey-600 mt-1">
            Manage and track all support requests
          </p>
        </div>
        
        <Link href="/create" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create New Ticket
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-grey-300 rounded-lg focus-ring"
              />
            </div>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-grey-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    status: e.target.value as Status || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-grey-300 rounded-lg focus-ring"
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priority: e.target.value as Priority || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-grey-300 rounded-lg focus-ring"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    category: e.target.value as Category || undefined 
                  }))}
                  className="w-full px-3 py-2 border border-grey-300 rounded-lg focus-ring"
                >
                  <option value="">All Categories</option>
                  <option value="Access Request">Access Request</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>
            </div>
            
            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-grey-600 hover:text-grey-900"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-grey-600">
          {filteredTickets.length} of {tickets.length} tickets
        </p>
        
        {filteredTickets.length === 0 && tickets.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-accent hover:text-accent-dark"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-grey-400" />
          </div>
          <h3 className="text-lg font-medium text-grey-900 mb-2">
            {tickets.length === 0 ? 'No tickets yet' : 'No tickets found'}
          </h3>
          <p className="text-grey-600 mb-6">
            {tickets.length === 0 
              ? 'Create your first support ticket to get started.'
              : 'Try adjusting your search or filters.'
            }
          </p>
          <Link href="/create" className="btn-primary">
            Create New Ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="card card-hover">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Ticket Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-grey-900">
                      {ticket.title}
                    </h3>
                    <span className={`${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  
                  <p className="text-grey-600 mb-3 line-clamp-2">
                    {ticket.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-grey-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(ticket.createdDate)}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {ticket.category}
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-grey-400 rounded-full mr-1"></span>
                      ID: {ticket.id.slice(-6)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Status Change */}
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value as Status)}
                    className="px-3 py-1 text-sm border border-grey-300 rounded focus-ring"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                                         className="px-3 py-1 text-sm text-black hover:text-white border border-accent rounded hover:bg-accent"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 