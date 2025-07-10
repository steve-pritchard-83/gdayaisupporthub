import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Eye } from 'lucide-react';
import demoService, { type DemoNotification } from '../utils/demoService';
import { useTickets } from '../context/TicketContext';

interface DemoModeToggleProps {
  onDemoModeChange: (enabled: boolean) => void;
  onNotification?: (notification: DemoNotification) => void;
}

const DemoModeToggle: React.FC<DemoModeToggleProps> = ({ onDemoModeChange, onNotification }) => {
  const [demoMode, setDemoMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const { createTicket, updateTicket, addComment, state } = useTickets();

  useEffect(() => {
    if (demoMode) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto-refresh demo data
            window.location.reload();
            return 600;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [demoMode]);

  const toggleDemoMode = () => {
    const newMode = !demoMode;
    setDemoMode(newMode);
    onDemoModeChange(newMode);
    
    if (newMode) {
      setTimeLeft(600);
      localStorage.setItem('demo_mode', 'true');
      
      // Start the 1-minute demo sequence
      startDemoSequence();
    } else {
      localStorage.removeItem('demo_mode');
      demoService.stopDemo();
      setIsRunningDemo(false);
    }
  };

  const startDemoSequence = async () => {
    setIsRunningDemo(true);
    
    demoService.startDemo({
      onTicketCreate: async (ticketData) => {
        try {
          await createTicket(ticketData);
        } catch (error) {
          console.error('Error creating demo ticket:', error);
        }
      },
      onTicketUpdate: async (ticketId, updates) => {
        try {
          await updateTicket(ticketId, updates);
        } catch (error) {
          console.error('Error updating demo ticket:', error);
        }
      },
      onCommentAdd: async (ticketId, comment) => {
        try {
          await addComment(ticketId, comment);
        } catch (error) {
          console.error('Error adding demo comment:', error);
        }
      },
      onNotification: (notification) => {
        if (onNotification) {
          onNotification(notification);
        }
      },
      getCurrentTickets: () => state.tickets
    });

    // Demo sequence completes after 60 seconds
    setTimeout(() => {
      setIsRunningDemo(false);
    }, 60000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const pulseAnimation: React.CSSProperties = {
    animation: 'demo-pulse 2s infinite'
  };

  return (
    <>
      <style>
        {`
          @keyframes demo-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
        `}
      </style>
      <div className="demo-mode-toggle">
        <button
          onClick={toggleDemoMode}
          className={`btn ${demoMode ? 'btn-primary' : 'btn-outline'}`}
          style={{ 
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {demoMode ? <Zap size={16} /> : <Eye size={16} />}
          {demoMode ? 'Demo Mode ON' : 'Start 1-Min Demo'}
        </button>
        
        {demoMode && (
          <div style={{
            background: isRunningDemo 
              ? 'linear-gradient(135deg, #ff6b6b, #ff8e8e)'
              : 'linear-gradient(135deg, #ffd700, #ffed4e)',
            color: isRunningDemo ? '#fff' : '#000',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            ...pulseAnimation
          }}>
            <RefreshCw size={16} />
            <span>
              {isRunningDemo 
                ? 'Live Demo Running...'
                : `Demo Mode - Resets in ${formatTime(timeLeft)}`
              }
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default DemoModeToggle; 