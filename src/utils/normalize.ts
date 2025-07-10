import type { Ticket, Comment } from '../types';

// Utility function to normalize ticket data from API responses
export const normalizeTicket = (ticket: any): Ticket => {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    type: ticket.type,
    status: ticket.status,
    priority: ticket.priority,
    submitterName: ticket.submitterName || ticket.submitter_name,
    submitterEmail: ticket.submitterEmail || ticket.submitter_email,
    createdAt: ticket.createdAt || ticket.created_at,
    updatedAt: ticket.updatedAt || ticket.updated_at,
    comments: ticket.comments ? ticket.comments.map(normalizeComment) : []
  };
};

// Utility function to normalize comment data from API responses
export const normalizeComment = (comment: any): Comment => {
  return {
    id: comment.id,
    ticketId: comment.ticketId || comment.ticket_id,
    author: comment.author,
    content: comment.content,
    createdAt: comment.createdAt || comment.created_at,
    isAdminComment: comment.isAdminComment || comment.is_admin_comment || false
  };
}; 