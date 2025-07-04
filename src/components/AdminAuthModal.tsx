import React, { useState } from 'react';
import { X, User, Lock, Shield } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

interface AdminAuthModalProps {
  onClose: () => void;
  onAuthenticated: () => void;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onClose, onAuthenticated }) => {
  const { state, dispatch } = useTickets();
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAdmin) {
      setError('Please select an admin');
      return;
    }

    if (password !== '123456') {
      setError('Incorrect password');
      return;
    }

    // Find and set the admin
    const admin = state.adminUsers.find(a => a.name === selectedAdmin);
    if (admin) {
      dispatch({ type: 'SET_ADMIN', payload: admin });
      onAuthenticated();
      onClose();
    }
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
              <p>Please select your admin profile and enter the password to access the admin panel.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Select Admin *</label>
              <div className="admin-selection">
                {state.adminUsers.map(admin => (
                  <label key={admin.id} className="admin-option">
                    <input
                      type="radio"
                      name="admin"
                      value={admin.name}
                      checked={selectedAdmin === admin.name}
                      onChange={(e) => setSelectedAdmin(e.target.value)}
                    />
                    <div className="admin-option-content">
                      <User size={20} />
                      <div>
                        <strong>{admin.name}</strong>
                        <p>{admin.role}</p>
                      </div>
                    </div>
                  </label>
                ))}
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
                  placeholder="Enter admin password"
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