import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Eye, Edit, Bold, Italic, List, Code, Link, Heading1, Heading2, Heading3, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [contentTextarea, setContentTextarea] = useState<HTMLTextAreaElement | null>(null);

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

  // Formatting helper functions
  const insertAtCursor = (before: string, after: string = '', placeholder: string = '') => {
    if (!contentTextarea) return;

    const start = contentTextarea.selectionStart;
    const end = contentTextarea.selectionEnd;
    const selectedText = formData.content.slice(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newContent = 
      formData.content.slice(0, start) + 
      before + textToInsert + after + 
      formData.content.slice(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Reset cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length + after.length;
      contentTextarea.setSelectionRange(newCursorPos, newCursorPos);
      contentTextarea.focus();
    }, 0);
  };

  const formatBold = () => insertAtCursor('**', '**', 'bold text');
  const formatItalic = () => insertAtCursor('*', '*', 'italic text');
  const formatCode = () => insertAtCursor('`', '`', 'code');
  const formatH1 = () => insertAtCursor('# ', '', 'Heading 1');
  const formatH2 = () => insertAtCursor('## ', '', 'Heading 2');
  const formatH3 = () => insertAtCursor('### ', '', 'Heading 3');
  const formatQuote = () => insertAtCursor('> ', '', 'Quote text');
  const formatList = () => insertAtCursor('- ', '', 'List item');
  const formatLink = () => insertAtCursor('[', '](url)', 'link text');

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
            <div className="content-editor-header">
              <label className="form-label">Content *</label>
              <div className="editor-controls">
                <div className="view-mode-toggle">
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`btn btn-sm ${viewMode === 'edit' ? 'btn-primary' : 'btn-outline'}`}
                    disabled={isSubmitting}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-outline'}`}
                    disabled={isSubmitting}
                  >
                    <Edit size={14} />
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`btn btn-sm ${viewMode === 'preview' ? 'btn-primary' : 'btn-outline'}`}
                    disabled={isSubmitting}
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className="editor-section">
                <div className="formatting-toolbar">
                  <div className="toolbar-group">
                    <button type="button" onClick={formatH1} className="toolbar-btn" title="Heading 1" disabled={isSubmitting}>
                      <Heading1 size={16} />
                    </button>
                    <button type="button" onClick={formatH2} className="toolbar-btn" title="Heading 2" disabled={isSubmitting}>
                      <Heading2 size={16} />
                    </button>
                    <button type="button" onClick={formatH3} className="toolbar-btn" title="Heading 3" disabled={isSubmitting}>
                      <Heading3 size={16} />
                    </button>
                  </div>
                  <div className="toolbar-separator"></div>
                  <div className="toolbar-group">
                    <button type="button" onClick={formatBold} className="toolbar-btn" title="Bold" disabled={isSubmitting}>
                      <Bold size={16} />
                    </button>
                    <button type="button" onClick={formatItalic} className="toolbar-btn" title="Italic" disabled={isSubmitting}>
                      <Italic size={16} />
                    </button>
                    <button type="button" onClick={formatCode} className="toolbar-btn" title="Inline Code" disabled={isSubmitting}>
                      <Code size={16} />
                    </button>
                  </div>
                  <div className="toolbar-separator"></div>
                  <div className="toolbar-group">
                    <button type="button" onClick={formatList} className="toolbar-btn" title="Bullet List" disabled={isSubmitting}>
                      <List size={16} />
                    </button>
                    <button type="button" onClick={formatQuote} className="toolbar-btn" title="Quote" disabled={isSubmitting}>
                      <Quote size={16} />
                    </button>
                    <button type="button" onClick={formatLink} className="toolbar-btn" title="Link" disabled={isSubmitting}>
                      <Link size={16} />
                    </button>
                  </div>
                </div>
                <textarea
                  ref={setContentTextarea}
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="form-textarea editor-textarea"
                  rows={viewMode === 'split' ? 20 : 15}
                  placeholder="Write your article content here... You can use markdown for formatting."
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`preview-section ${viewMode === 'split' ? 'split-preview' : ''}`}>
                <div className="preview-header">
                  <h4>Preview</h4>
                </div>
                <div className="preview-content">
                  {formData.content ? (
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
                      {formData.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="preview-placeholder">Start typing in the editor to see the preview...</p>
                  )}
                </div>
              </div>
            )}
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