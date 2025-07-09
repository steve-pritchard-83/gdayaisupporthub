const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

// Utility function for making API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Ticket API functions
export const ticketApi = {
  // Get all tickets
  getAll: () => apiRequest('/api/tickets'),
  
  // Get single ticket with comments
  getById: (id: string) => apiRequest(`/api/tickets/${id}`),
  
  // Create new ticket
  create: (ticket: {
    title: string;
    description: string;
    type: 'bug' | 'feature';
    priority: 'low' | 'medium' | 'high';
    submitterName: string;
    submitterEmail: string;
  }) => apiRequest('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(ticket),
  }),
  
  // Update ticket
  update: (id: string, updates: {
    status?: 'pending' | 'in-progress' | 'completed' | 'closed';
    priority?: 'low' | 'medium' | 'high';
  }) => apiRequest(`/api/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  // Add comment to ticket
  addComment: (ticketId: string, comment: {
    author: string;
    content: string;
    isAdminComment?: boolean;
  }) => apiRequest(`/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(comment),
  }),
  
  // Archive ticket
  archive: (id: string) => apiRequest(`/api/tickets/${id}/archive`, {
    method: 'PATCH',
  }),
  
  // Get archived tickets
  getArchived: () => apiRequest('/api/tickets/archived'),
  
  // Restore archived ticket
  restore: (id: string) => apiRequest(`/api/tickets/${id}/restore`, {
    method: 'PATCH',
  }),
  
  // Permanently delete ticket
  deletePermanent: (id: string) => apiRequest(`/api/tickets/${id}/permanent`, {
    method: 'DELETE',
  }),
};

// Knowledge article API functions
export const articleApi = {
  // Get all articles
  getAll: () => apiRequest('/api/articles'),
  
  // Increment view count
  incrementView: (id: string) => apiRequest(`/api/articles/${id}/view`, {
    method: 'POST',
  }),
  
  // Create new article (admin only)
  create: (article: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => apiRequest('/api/articles', {
    method: 'POST',
    body: JSON.stringify(article),
  }),
  
  // Update article (admin only)
  update: (id: string, article: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => apiRequest('/api/articles', {
    method: 'PUT',
    body: JSON.stringify({ id, ...article }),
  }),
  
  // Delete article (admin only)
  delete: (id: string) => apiRequest(`/api/articles?id=${id}`, {
    method: 'DELETE',
  }),
};

// Health check
export const healthCheck = () => apiRequest('/api/health'); 