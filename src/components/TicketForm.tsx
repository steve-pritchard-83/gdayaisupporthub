import React, { useState } from 'react';
import { X, Bug, Lightbulb, Send } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import type { TicketType, Priority } from '../types';

interface TicketFormProps {
  onClose: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onClose }) => {
  const { dispatch } = useTickets();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'bug' as TicketType,
    priority: 'medium' as Priority,
    submitterName: '',
    submitterEmail: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.submitterName) {
      alert('Please fill in all required fields');
      return;
    }

    dispatch({
      type: 'ADD_TICKET',
      payload: {
        ...formData,
        status: 'pending' as const
      }
    });

    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Submit New Ticket</h2>
          <button 
            className="btn btn-outline" 
            onClick={onClose}
            style={{ padding: '0.5rem', minWidth: 'auto' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <div className="type-selector">
                <label className="type-option">
                  <input
                    type="radio"
                    name="type"
                    value="bug"
                    checked={formData.type === 'bug'}
                    onChange={handleChange}
                  />
                  <div className="type-option-content">
                    <Bug size={20} />
                    <div>
                      <strong>Bug Report</strong>
                      <p>Report issues, errors, or unexpected behavior</p>
                    </div>
                  </div>
                </label>
                
                <label className="type-option">
                  <input
                    type="radio"
                    name="type"
                    value="feature"
                    checked={formData.type === 'feature'}
                    onChange={handleChange}
                  />
                  <div className="type-option-content">
                    <Lightbulb size={20} />
                    <div>
                      <strong>Feature Request</strong>
                      <p>Suggest new features or improvements</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                placeholder="Brief description of the issue or request"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                placeholder="Provide detailed information about the issue or feature request. Include steps to reproduce for bugs, or explain the use case for features."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="submitterName">Your Name *</label>
                <input
                  type="text"
                  id="submitterName"
                  name="submitterName"
                  className="form-input"
                  placeholder="Full name"
                  value={formData.submitterName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="submitterEmail">Email</label>
                <input
                  type="email"
                  id="submitterEmail"
                  name="submitterEmail"
                  className="form-input"
                  placeholder="your@email.com"
                  value={formData.submitterEmail}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Send size={16} />
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm; 