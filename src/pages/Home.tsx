import React, { useState, useEffect } from 'react';
import { Plus, Bug, Lightbulb, Archive, List, BookOpen } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import TicketCard from '../components/TicketCard';
import TicketForm from '../components/TicketForm';
import TicketModal from '../components/TicketModal';
import type { Ticket } from '../types';
import { ticketApi } from '../utils/api';

const Home: React.FC = () => {
  const { state } = useTickets();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'bug' | 'feature'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [viewMode, setViewMode] = useState<'recent' | 'allTickets'>('recent');
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);

  // Load archived tickets when user wants to see all tickets with archived ones
  useEffect(() => {
    if (viewMode === 'allTickets' && includeArchived && archivedTickets.length === 0) {
      setIsLoadingArchived(true);
      ticketApi.getArchived()
        .then(tickets => {
          setArchivedTickets(tickets.map((ticket: any) => ({
            ...ticket,
            submitterName: ticket.submitterName || ticket.submitter_name,
            submitterEmail: ticket.submitterEmail || ticket.submitter_email,
            createdAt: ticket.createdAt || ticket.created_at,
            updatedAt: ticket.updatedAt || ticket.updated_at,
            comments: ticket.comments || []
          })));
        })
        .catch(error => {
          console.error('Failed to load archived tickets:', error);
        })
        .finally(() => {
          setIsLoadingArchived(false);
        });
    }
  }, [viewMode, includeArchived, archivedTickets.length]);

  // Get all tickets (active + archived if requested)
  const getAllTickets = () => {
    let allTickets = [...state.tickets];
    if (includeArchived) {
      allTickets = [...allTickets, ...archivedTickets];
    }
    return allTickets;
  };

  // Filter tickets based on type
  const filteredTickets = (viewMode === 'recent' ? state.tickets : getAllTickets()).filter(ticket => {
    if (filter === 'all') return true;
    return ticket.type === filter;
  });

  // Get tickets based on view mode
  const displayTickets = viewMode === 'recent' 
    ? filteredTickets
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6)
    : filteredTickets
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
  };

  const handleViewModeChange = (mode: 'recent' | 'allTickets') => {
    setViewMode(mode);
    if (mode === 'recent') {
      setIncludeArchived(false);
    }
  };

  if (state.loading) {
    return (
      <div className="container">
        <div className="loading">Loading tickets...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container">
        <div className="error">Error: {state.error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero-section">
        <h1>G'day AI Support Hub</h1>
        <p>
          Welcome to the G'day AI Support Hub! Submit bug reports, request new features, 
          or browse our knowledge base to get help with your G'day AI experience.
        </p>
        <div className="hero-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Submit Ticket
          </button>
          <a 
            href="/knowledge" 
            className="btn btn-secondary"
          >
            <BookOpen size={20} />
            Visit the Knowledge Hub
          </a>
          <a 
            href="https://gdayai.gdaygroup.com.au/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Visit G'day AI
          </a>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bug">
              <Bug size={24} />
            </div>
            <div className="stat-content">
              <h3>{state.tickets.filter(t => t.type === 'bug').length}</h3>
              <p>Bug Reports</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon feature">
              <Lightbulb size={24} />
            </div>
            <div className="stat-content">
              <h3>{state.tickets.filter(t => t.type === 'feature').length}</h3>
              <p>Feature Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <div className="stat-dot"></div>
            </div>
            <div className="stat-content">
              <h3>{state.tickets.filter(t => t.status === 'pending').length}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <div className="stat-check">✓</div>
            </div>
            <div className="stat-content">
              <h3>{state.tickets.filter(t => t.status === 'completed').length}</h3>
              <p>Resolved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="tickets-section">
        <div className="section-header">
          <div className="section-title">
            <h2>{viewMode === 'recent' ? 'Recent Tickets' : 'All Tickets'}</h2>
            {viewMode === 'allTickets' && (
              <p className="section-subtitle">
                Showing {displayTickets.length} ticket{displayTickets.length !== 1 ? 's' : ''}
                {includeArchived && ` (including ${archivedTickets.length} archived)`}
              </p>
            )}
          </div>
          
          <div className="view-controls">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button 
                className={`btn btn-outline ${viewMode === 'recent' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('recent')}
              >
                Recent
              </button>
              <button 
                className={`btn btn-outline ${viewMode === 'allTickets' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('allTickets')}
              >
                <List size={16} />
                All Tickets
              </button>
            </div>

            {/* Include Archived Toggle (only show in "All Tickets" mode) */}
            {viewMode === 'allTickets' && (
              <div className="archived-toggle">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeArchived}
                    onChange={(e) => setIncludeArchived(e.target.checked)}
                    disabled={isLoadingArchived}
                  />
                  <Archive size={16} />
                  Include Archived
                  {isLoadingArchived && <span className="loading-spinner">⟳</span>}
                </label>
              </div>
            )}

            {/* Type Filter */}
            <div className="filter-buttons">
              <button 
                className={`btn btn-outline ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`btn btn-outline ${filter === 'bug' ? 'active' : ''}`}
                onClick={() => setFilter('bug')}
              >
                <Bug size={16} />
                Bugs
              </button>
              <button 
                className={`btn btn-outline ${filter === 'feature' ? 'active' : ''}`}
                onClick={() => setFilter('feature')}
              >
                <Lightbulb size={16} />
                Features
              </button>
            </div>
          </div>
        </div>

        <div className="tickets-grid">
          {displayTickets.length === 0 ? (
            <div className="empty-state">
              <p>No tickets found. {viewMode === 'recent' ? 'Create your first ticket above!' : 'Try adjusting your filters.'}</p>
            </div>
          ) : (
            displayTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => handleTicketClick(ticket)}
              />
            ))
          )}
        </div>
      </div>

      {showForm && (
        <TicketForm onClose={() => setShowForm(false)} />
      )}

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Home; 