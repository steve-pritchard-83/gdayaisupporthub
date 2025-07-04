import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import KnowledgeHub from './pages/KnowledgeHub';
import TicketProvider from './context/TicketContext';
import './App.css';

function App() {
  return (
    <TicketProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/knowledge" element={<KnowledgeHub />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </TicketProvider>
  );
}

export default App;
