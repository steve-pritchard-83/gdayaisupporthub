import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bug, Lightbulb, Archive, List, BookOpen } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import TicketCard from '../components/TicketCard';
import TicketForm from '../components/TicketForm';
import TicketModal from '../components/TicketModal';
import SkeletonCard from '../components/SkeletonCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import ErrorMessage from '../components/ErrorMessage';
import type { Ticket } from '../types';
import { ticketApi } from '../utils/localStorage';
import { searchTickets } from '../utils/search';
import { TICKET_CONFIG, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

const Home: React.FC = () => {
  const { state } = useTickets();

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | typeof TICKET_CONFIG.types[number]>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [viewMode, setViewMode] = useState<'recent' | 'allTickets'>('recent');
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [hasLoadedArchived, setHasLoadedArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load archived tickets when user wants to see all tickets with archived ones
  useEffect(() => {
    if (viewMode === 'allTickets' && includeArchived && !hasLoadedArchived) {
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
          setHasLoadedArchived(true);
        })
        .catch(error => {
          console.error('Failed to load archived tickets:', error);
        })
        .finally(() => {
          setIsLoadingArchived(false);
        });
    }
  }, [viewMode, includeArchived, hasLoadedArchived]);

  // Get all tickets (active + archived if requested)
  const getAllTickets = useCallback(() => {
    let allTickets = [...state.tickets];
    if (includeArchived) {
      allTickets = [...allTickets, ...archivedTickets];
    }
    return allTickets;
  }, [state.tickets, includeArchived, archivedTickets]);

  // Filter tickets based on search and type
  const filteredTickets = useMemo(() => {
    const baseTickets = viewMode === 'recent' ? state.tickets : getAllTickets();
    return baseTickets.filter(ticket => {
      // Type filter
      if (filter !== 'all' && ticket.type !== filter) return false;
      return true;
    });
  }, [viewMode, state.tickets, getAllTickets, filter]);

  // Apply search if query exists
  const searchedTickets = useMemo(() => {
    return searchQuery ? 
      searchTickets(filteredTickets, searchQuery) : 
      filteredTickets;
  }, [filteredTickets, searchQuery]);

  // Get tickets based on view mode
  const displayTickets = useMemo(() => {
    const sorted = searchedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return viewMode === 'recent' ? sorted.slice(0, 6) : sorted;
  }, [searchedTickets, viewMode]);

  const handleTicketClick = useCallback((ticket: Ticket) => {
    setSelectedTicket(ticket);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTicket(null);
  }, []);

  const handleViewModeChange = useCallback((mode: 'recent' | 'allTickets') => {
    setViewMode(mode);
    if (mode === 'recent') {
      setIncludeArchived(false);
      setHasLoadedArchived(false); // Reset flag when switching back to recent
    }
  }, []);

  if (state.loading) {
    return (
      <div className="container">
        <div className="hero-section">
          <h1>G'day AI Support Hub</h1>
          <p>Loading your support hub...</p>
        </div>
        
        <div className="stats-section">
          <div className="stats-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="stat-content">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="tickets-section">
          <div className="section-header">
            <h2>Loading Recent Tickets</h2>
          </div>
          <div className="tickets-grid">
            <SkeletonCard count={6} />
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container">
        <div className="hero-section">
          <h1>G'day AI Support Hub</h1>
          <p>We're having trouble loading the support hub.</p>
        </div>
        <ErrorMessage
          title="Failed to Load Data"
          message={state.error}
          onRetry={() => window.location.reload()}
        />
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
          <Link 
            to="/knowledge" 
            className="btn btn-secondary"
          >
            <BookOpen size={20} />
            Visit the Knowledge Hub
          </Link>
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
                          <h3>{state.tickets.filter(t => t.type === TICKET_CONFIG.types[0]).length}</h3>
            <p>Bug Reports</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon feature">
              <Lightbulb size={24} />
            </div>
            <div className="stat-content">
                          <h3>{state.tickets.filter(t => t.type === TICKET_CONFIG.types[1]).length}</h3>
            <p>Feature Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <div className="stat-dot"></div>
            </div>
            <div className="stat-content">
                          <h3>{state.tickets.filter(t => t.status === TICKET_CONFIG.statuses[0]).length}</h3>
            <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <div className="stat-check">✓</div>
            </div>
            <div className="stat-content">
                          <h3>{state.tickets.filter(t => t.status === TICKET_CONFIG.statuses[2]).length}</h3>
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
                {searchQuery && ` matching "${searchQuery}"`}
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
                  {isLoadingArchived && <LoadingSpinner size="sm" text="" />}
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
                className={`btn btn-outline ${filter === TICKET_CONFIG.types[0] ? 'active' : ''}`}
                onClick={() => setFilter(TICKET_CONFIG.types[0])}
              >
                <Bug size={16} />
                Bugs
              </button>
              <button 
                className={`btn btn-outline ${filter === TICKET_CONFIG.types[1] ? 'active' : ''}`}
                onClick={() => setFilter(TICKET_CONFIG.types[1])}
              >
                <Lightbulb size={16} />
                Features
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search tickets by title, description, submitter, or comments..."
          onSearch={setSearchQuery}
          className="tickets-search"
        />

        {/* Search Results Info */}
        {searchQuery && (
          <div className="search-results-info">
            Found {displayTickets.length} ticket{displayTickets.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}

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