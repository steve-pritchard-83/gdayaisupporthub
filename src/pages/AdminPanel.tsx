import React, { useState } from 'react';
import { Users, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import TicketCard from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import AdminSelector from '../components/AdminSelector';
import type { Ticket, TicketStatus } from '../types';

const AdminPanel: React.FC = () => {
  const { state } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'bug' | 'feature'>('all');

  const filteredTickets = state.tickets.filter(ticket => {
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
          <h2>Tickets ({filteredTickets.length})</h2>
          <div className="admin-actions">
            <span className="text-muted">
              {state.currentAdmin ? `Logged in as ${state.currentAdmin.name}` : 'Select admin to manage tickets'}
            </span>
          </div>
        </div>

        {sortedTickets.length === 0 ? (
          <div className="empty-state">
            <Filter size={48} />
            <h3>No tickets found</h3>
            <p>No tickets match your current filters.</p>
          </div>
        ) : (
          <div className="admin-tickets-grid">
            {sortedTickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onClick={() => setSelectedTicket(ticket)}
              />
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