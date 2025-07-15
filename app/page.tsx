'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, BookOpen, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getTicketStats, initializeDefaultData } from '@/utils/localStorage';
import { TicketStats } from '@/types';

export default function HomePage() {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    highPriority: 0,
  });

  useEffect(() => {
    // Initialize default data on first load
    initializeDefaultData();
    
    // Load ticket stats
    const currentStats = getTicketStats();
    setStats(currentStats);
  }, []);

  const quickActions = [
    {
      name: 'Create New Ticket',
      href: '/create',
      icon: Plus,
      description: 'Submit a new support request',
      color: 'bg-accent hover:bg-accent-dark',
    },
    {
      name: 'View All Tickets',
      href: '/tickets',
      icon: Eye,
      description: 'Browse and manage existing tickets',
      color: 'bg-accent hover:bg-accent-dark',
    },
    {
      name: 'Knowledge Base',
      href: '/knowledge',
      icon: BookOpen,
      description: 'Find answers to common questions',
      color: 'bg-accent hover:bg-accent-dark',
    },
  ];

  const statCards = [
    {
      name: 'Total Tickets',
      value: stats.total,
      icon: BarChart3,
      color: 'text-white',
      bgColor: 'bg-accent',
    },
    {
      name: 'Open Tickets',
      value: stats.open,
      icon: Clock,
      color: 'text-white',
      bgColor: 'bg-accent',
    },
    {
      name: 'In Progress',
      value: stats.inProgress,
      icon: AlertCircle,
      color: 'text-white',
      bgColor: 'bg-accent',
    },
    {
      name: 'Closed Tickets',
      value: stats.closed,
      icon: CheckCircle,
      color: 'text-white',
      bgColor: 'bg-accent',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-grey-900 mb-4">
          Welcome to G&rsquo;day AI Support Hub
        </h1>
        <p className="text-xl text-grey-600 max-w-2xl mx-auto">
          Your one-stop solution for managing AI tool access requests and getting technical support. 
          Create tickets, track progress, and find answers quickly.
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-grey-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-grey-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              href={action.href}
              className="card card-hover group transition-all duration-200 hover:scale-105"
            >
              <div className="text-center">
                <div className={`inline-flex p-4 rounded-xl ${action.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-grey-900 mb-2">{action.name}</h3>
                <p className="text-grey-600">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* High Priority Alert */}
      {stats.highPriority > 0 && (
        <div className="bg-accent border border-accent-dark rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-white mr-2" />
            <div>
              <h3 className="text-sm font-medium text-black">
                High Priority Tickets Require Attention
              </h3>
              <p className="text-sm text-black mt-1">
                You have {stats.highPriority} high priority ticket{stats.highPriority > 1 ? 's' : ''} that need immediate attention.
              </p>
            </div>
            <Link
              href="/tickets"
              className="ml-auto btn-primary bg-accent-dark hover:bg-accent"
            >
              View Tickets
            </Link>
          </div>
        </div>
      )}

      {/* Getting Started */}
      <div className="card">
        <h2 className="text-2xl font-bold text-grey-900 mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-grey-900 mb-2">New to AI Tools?</h3>
            <p className="text-grey-600 mb-4">
              Start by browsing our knowledge base to understand what AI tools are available 
              and how to request access.
            </p>
            <Link href="/knowledge" className="btn-outline">
              Browse Knowledge Base
            </Link>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-grey-900 mb-2">Need Help?</h3>
            <p className="text-grey-600 mb-4">
              Create a support ticket and our team will help you with access requests, 
              technical issues, or general questions.
            </p>
            <Link href="/create" className="btn-primary">
              Create Support Ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 