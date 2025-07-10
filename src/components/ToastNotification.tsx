import React, { useEffect, useState } from 'react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { DemoNotification } from '../utils/demoService';

interface ToastNotificationProps {
  notification: DemoNotification;
  onDismiss: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(notification.id), 300);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [notification.id, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getStyles = () => {
    const baseStyles = {
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid',
      color: '#fff'
    };

    switch (notification.type) {
      case 'success':
        return {
          ...baseStyles,
          borderColor: '#22c55e',
          boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
        };
      case 'info':
        return {
          ...baseStyles,
          borderColor: '#3b82f6',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
        };
      case 'warning':
        return {
          ...baseStyles,
          borderColor: '#f59e0b',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div
      style={{
        ...getStyles(),
        padding: '1rem',
        borderRadius: '8px',
        margin: '0.5rem 0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minWidth: '300px',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease-out',
        position: 'relative'
      }}
    >
      <div style={{ color: notification.type === 'success' ? '#22c55e' : notification.type === 'info' ? '#3b82f6' : '#f59e0b' }}>
        {getIcon()}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          {notification.title}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
          {notification.message}
        </div>
      </div>

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(notification.id), 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Toast container component
interface ToastContainerProps {
  notifications: DemoNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, onDismiss }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '120px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '400px'
      }}
    >
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default ToastNotification; 