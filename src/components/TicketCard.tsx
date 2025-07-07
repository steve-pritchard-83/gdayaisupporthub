import React from 'react';
import { Calendar, User, MessageSquare, Bug, Lightbulb } from 'lucide-react';
import type { Ticket } from '../types';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'No date';
    }
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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

  const getTypeIcon = (type: string) => {
    return type === 'bug' ? <Bug size={16} /> : <Lightbulb size={16} />;
  };

  return (
    <div 
      className={`card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="d-flex align-items-center gap-2">
          <div className={`type-icon ${ticket.type}`}>
            {getTypeIcon(ticket.type)}
          </div>
          <span className={`tag tag-${ticket.type}`}>
            {ticket.type}
          </span>
          <span className={`tag ${getStatusClass(ticket.status)}`}>
            {ticket.status.replace('-', ' ')}
          </span>
        </div>
        <div className="card-meta">
          <Calendar size={14} />
          {formatDate(ticket.createdAt)}
        </div>
      </div>

      <h3 className="card-title">{ticket.title}</h3>
      
      <p className="ticket-description">
        {ticket.description.length > 150 
          ? `${ticket.description.substring(0, 150)}...`
          : ticket.description
        }
      </p>

      <div className="ticket-footer">
        <div className="d-flex align-items-center gap-2">
          <User size={14} />
          <span className="text-muted">{ticket.submitterName}</span>
        </div>
        
        {ticket.comments && ticket.comments.length > 0 && (
          <div className="d-flex align-items-center gap-1">
            <MessageSquare size={14} />
            <span className="text-muted">{ticket.comments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard; 