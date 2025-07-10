import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  type = 'error',
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={20} className="text-warning" />;
      case 'info':
        return <AlertCircle size={20} className="text-info" />;
      default:
        return <AlertCircle size={20} className="text-danger" />;
    }
  };

  return (
    <div className={`error-message error-message-${type} ${className}`}>
      <div className="error-message-content">
        <div className="error-message-icon">
          {getIcon()}
        </div>
        <div className="error-message-text">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>
      </div>
      
      <div className="error-message-actions">
        {onRetry && (
          <button 
            className="btn btn-sm btn-outline" 
            onClick={onRetry}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        )}
        {onDismiss && (
          <button 
            className="btn btn-sm btn-outline" 
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 