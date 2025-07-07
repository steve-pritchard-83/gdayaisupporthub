import React, { useState } from 'react';
import { User, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import AdminAuthModal from './AdminAuthModal';

const AdminSelector: React.FC = () => {
  const { state, setAdmin } = useTickets();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAdmin(null as any);
    navigate('/');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  if (state.currentAdmin) {
    return (
      <div className="admin-selector logged-in">
        <div className="current-admin">
          <User size={20} />
          <span>{state.currentAdmin.name}</span>
        </div>
        <button 
          className="btn btn-outline"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="admin-selector">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAuthModal(true)}
        >
          <Shield size={16} />
          Admin Login
        </button>
      </div>

      {showAuthModal && (
        <AdminAuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default AdminSelector; 