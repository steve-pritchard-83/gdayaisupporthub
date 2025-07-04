import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

const AdminSelector: React.FC = () => {
  const { state, dispatch } = useTickets();

  const handleAdminSelect = (adminName: string) => {
    const admin = state.adminUsers.find(a => a.name === adminName);
    if (admin) {
      dispatch({ type: 'SET_ADMIN', payload: admin });
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_ADMIN', payload: null as any });
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
    <div className="admin-selector">
      <div className="admin-selector-header">
        <User size={20} />
        <span>Select Admin</span>
      </div>
      <div className="admin-buttons">
        {state.adminUsers.map(admin => (
          <button
            key={admin.id}
            className="btn btn-primary"
            onClick={() => handleAdminSelect(admin.name)}
          >
            {admin.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminSelector; 