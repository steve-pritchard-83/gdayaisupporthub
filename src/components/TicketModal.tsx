import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Edit3, Save, Calendar, User, Mail, AlertTriangle, Lightbulb, Bug, Trash2 } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { ticketApi } from '../utils/localStorage';
import { normalizeTicket, normalizeComment } from '../utils/normalize';
import type { Ticket, TicketStatus, Comment } from '../types';



interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket: initialTicket, onClose }) => {
  const { state, updateTicket, archiveTicket, addComment } = useTickets();
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editedStatus, setEditedStatus] = useState(initialTicket.status);
  const [editedPriority, setEditedPriority] = useState(initialTicket.priority);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Fetch full ticket data with comments when modal opens
  useEffect(() => {
    const fetchFullTicket = async () => {
      if (!initialTicket.comments || initialTicket.comments.length === 0) {
        setIsLoadingComments(true);
        try {
          const rawTicket = await ticketApi.getById(initialTicket.id);
          const fullTicket = normalizeTicket(rawTicket);
          setTicket(fullTicket);
        } catch (error) {
          console.error('Failed to load ticket comments:', error);
          // Keep the initial ticket if fetch fails
        } finally {
          setIsLoadingComments(false);
        }
      }
    };

    fetchFullTicket();
  }, [initialTicket.id, initialTicket.comments]);

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'No date provided';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!state.currentAdmin) {
      alert('Please select an admin to add comments');
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment(ticket.id, {
        ticketId: ticket.id,
        author: state.currentAdmin.name,
        content: newComment.trim(),
        isAdminComment: true
      });
      
      // Refresh the ticket data to get the updated comments
      const rawTicket = await ticketApi.getById(ticket.id);
      const updatedTicket = normalizeTicket(rawTicket);
      setTicket(updatedTicket);
      
      setNewComment('');
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!state.currentAdmin) {
      alert('Please select an admin to update tickets');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTicket(ticket.id, {
        status: editedStatus,
        priority: editedPriority
      });
      
      // Refresh the ticket data to get the updated status/priority
      const rawTicket = await ticketApi.getById(ticket.id);
      const updatedTicket = normalizeTicket(rawTicket);
      setTicket(updatedTicket);
      
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'tag-pending';
      case 'in-progress': return 'tag-in-progress';
      case 'completed': return 'tag-completed';
      case 'closed': return 'tag-closed';
      default: return 'tag-pending';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} className="text-danger" />;
      case 'medium': return <AlertTriangle size={16} className="text-warning" />;
      case 'low': return <AlertTriangle size={16} className="text-success" />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'bug' ? <Bug size={20} /> : <Lightbulb size={20} />;
  };

  const handleArchiveTicket = async () => {
    if (!state.currentAdmin) {
      alert('Please select an admin to archive tickets');
      return;
    }

    const confirmArchive = window.confirm(
      `Are you sure you want to archive this ticket?\n\nTitle: ${ticket.title}\nSubmitted by: ${ticket.submitterName}\n\nArchived tickets can be restored later from the admin panel.`
    );

    if (!confirmArchive) return;

    setIsSubmitting(true);
    try {
      await archiveTicket(ticket.id);
      onClose(); // Close the modal after successful archival
    } catch (error) {
      alert('Failed to archive ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Close modal when clicking on the overlay (outside the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content large">
        <div className="modal-header">
          <div className="ticket-header-info">
            <div className="d-flex align-items-center gap-2">
              <div className={`type-icon ${ticket.type}`}>
                {getTypeIcon(ticket.type)}
              </div>
              <h2>{ticket.title}</h2>
            </div>
            <div className="ticket-meta">
              <span className={`tag tag-${ticket.type}`}>
                {ticket.type}
              </span>
              <span className={`tag ${getStatusClass(ticket.status)}`}>
                {ticket.status.replace('-', ' ')}
              </span>
              <span className="priority">
                {getPriorityIcon(ticket.priority)}
                {ticket.priority} priority
              </span>
            </div>
          </div>
          <button className="btn btn-outline close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="ticket-details">
            <div className="ticket-info">
              <div className="info-item">
                <User size={16} />
                <span><strong>Submitted by:</strong> {ticket.submitterName}</span>
              </div>
              {ticket.submitterEmail && (
                <div className="info-item">
                  <Mail size={16} />
                  <span><strong>Email:</strong> {ticket.submitterEmail}</span>
                </div>
              )}
              <div className="info-item">
                <Calendar size={16} />
                <span><strong>Created:</strong> {formatDate(ticket.createdAt)}</span>
              </div>
              <div className="info-item">
                <Calendar size={16} />
                <span><strong>Updated:</strong> {formatDate(ticket.updatedAt)}</span>
              </div>
            </div>

            <div className="ticket-description">
              <h3>Description</h3>
              <p>{ticket.description}</p>
            </div>

            {state.currentAdmin && (
              <div className="admin-controls">
                <h3>Admin Controls</h3>
                {isEditing ? (
                  <div className="edit-controls">
                    <div className="form-group">
                      <label>Status:</label>
                      <select 
                        value={editedStatus} 
                        onChange={(e) => setEditedStatus(e.target.value as TicketStatus)}
                        className="form-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Priority:</label>
                      <select 
                        value={editedPriority} 
                        onChange={(e) => setEditedPriority(e.target.value as any)}
                        className="form-select"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary" onClick={handleUpdateTicket} disabled={isSubmitting}>
                        <Save size={16} />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button className="btn btn-outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                      <Edit3 size={16} />
                      Edit Ticket
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={handleArchiveTicket}
                      disabled={isSubmitting}
                    >
                      <Trash2 size={16} />
                      {isSubmitting ? 'Archiving...' : 'Archive Ticket'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="comments-section">
              <h3>
                <MessageSquare size={20} />
                Comments ({ticket.comments?.length || 0})
              </h3>
              
              {isLoadingComments ? (
                <p className="text-muted">Loading comments...</p>
              ) : !ticket.comments || ticket.comments.length === 0 ? (
                <p className="text-muted">No comments yet.</p>
              ) : (
                <div className="comments-list">
                  {ticket.comments.map(comment => (
                    <div key={comment.id} className={`comment ${comment.isAdminComment ? 'admin-comment' : ''}`}>
                      <div className="comment-header">
                        <span className="comment-author">
                          {comment.isAdminComment ? '👤 ' : ''}
                          {comment.author}
                          {comment.isAdminComment && <span className="admin-badge">Admin</span>}
                        </span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {state.currentAdmin && (
                <div className="add-comment">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="form-textarea"
                    rows={3}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                  >
                    <MessageSquare size={16} />
                    {isSubmitting ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal; 