import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import type { KnowledgeArticle } from '../types';

interface ArticleFormProps {
  article?: KnowledgeArticle;
  onSubmit: (article: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ 
  article, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags
      });
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.category) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting article:', error);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{article ? 'Edit Article' : 'Create New Article'}</h2>
          <button 
            onClick={onCancel}
            className="btn btn-outline btn-sm"
            disabled={isSubmitting}
          >
            <X size={16} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">Category *</label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="form-input"
              placeholder="e.g., Getting Started, Troubleshooting, API"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">Content *</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="form-textarea"
              rows={15}
              placeholder="Write your article content here... You can use markdown for formatting."
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">Tags</label>
            <div className="tag-input-container">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="form-input"
                placeholder="Add tags to help users find this article"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="btn btn-outline btn-sm"
                disabled={isSubmitting || !tagInput.trim()}
              >
                <Plus size={16} />
                Add Tag
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="tags-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag tag-removable">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="tag-remove"
                      disabled={isSubmitting}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
        
        <div className="modal-footer">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={isSubmitting || !formData.title || !formData.content || !formData.category}
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : (article ? 'Update Article' : 'Create Article')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleForm; 