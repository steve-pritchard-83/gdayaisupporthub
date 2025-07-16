'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  LogOut, 
  BarChart3, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { AdminAnalytics } from '@/types/admin';
import { Ticket, Status, Priority } from '@/types';
import { 
  isAdminAuthenticated, 
  getAdminSession, 
  logoutAdmin, 
  calculateAdminAnalytics 
} from '@/utils/adminAuth';
import { getTickets, saveTicket, deleteTicket } from '@/utils/localStorage';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    
    loadDashboardData();
  }, [router]);

  const loadDashboardData = () => {
    setLoading(true);
    
    // Load analytics
    const analyticsData = calculateAdminAnalytics();
    setAnalytics(analyticsData);
    
    // Load tickets
    const allTickets = getTickets();
    setTickets(allTickets);
    
    setLoading(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  const handleBulkStatusUpdate = (newStatus: Status) => {
    if (selectedTickets.length === 0) return;
    
    const updatedTickets = tickets.map(ticket => {
      if (selectedTickets.includes(ticket.id)) {
        const updatedTicket = { ...ticket, status: newStatus };
        saveTicket(updatedTicket);
        return updatedTicket;
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    setSelectedTickets([]);
  };

  const handleBulkDelete = () => {
    if (selectedTickets.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedTickets.length} ticket(s)?`);
    if (!confirmed) return;
    
    selectedTickets.forEach(id => {
      deleteTicket(id);
    });
    
    setTickets(tickets.filter(ticket => !selectedTickets.includes(ticket.id)));
    setSelectedTickets([]);
  };

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const selectAllTickets = () => {
    setSelectedTickets(
      selectedTickets.length === filteredTickets.length 
        ? [] 
        : filteredTickets.map(ticket => ticket.id)
    );
  };

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Title,Status,Priority,Category,Email,Created\n" +
      tickets.map(ticket => 
        `${ticket.id},"${ticket.title}",${ticket.status},${ticket.priority},${ticket.category},${ticket.email},${ticket.createdDate}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tickets-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (priorityFilter && ticket.priority !== priorityFilter) return false;
    return true;
  });

  // Get status badge styling
  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'Open': return 'status-open';
      case 'In Progress': return 'status-progress';
      case 'Closed': return 'status-closed';
      default: return 'status-open';
    }
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const session = getAdminSession();

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-surface shadow-xl border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-primary">Admin Dashboard</h1>
                <p className="text-sm text-secondary">G'day AI Support Hub</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary">
                Welcome, {session?.user?.email}
              </span>
              <Link href="/" className="btn-outline text-sm">
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in">
          <div className="card-compact">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-accent mr-4">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary">Total Tickets</p>
                <p className="text-2xl font-bold text-primary">{analytics?.totalTickets || 0}</p>
              </div>
            </div>
          </div>

          <div className="card-compact">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-500 mr-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary">Open Tickets</p>
                <p className="text-2xl font-bold text-primary">{analytics?.ticketsByStatus.open || 0}</p>
              </div>
            </div>
          </div>

          <div className="card-compact">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-orange-500 mr-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary">High Priority</p>
                <p className="text-2xl font-bold text-primary">{analytics?.ticketsByPriority.high || 0}</p>
              </div>
            </div>
          </div>

          <div className="card-compact">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-500 mr-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary">New Today</p>
                <p className="text-2xl font-bold text-primary">{analytics?.recentActivity.newTicketsToday || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card-compact">
            <h3 className="text-lg font-semibold text-primary mb-4">Tickets by Category</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Bug Tickets</span>
                <span className="text-sm font-medium text-primary">
                  {tickets.filter(t => t.category === 'Bug Ticket').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Feature Requests</span>
                <span className="text-sm font-medium text-primary">
                  {tickets.filter(t => t.category === 'Feature Request').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Access Requests</span>
                <span className="text-sm font-medium text-primary">
                  {analytics?.ticketsByCategory.accessRequest || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">General Support</span>
                <span className="text-sm font-medium text-primary">
                  {analytics?.ticketsByCategory.generalSupport || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="card-compact">
            <h3 className="text-lg font-semibold text-primary mb-4">Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Open</span>
                <span className="text-sm font-medium text-primary">
                  {analytics?.ticketsByStatus.open || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">In Progress</span>
                <span className="text-sm font-medium text-primary">
                  {analytics?.ticketsByStatus.inProgress || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Closed</span>
                <span className="text-sm font-medium text-primary">
                  {analytics?.ticketsByStatus.closed || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="card-compact">
            <h3 className="text-lg font-semibold text-primary mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">New Today</span>
                <span className="text-sm font-medium text-primary">
                  {analytics?.recentActivity.newTicketsToday || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Closed Today</span>
                <span className="text-sm font-medium text-primary">
                  {analytics?.recentActivity.closedTicketsToday || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Avg Response (hrs)</span>
                <span className="text-sm font-medium text-primary">
                  {analytics?.recentActivity.averageResponseTime || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Management */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-primary">Ticket Management</h2>
              <p className="text-secondary">Manage all bug tickets and feature requests with bulk operations</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={loadDashboardData}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 search-container">
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <Search className="search-icon w-4 h-4" />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status || '')}
              className="form-select"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority || '')}
              className="form-select"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedTickets.length > 0 && (
            <div className="alert-attention-dark mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  {selectedTickets.length} ticket(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkStatusUpdate('Open')}
                    className="btn-small"
                  >
                    Mark Open
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('In Progress')}
                    className="btn-small"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('Closed')}
                    className="btn-small"
                  >
                    Mark Closed
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="btn-small-secondary text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reports Table */}
          <div className="table-modern">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">
                    <input
                      type="checkbox"
                      checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                      onChange={selectAllTickets}
                      className="rounded border-dark-border text-accent focus:ring-accent"
                    />
                  </th>
                  <th className="table-header">Title</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Priority</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={() => toggleTicketSelection(ticket.id)}
                        className="rounded border-dark-border text-accent focus:ring-accent"
                      />
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-primary">{ticket.title}</div>
                      <div className="text-sm text-secondary truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-secondary">
                      {ticket.category}
                    </td>
                    <td className="table-cell text-sm text-secondary">
                      {ticket.email}
                    </td>
                    <td className="table-cell text-sm text-secondary">
                      {formatDate(ticket.createdDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary">No tickets found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 