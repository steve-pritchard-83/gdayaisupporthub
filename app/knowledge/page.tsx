'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, BookOpen, Tag, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { KnowledgeArticle } from '@/types';
import { getKnowledgeArticles } from '@/utils/localStorage';

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  // Load knowledge articles on component mount
  useEffect(() => {
    const loadArticles = () => {
      const allArticles = getKnowledgeArticles();
      setArticles(allArticles);
      setLoading(false);
    };
    
    loadArticles();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(articles.map(article => article.category)));
    return uniqueCategories.sort();
  }, [articles]);

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          article.title.toLowerCase().includes(searchLower) ||
          article.content.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (selectedCategory && article.category !== selectedCategory) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by category first, then by title
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.title.localeCompare(b.title);
    });
  }, [articles, searchTerm, selectedCategory]);

  // Toggle article expansion
  const toggleArticle = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setExpandedArticle(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Access Request':
        return 'bg-accent text-black';
      case 'Technical Issue':
        return 'bg-accent text-black';
      case 'General Support':
        return 'bg-accent text-black';
      default:
        return 'bg-grey-100 text-grey-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-grey-600 hover:text-grey-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-grey-900">Knowledge Base</h1>
          <p className="text-grey-600 mt-1">
            Find answers to common questions about AI tool access
          </p>
        </div>
        
        <Link href="/create" className="btn-primary">
          Still need help? Create Ticket
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-grey-300 rounded-lg focus-ring"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-grey-300 rounded-lg focus-ring"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Clear Filters */}
        {(searchTerm || selectedCategory) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-grey-600 hover:text-grey-900"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-grey-900 mb-2">Getting Started</h3>
          <p className="text-sm text-grey-600">
            New to AI tools? Start here for the basics.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-grey-900 mb-2">Common Issues</h3>
          <p className="text-sm text-grey-600">
            Troubleshoot frequent problems quickly.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-grey-900 mb-2">Policies</h3>
          <p className="text-sm text-grey-600">
            Understand usage guidelines and rules.
          </p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-grey-600">
          {filteredArticles.length} of {articles.length} articles
        </p>
        
        {filteredArticles.length === 0 && articles.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-accent hover:text-accent-dark"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-grey-400" />
          </div>
          <h3 className="text-lg font-medium text-grey-900 mb-2">
            No articles found
          </h3>
          <p className="text-grey-600 mb-6">
            Try adjusting your search terms or clearing filters.
          </p>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div key={article.id} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleArticle(article.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-grey-900">
                      {article.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-grey-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(article.createdDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs bg-grey-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 2 && (
                        <span className="text-xs text-grey-500">
                          +{article.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <ChevronRight 
                  className={`w-5 h-5 text-grey-400 transition-transform ${
                    expandedArticle === article.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
              
              {/* Expanded Content */}
              {expandedArticle === article.id && (
                <div className="mt-4 pt-4 border-t border-grey-200">
                  <div className="prose max-w-none">
                    <p className="text-grey-700 whitespace-pre-wrap">
                      {article.content}
                    </p>
                  </div>
                  
                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-grey-100 text-grey-800"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Still Need Help */}
              <div className="card bg-accent border-accent-dark">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-black mb-2">
            Still need help?
          </h3>
          <p className="text-black mb-4">
            Can't find the answer you're looking for? Create a support ticket and our team will assist you.
          </p>
          <Link href="/create" className="btn-primary">
            Create Support Ticket
          </Link>
        </div>
      </div>
    </div>
  );
} 