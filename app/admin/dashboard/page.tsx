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
    
    // Refresh analytics
    const analyticsData = calculateAdminAnalytics();
    setAnalytics(analyticsData);
  };

  const handleBulkDelete = () => {
    if (selectedTickets.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTickets.length} ticket(s)?`)) {
      selectedTickets.forEach(ticketId => {
        deleteTicket(ticketId);
      });
      
      const updatedTickets = tickets.filter(ticket => !selectedTickets.includes(ticket.id));
      setTickets(updatedTickets);
      setSelectedTickets([]);
      
      // Refresh analytics
      const analyticsData = calculateAdminAnalytics();
      setAnalytics(analyticsData);
    }
  };

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const selectAllTickets = () => {
    const filteredTicketIds = filteredTickets.map(t => t.id);
    setSelectedTickets(
      selectedTickets.length === filteredTicketIds.length 
        ? [] 
        : filteredTicketIds
    );
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (priorityFilter && ticket.priority !== priorityFilter) return false;
    
    return true;
  });

  const exportData = () => {
    const dataStr = JSON.stringify(tickets, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `support-tickets-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-progress';
      case 'Closed':
        return 'status-closed';
      default:
        return 'status-open';
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Low':
        return 'priority-low';
      case 'Medium':
        return 'priority-medium';
      case 'High':
        return 'priority-high';
      default:
        return 'priority-medium';
    }
  };

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
      <div className="min-h-screen bg-grey-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const session = getAdminSession();

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-grey-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
                                                     <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
               <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-grey-900">Admin Dashboard</h1>
                <p className="text-sm text-grey-600">G'day AI Support Hub</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-grey-600">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-accent mr-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-grey-600">Total Tickets</p>
                <p className="text-2xl font-bold text-grey-900">{analytics?.totalTickets || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-accent mr-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-grey-600">Open Tickets</p>
                <p className="text-2xl font-bold text-grey-900">{analytics?.ticketsByStatus.open || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-accent mr-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-grey-600">High Priority</p>
                <p className="text-2xl font-bold text-grey-900">{analytics?.ticketsByPriority.high || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-accent mr-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-grey-600">New Today</p>
                <p className="text-2xl font-bold text-grey-900">{analytics?.recentActivity.newTicketsToday || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-grey-900 mb-4">Tickets by Category</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Access Request</span>
                <span className="text-sm font-medium text-grey-900">
                  {analytics?.ticketsByCategory.accessRequest || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Technical Issue</span>
                <span className="text-sm font-medium text-grey-900">
                  {analytics?.ticketsByCategory.technicalIssue || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">General Support</span>
                <span className="text-sm font-medium text-grey-900">
                  {analytics?.ticketsByCategory.generalSupport || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-grey-900 mb-4">Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Open</span>
                <span className="text-sm font-medium text-grey-900">
                  {analytics?.ticketsByStatus.open || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">In Progress</span>
                <span className="text-sm font-medium text-grey-900">
                  {analytics?.ticketsByStatus.inProgress || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Closed</span>
                <span className="text-sm font-medium text-grey-900">
                  {analytics?.ticketsByStatus.closed || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-grey-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">New Today</span>
                <span className="text-sm font-medium text-grey-900">
                  {analytics?.recentActivity.newTicketsToday || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Closed Today</span>
                <span className="text-sm font-medium text-grey-900">
                  {analytics?.recentActivity.closedTicketsToday || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-grey-600">Avg Response (hrs)</span>
                <span className="text-sm font-medium text-grey-900">
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
              <h2 className="text-xl font-bold text-grey-900">Ticket Management</h2>
              <p className="text-grey-600">Manage all support tickets with bulk operations</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={loadDashboardData}
                className="btn-outline flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="btn-outline flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-grey-300 rounded-lg focus-ring"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status || '')}
              className="px-3 py-2 border border-grey-300 rounded-lg focus-ring"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority || '')}
              className="px-3 py-2 border border-grey-300 rounded-lg focus-ring"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedTickets.length > 0 && (
            <div className="bg-accent border border-accent-dark rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">
                  {selectedTickets.length} ticket(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkStatusUpdate('Open')}
                    className="text-sm bg-accent-dark text-white px-3 py-1 rounded hover:bg-accent"
                  >
                    Mark Open
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('In Progress')}
                    className="text-sm bg-accent-dark text-white px-3 py-1 rounded hover:bg-accent"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('Closed')}
                    className="text-sm bg-accent-dark text-white px-3 py-1 rounded hover:bg-accent"
                  >
                    Mark Closed
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="text-sm bg-accent-dark text-white px-3 py-1 rounded hover:bg-accent"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey-200">
                  <th className="text-left py-3 px-4 font-medium text-grey-600">
                    <input
                      type="checkbox"
                      checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                      onChange={selectAllTickets}
                      className="rounded border-grey-300 text-accent focus:ring-accent"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-grey-600">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-grey-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-grey-600">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-grey-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-grey-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-grey-200 hover:bg-grey-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={() => toggleTicketSelection(ticket.id)}
                        className="rounded border-grey-300 text-accent focus:ring-accent"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-grey-900">{ticket.title}</div>
                      <div className="text-sm text-grey-600 truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-grey-600">
                      {ticket.category}
                    </td>
                    <td className="py-3 px-4 text-sm text-grey-600">
                      {formatDate(ticket.createdDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-grey-600">No tickets found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 