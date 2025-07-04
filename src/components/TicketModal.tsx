import React, { useState } from 'react';
import { X, MessageSquare, Edit3, Save, Calendar, User, Mail, AlertTriangle, Lightbulb, Bug } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import type { Ticket, TicketStatus } from '../types';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose }) => {
  const { state, dispatch } = useTickets();
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editedStatus, setEditedStatus] = useState(ticket.status);
  const [editedPriority, setEditedPriority] = useState(ticket.priority);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    if (!state.currentAdmin) {
      alert('Please select an admin to add comments');
      return;
    }

    dispatch({
      type: 'ADD_COMMENT',
      payload: {
        ticketId: ticket.id,
        comment: {
          ticketId: ticket.id,
          author: state.currentAdmin.name,
          content: newComment.trim(),
          isAdminComment: true
        }
      }
    });
    setNewComment('');
  };

  const handleUpdateTicket = () => {
    if (!state.currentAdmin) {
      alert('Please select an admin to update tickets');
      return;
    }

    dispatch({
      type: 'UPDATE_TICKET',
      payload: {
        id: ticket.id,
        updates: {
          status: editedStatus,
          priority: editedPriority
        }
      }
    });
    setIsEditing(false);
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

  return (
    <div className="modal-overlay">
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
                      <button className="btn btn-primary" onClick={handleUpdateTicket}>
                        <Save size={16} />
                        Save Changes
                      </button>
                      <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                    <Edit3 size={16} />
                    Edit Ticket
                  </button>
                )}
              </div>
            )}

            <div className="comments-section">
              <h3>
                <MessageSquare size={20} />
                Comments ({ticket.comments.length})
              </h3>
              
              {ticket.comments.length === 0 ? (
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
                    disabled={!newComment.trim()}
                  >
                    <MessageSquare size={16} />
                    Add Comment
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