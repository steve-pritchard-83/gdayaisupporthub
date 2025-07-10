
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import KnowledgeHub from './pages/KnowledgeHub';
import TicketProvider from './context/TicketContext';
import ErrorBoundary from './components/ErrorBoundary';
// Demo mode imports (commented out for now)
// import React, { useState, useCallback } from 'react';
// import { ToastContainer } from './components/ToastNotification';
// import type { DemoNotification } from './utils/demoService';
import './App.css';

function App() {
  // Demo mode state (commented out for now)
  // const [notifications, setNotifications] = useState<DemoNotification[]>([]);

  // const addNotification = useCallback((notification: DemoNotification) => {
  //   setNotifications(prev => [...prev, notification]);
  // }, []);

  // const removeNotification = useCallback((id: string) => {
  //   setNotifications(prev => prev.filter(n => n.id !== id));
  // }, []);

  return (
    <ErrorBoundary>
      <TicketProvider>
        <Router basename={import.meta.env.PROD ? '/gdayaisupporthub' : ''}>
          <div className="App">
            <Header />
            <main className="main-content">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/knowledge" element={<KnowledgeHub />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
            {/* Demo mode notifications (commented out for now) */}
            {/* <ToastContainer 
              notifications={notifications} 
              onDismiss={removeNotification} 
            /> */}
          </div>
        </Router>
      </TicketProvider>
    </ErrorBoundary>
  );
}

export default App;
