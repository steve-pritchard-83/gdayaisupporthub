import React, { useState, useEffect } from 'react';
import { Users, Filter, CheckCircle, Clock, AlertCircle, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import TicketCard from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import AdminSelector from '../components/AdminSelector';
import type { Ticket, TicketStatus } from '../types';

const AdminPanel: React.FC = () => {
  const { state, loadArchivedTickets, restoreTicket, deletePermanent } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'bug' | 'feature'>('all');
  const [currentView, setCurrentView] = useState<'active' | 'archived'>('active');
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  // Load archived tickets when switching to archived view
  useEffect(() => {
    if (currentView === 'archived' && state.currentAdmin) {
      setIsLoadingArchived(true);
      loadArchivedTickets()
        .then(tickets => {
          setArchivedTickets(tickets);
        })
        .catch(error => {
          console.error('Failed to load archived tickets:', error);
        })
        .finally(() => {
          setIsLoadingArchived(false);
        });
    }
  }, [currentView, state.currentAdmin, loadArchivedTickets]);

  const currentTickets = currentView === 'active' ? state.tickets : archivedTickets;

  const filteredTickets = currentTickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesType = typeFilter === 'all' || ticket.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const sortedTickets = filteredTickets.sort((a, b) => {
    // Sort by priority (high first), then by creation date (newest first)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusStats = () => {
    const stats = {
      pending: state.tickets.filter(t => t.status === 'pending').length,
      'in-progress': state.tickets.filter(t => t.status === 'in-progress').length,
      completed: state.tickets.filter(t => t.status === 'completed').length,
      closed: state.tickets.filter(t => t.status === 'closed').length
    };
    return stats;
  };

  const stats = getStatusStats();

  const handleRestoreTicket = async (ticketId: string) => {
    if (!state.currentAdmin) {
      alert('Please log in as an admin to restore tickets');
      return;
    }

    const confirmRestore = window.confirm('Are you sure you want to restore this ticket? It will be visible to users again.');
    if (!confirmRestore) return;

    try {
      await restoreTicket(ticketId);
      // Remove from archived tickets list
      setArchivedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      alert('Ticket restored successfully');
    } catch (error) {
      alert('Failed to restore ticket. Please try again.');
    }
  };

  const handlePermanentDelete = async (ticketId: string) => {
    if (!state.currentAdmin) {
      alert('Please log in as an admin to delete tickets');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to PERMANENTLY delete this ticket?\n\nThis action cannot be undone and will remove all ticket data and comments forever.'
    );
    if (!confirmDelete) return;

    // Double confirmation for permanent deletion
    const doubleConfirm = window.confirm('This is your final warning. The ticket will be permanently deleted. Are you absolutely sure?');
    if (!doubleConfirm) return;

    try {
      await deletePermanent(ticketId);
      // Remove from archived tickets list
      setArchivedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      alert('Ticket permanently deleted');
    } catch (error) {
      alert('Failed to delete ticket. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="admin-header">
        <div>
          <h1>Admin Panel</h1>
          <p>Manage and triage support tickets for G'day AI</p>
        </div>
        <AdminSelector />
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card pending">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="admin-stat-card in-progress">
          <div className="stat-icon">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats['in-progress']}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="admin-stat-card completed">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="admin-stat-card closed">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.closed}</h3>
            <p>Closed</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${currentView === 'active' ? 'active' : ''}`}
            onClick={() => setCurrentView('active')}
          >
            <Users size={16} />
            Active Tickets
          </button>
          <button 
            className={`tab-button ${currentView === 'archived' ? 'active' : ''}`}
            onClick={() => setCurrentView('archived')}
          >
            <Archive size={16} />
            Archived Tickets
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <div className="filter-group">
          <label>Status Filter:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Type Filter:</label>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'bug' | 'feature')}
            className="form-select"
          >
            <option value="all">All Types</option>
            <option value="bug">Bug Reports</option>
            <option value="feature">Feature Requests</option>
          </select>
        </div>
      </div>

      <div className="tickets-section">
        <div className="section-header">
          <h2>
            {currentView === 'active' ? 'Active Tickets' : 'Archived Tickets'} ({filteredTickets.length})
          </h2>
          <div className="admin-actions">
            <span className="text-muted">
              {state.currentAdmin ? `Logged in as ${state.currentAdmin.name}` : 'Select admin to manage tickets'}
            </span>
          </div>
        </div>

        {isLoadingArchived ? (
          <div className="loading-state">
            <Clock size={48} />
            <h3>Loading archived tickets...</h3>
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="empty-state">
            <Filter size={48} />
            <h3>No tickets found</h3>
            <p>
              {currentView === 'active' 
                ? 'No active tickets match your current filters.' 
                : 'No archived tickets match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="admin-tickets-grid">
            {sortedTickets.map(ticket => (
              <div key={ticket.id} className="ticket-card-container">
                <TicketCard 
                  ticket={ticket} 
                  onClick={() => setSelectedTicket(ticket)}
                />
                {currentView === 'archived' && state.currentAdmin && (
                  <div className="archived-ticket-actions">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreTicket(ticket.id);
                      }}
                      title="Restore ticket"
                    >
                      <RotateCcw size={14} />
                      Restore
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePermanentDelete(ticket.id);
                      }}
                      title="Permanently delete ticket"
                    >
                      <Trash2 size={14} />
                      Delete Forever
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  );
};

export default AdminPanel; 