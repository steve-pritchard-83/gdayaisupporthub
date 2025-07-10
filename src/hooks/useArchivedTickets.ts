import { useState, useEffect } from 'react';
import { ticketApi } from '../utils/localStorage';
import type { Ticket } from '../types';

export const useArchivedTickets = () => {
  const [archivedTickets, setArchivedTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArchivedTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tickets = await ticketApi.getArchived();
      const normalizedTickets = tickets.map((ticket: any) => ({
        ...ticket,
        submitterName: ticket.submitterName || ticket.submitter_name,
        submitterEmail: ticket.submitterEmail || ticket.submitter_email,
        createdAt: ticket.createdAt || ticket.created_at,
        updatedAt: ticket.updatedAt || ticket.updated_at,
        comments: ticket.comments || []
      }));
      setArchivedTickets(normalizedTickets);
    } catch (err) {
      setError('Failed to load archived tickets');
      console.error('Failed to load archived tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshArchivedTickets = () => {
    setArchivedTickets([]);
    loadArchivedTickets();
  };

  return {
    archivedTickets,
    isLoading,
    error,
    loadArchivedTickets,
    refreshArchivedTickets
  };
}; 