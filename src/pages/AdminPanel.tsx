import React, { useState, useEffect } from 'react';
import { Users, Filter, CheckCircle, Clock, AlertCircle, Archive, RotateCcw, Trash2, Shield, Crown, BookOpen, Plus, Edit, Eye, Calendar, Tag, X } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import TicketCard from '../components/TicketCard';
import TicketModal from '../components/TicketModal';
import AdminSelector from '../components/AdminSelector';
import ArticleForm from '../components/ArticleForm';
import type { Ticket, TicketStatus, KnowledgeArticle } from '../types';

const AdminPanel: React.FC = () => {
  const { state, loadArchivedTickets, restoreTicket, deletePermanent, createArticle, updateArticle, deleteArticle } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'bug' | 'feature'>('all');
  const [currentView, setCurrentView] = useState<'active' | 'archived' | 'articles'>('active');
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  // Article management state
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');

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

  // Article management functions
  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowArticleForm(true);
  };

  const handleEditArticle = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setShowArticleForm(true);
  };

  const handleSubmitArticle = async (articleData: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    if (!state.currentAdmin) {
      alert('Please log in as an admin to manage articles');
      return;
    }

    setIsSubmittingArticle(true);
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, articleData);
      } else {
        await createArticle(articleData);
      }
      setShowArticleForm(false);
      setEditingArticle(null);
    } catch (error) {
      alert(`Failed to ${editingArticle ? 'update' : 'create'} article. Please try again.`);
    } finally {
      setIsSubmittingArticle(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!state.currentAdmin) {
      alert('Please log in as an admin to delete articles');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this article? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await deleteArticle(articleId);
      alert('Article deleted successfully');
    } catch (error) {
      alert('Failed to delete article. Please try again.');
    }
  };

  const handleCancelArticleForm = () => {
    setShowArticleForm(false);
    setEditingArticle(null);
  };

  // Get filtered articles
  const filteredArticles = state.articles.filter(article => {
    return articleCategoryFilter === 'all' || article.category === articleCategoryFilter;
  });

  const articleCategories = ['all', ...new Set(state.articles.map(article => article.category))];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="admin-panel-wrapper">
      {/* Admin Status Banner */}
      <div className="admin-status-banner">
        <div className="admin-status-content">
          <div className="admin-badge">
            <Crown size={18} />
            <span>ADMIN MODE</span>
          </div>
          <div className="admin-info">
            <Shield size={16} />
            <span>You are logged in as {state.currentAdmin?.name || 'Administrator'}</span>
          </div>
        </div>
      </div>

      <div className="container admin-container">
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
            <button 
              className={`tab-button ${currentView === 'articles' ? 'active' : ''}`}
              onClick={() => setCurrentView('articles')}
            >
              <BookOpen size={16} />
              Knowledge Hub
            </button>
          </div>
        </div>

        {currentView !== 'articles' && (
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
        )}

        {currentView === 'articles' && (
          <div className="admin-filters">
            <div className="filter-group">
              <label>Category Filter:</label>
              <select 
                value={articleCategoryFilter} 
                onChange={(e) => setArticleCategoryFilter(e.target.value)}
                className="form-select"
              >
                {articleCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <button
                onClick={handleCreateArticle}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Create Article
              </button>
            </div>
          </div>
        )}

        <div className="admin-content">
          {currentView === 'articles' ? (
            <div className="articles-admin-grid">
              {filteredArticles.length === 0 ? (
                <div className="empty-state">
                  <BookOpen size={48} />
                  <h3>No articles found</h3>
                  <p>Create your first knowledge article to get started.</p>
                </div>
              ) : (
                filteredArticles.map((article) => (
                  <div key={article.id} className="article-admin-card">
                    <div className="article-admin-header">
                      <h3>{article.title}</h3>
                      <span className="category-badge">{article.category}</span>
                    </div>
                    
                    <div className="article-admin-content">
                      <p className="article-excerpt">
                        {article.content.length > 200 
                          ? `${article.content.substring(0, 200)}...`
                          : article.content
                        }
                      </p>
                      
                      <div className="article-admin-meta">
                        <div className="meta-item">
                          <Eye size={14} />
                          <span>{article.views} views</span>
                        </div>
                        <div className="meta-item">
                          <Calendar size={14} />
                          <span>{formatDate(article.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="article-tags">
                        {article.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag tag-secondary">
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="tag tag-more">+{article.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="article-admin-actions">
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="btn btn-outline btn-sm"
                        title="View article"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="btn btn-outline btn-sm"
                        title="Edit article"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete article"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {isLoadingArchived ? (
                <div className="loading-state">
                  <h3>Loading archived tickets...</h3>
                </div>
              ) : (
                <div className="admin-tickets-grid">
                  {sortedTickets.length === 0 ? (
                    <div className="empty-state">
                      <p>No {currentView} tickets found.</p>
                    </div>
                  ) : (
                    sortedTickets.map((ticket) => (
                      <div key={ticket.id} className="ticket-card-container">
                        <TicketCard
                          ticket={ticket}
                          onClick={() => setSelectedTicket(ticket)}
                        />
                        {currentView === 'archived' && (
                          <div className="archived-ticket-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestoreTicket(ticket.id);
                              }}
                              className="btn btn-outline btn-sm"
                              title="Restore ticket"
                            >
                              <RotateCcw size={14} />
                              Restore
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePermanentDelete(ticket.id);
                              }}
                              className="btn btn-danger btn-sm"
                              title="Permanently delete ticket"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {selectedTicket && (
          <TicketModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}

        {showArticleForm && (
          <ArticleForm
            article={editingArticle || undefined}
            onSubmit={handleSubmitArticle}
            onCancel={handleCancelArticleForm}
            isSubmitting={isSubmittingArticle}
          />
        )}

        {selectedArticle && (
          <div className="modal-overlay">
            <div className="modal-content large">
              <div className="modal-header">
                <h2>Article Preview</h2>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="btn btn-outline btn-sm"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="article-preview">
                  <header className="article-header">
                    <h1>{selectedArticle.title}</h1>
                    <div className="article-meta">
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>Updated {formatDate(selectedArticle.updatedAt)}</span>
                      </div>
                      <div className="meta-item">
                        <Eye size={16} />
                        <span>{selectedArticle.views} views</span>
                      </div>
                      <div className="meta-item">
                        <Tag size={16} />
                        <span>{selectedArticle.category}</span>
                      </div>
                    </div>
                    <div className="article-tags">
                      {selectedArticle.tags.map(tag => (
                        <span key={tag} className="tag tag-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </header>
                  
                  <div className="article-body">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{selectedArticle.content}</p>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    handleEditArticle(selectedArticle);
                  }}
                  className="btn btn-primary"
                >
                  <Edit size={16} />
                  Edit Article
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 