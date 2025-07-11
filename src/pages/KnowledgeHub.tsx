import React, { useState } from 'react';
import { Search, BookOpen, Eye, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTickets } from '../context/TicketContext';
import type { KnowledgeArticle } from '../types';

const KnowledgeHub: React.FC = () => {
  const { state, incrementArticleView } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  const categories = ['all', ...new Set(state.articles.map(article => article.category))];

  const filteredArticles = state.articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleArticleClick = async (article: KnowledgeArticle) => {
    setSelectedArticle(article);
    try {
      await incrementArticleView(article.id);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  if (selectedArticle) {
    return (
      <div className="container">
        <div className="article-view">
          <button 
            className="btn btn-outline mb-3"
            onClick={() => setSelectedArticle(null)}
          >
            ← Back to Knowledge Hub
          </button>
          
          <article className="article-content">
            <header className="article-header">
              <h1>{selectedArticle.title}</h1>
              <div className="article-meta">
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Updated {formatDate(selectedArticle.updatedAt)}</span>
                </div>
                <div className="meta-item">
                  <Eye size={16} />
                  <span>{selectedArticle.views} views</span>
                </div>
                <div className="meta-item">
                  <Tag size={16} />
                  <span>{selectedArticle.category}</span>
                </div>
              </div>
              <div className="article-tags">
                {selectedArticle.tags.map(tag => (
                  <span key={tag} className="tag tag-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </header>
            
            <div className="article-body">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="article-h1">{children}</h1>,
                  h2: ({children}) => <h2 className="article-h2">{children}</h2>,
                  h3: ({children}) => <h3 className="article-h3">{children}</h3>,
                  h4: ({children}) => <h4 className="article-h4">{children}</h4>,
                  ul: ({children}) => <ul className="article-ul">{children}</ul>,
                  ol: ({children}) => <ol className="article-ol">{children}</ol>,
                  li: ({children}) => <li className="article-li">{children}</li>,
                  p: ({children}) => <p className="article-p">{children}</p>,
                  code: ({children, className}) => {
                    const isInline = !className;
                    return isInline 
                      ? <code className="article-code-inline">{children}</code>
                      : <code className="article-code-block">{children}</code>;
                  },
                  pre: ({children}) => <pre className="article-pre">{children}</pre>,
                  blockquote: ({children}) => <blockquote className="article-blockquote">{children}</blockquote>,
                  table: ({children}) => <table className="article-table">{children}</table>,
                  th: ({children}) => <th className="article-th">{children}</th>,
                  td: ({children}) => <td className="article-td">{children}</td>,
                  strong: ({children}) => <strong className="article-strong">{children}</strong>,
                  em: ({children}) => <em className="article-em">{children}</em>
                }}
              >
                {selectedArticle.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="knowledge-header">
        <h1>G'day AI Knowledge Hub</h1>
        <p>
          Find helpful articles, tutorials, and guides to get the most out of G'day AI. 
          Learn about features, troubleshoot issues, and discover best practices.
        </p>
      </div>

      <div className="knowledge-search">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search articles, guides, and tutorials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="knowledge-content">
        <div className="knowledge-stats">
          <div className="knowledge-stat">
            <BookOpen size={24} />
            <div>
              <h3>{state.articles.length}</h3>
              <p>Total Articles</p>
            </div>
          </div>
          <div className="knowledge-stat">
            <Tag size={24} />
            <div>
              <h3>{categories.length - 1}</h3>
              <p>Categories</p>
            </div>
          </div>
          <div className="knowledge-stat">
            <Eye size={24} />
            <div>
              <h3>{state.articles.reduce((sum, article) => sum + article.views, 0)}</h3>
              <p>Total Views</p>
            </div>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No articles found</h3>
            <p>Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map(article => (
              <div 
                key={article.id} 
                className="article-card"
                onClick={() => handleArticleClick(article)}
              >
                <div className="article-card-header">
                  <h3>{article.title}</h3>
                  <span className="category-badge">{article.category}</span>
                </div>
                
                <p className="article-excerpt">
                  {article.content.length > 200 
                    ? `${article.content.substring(0, 200)}...`
                    : article.content
                  }
                </p>
                
                <div className="article-card-footer">
                  <div className="article-tags">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag tag-secondary">
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="tag tag-more">+{article.tags.length - 3}</span>
                    )}
                  </div>
                  
                  <div className="article-meta">
                    <div className="meta-item">
                      <Eye size={14} />
                      <span>{article.views}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{formatDate(article.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeHub; 