'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, BookOpen, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getTicketStats, initializeDefaultData } from '@/utils/localStorage';
import { isAdminAuthenticated } from '@/utils/adminAuth';
import { TicketStats } from '@/types';

export default function HomePage() {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
    highPriority: 0,
  });
  
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Initialize default data on first load
    initializeDefaultData();
    
    // Load ticket stats
    const currentStats = getTicketStats();
    setStats(currentStats);
    
    // Check admin authentication status
    setIsAdmin(isAdminAuthenticated());
  }, []);

  const quickActions = [
    {
      name: 'Submit a Ticket',
      href: '/create',
      icon: Plus,
      description: 'Submit a new ticket for a bug or feature request',
      color: 'bg-accent hover:bg-accent-dark',
    },
    {
      name: 'View All Tickets',
      href: '/tickets',
      icon: Eye,
      description: 'Browse and manage all submitted tickets',
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
      color: 'text-black',
      bgColor: 'bg-accent',
    },
    {
      name: 'Open Tickets',
      value: stats.open,
      icon: Clock,
      color: 'text-white',
      bgColor: 'bg-red-500',
    },
    {
      name: 'In Progress',
      value: stats.inProgress,
      icon: AlertCircle,
      color: 'text-white',
      bgColor: 'bg-orange-500',
    },
    {
      name: 'Closed Tickets',
      value: stats.closed,
      icon: CheckCircle,
      color: 'text-white',
      bgColor: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-12 fade-in">
      {/* Welcome Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-primary mb-6">
          G'day AI Support Hub
        </h1>
        <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
          Your modern platform for submitting tickets, requesting features, and managing AI tool access.
          Submit tickets, track progress, and find answers quickly with our streamlined interface.
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card-compact">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${stat.bgColor} mr-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">{stat.name}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              href={action.href}
              className="card card-hover group transition-all duration-300"
            >
              <div className="text-center">
                <div className={`inline-flex p-6 rounded-2xl ${action.color} text-black mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">{action.name}</h3>
                <p className="text-secondary leading-relaxed">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* High Priority Alert - Only show to admin */}
      {isAdmin && stats.highPriority > 0 && (
        <div className="alert-attention-dark">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-accent mr-4" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary">
                High Priority Tickets Require Attention
              </h3>
              <p className="text-secondary mt-1">
                You have {stats.highPriority} high priority bug ticket{stats.highPriority > 1 ? 's' : ''} that need immediate attention.
              </p>
            </div>
            <Link
              href="/tickets?priority=High"
              className="btn-primary ml-4"
            >
              View Tickets
            </Link>
          </div>
        </div>
      )}

      {/* Getting Started */}
      <div className="card">
        <h2 className="text-3xl font-bold text-primary mb-8">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">New to AI Tools?</h3>
            <p className="text-secondary mb-6 leading-relaxed">
              Start by browsing our knowledge base to understand what AI tools are available
              and how to request access.
            </p>
            <Link href="/knowledge" className="btn-outline">
              Browse Knowledge Base
            </Link>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-primary mb-4">Found an Issue?</h3>
            <p className="text-secondary mb-6 leading-relaxed">
              Report a bug or request a new feature to help improve our AI tools
              and services for everyone.
            </p>
            <Link href="/create" className="btn-primary">
              Submit a Ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 