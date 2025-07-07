import React, { useState } from 'react';
import { Plus, Bug, Lightbulb } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import TicketCard from '../components/TicketCard';
import TicketForm from '../components/TicketForm';
import TicketModal from '../components/TicketModal';
import type { Ticket } from '../types';

const Home: React.FC = () => {
  const { state } = useTickets();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'bug' | 'feature'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filteredTickets = state.tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.type === filter;
  });

  const recentTickets = filteredTickets
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
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
          <h2>Recent Tickets</h2>
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

        <div className="tickets-grid">
          {recentTickets.length === 0 ? (
            <div className="empty-state">
              <p>No tickets found. Create your first ticket above!</p>
            </div>
          ) : (
            recentTickets.map((ticket) => (
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