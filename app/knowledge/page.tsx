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

  // Get category styling
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Bug Ticket':
        return 'bg-red-500 text-white';
      case 'Feature Request':
        return 'bg-accent text-black';
      case 'Access Request':
        return 'bg-blue-500 text-white';
      case 'General Support':
        return 'bg-grey-500 text-white';
      default:
        return 'bg-grey-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-secondary hover:text-primary mr-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <h1 className="text-5xl font-bold text-primary mb-6">Knowledge Base</h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
          Find answers to frequently asked questions about bug tickets, feature requests, and AI tool access.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card-compact">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 search-container">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search className="search-icon w-5 h-5" />
          </div>

          {/* Category Filter */}
          <div className="min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedCategory) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-primary">
            <span className="text-sm text-secondary">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-accent text-black">
                Search: "{searchTerm}"
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-accent text-black">
                Category: {selectedCategory}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-accent hover:text-accent-dark ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Quick Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-compact text-center">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Bug Tickets</h3>
          <p className="text-sm text-secondary">
            Learn how to submit bug tickets effectively and get them resolved quickly.
          </p>
        </div>
        
        <div className="card-compact text-center">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Feature Requests</h3>
          <p className="text-sm text-secondary">
            Discover how to request new features and improvements.
          </p>
        </div>
        
        <div className="card-compact text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">AI Tool Access</h3>
          <p className="text-sm text-secondary">
            Understand how to request access to various AI tools and services.
          </p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary">
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
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-dark-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            No articles found
          </h3>
          <p className="text-secondary mb-6">
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
            <div key={article.id} className="card-compact">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleArticle(article.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-primary">
                      {article.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(article.createdDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs bg-dark-surface-light px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 2 && (
                        <span className="text-xs text-muted">
                          +{article.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <ChevronRight 
                  className={`w-5 h-5 text-secondary transition-transform ${
                    expandedArticle === article.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
              
              {/* Expanded Content */}
              {expandedArticle === article.id && (
                <div className="mt-6 pt-6 border-t border-primary">
                  <div className="prose max-w-none">
                    <p className="text-secondary whitespace-pre-wrap leading-relaxed">
                      {article.content}
                    </p>
                  </div>
                  
                  {/* Tags */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dark-surface-light text-secondary"
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
      <div className="alert-attention-dark text-center">
        <h3 className="text-xl font-semibold text-primary mb-4">
          Still need help?
        </h3>
        <p className="text-secondary mb-6 leading-relaxed">
          Can't find the answer you're looking for? Create a bug ticket or feature request and our team will assist you.
        </p>
        <Link href="/create" className="btn-primary">
          Submit a Ticket
        </Link>
      </div>
    </div>
  );
} 