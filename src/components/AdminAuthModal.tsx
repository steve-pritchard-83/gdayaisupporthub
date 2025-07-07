import React, { useState } from 'react';
import { X, Mail, Lock, Shield } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

interface AdminAuthModalProps {
  onClose: () => void;
  onAuthenticated: () => void;
}

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = [
  {
    id: 'steve',
    email: 'Steve.Pritchard@discoveryparks.com.au',
    name: 'Steve',
    password: '123456',
    role: 'Senior Administrator'
  },
  {
    id: 'nolan',
    email: 'nolan.sipos@discoveryparks.com.au',
    name: 'Nolan',
    password: '123456',
    role: 'Administrator'
  }
];

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onClose, onAuthenticated }) => {
  const { setAdmin } = useTickets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    // Find admin by email and validate password
    const admin = ADMIN_CREDENTIALS.find(a => a.email.toLowerCase() === email.toLowerCase());
    
    if (!admin) {
      setError('Email address not found');
      return;
    }

    if (admin.password !== password) {
      setError('Incorrect password');
      return;
    }

    // Set the authenticated admin
    setAdmin({
      id: admin.id,
      name: admin.name,
      role: admin.role,
      isActive: true
    });
    
    onAuthenticated();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="admin-auth-header">
            <Shield size={24} />
            <h2>Admin Authentication</h2>
          </div>
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
            <div className="auth-intro">
              <p>Please enter your email address and password to access the admin panel.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address *</label>
              <div className="password-input">
                <Mail size={20} />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password *</label>
              <div className="password-input">
                <Lock size={20} />
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Shield size={16} />
              Access Admin Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthModal; 