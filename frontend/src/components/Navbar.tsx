import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🧬</span>
          <span className="logo-text">GIST AI</span>
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            首页
          </Link>
          <Link 
            to="/gene-info" 
            className={`nav-link ${location.pathname === '/gene-info' ? 'active' : ''}`}
          >
            基因查询
          </Link>
          <Link 
            to="/ai-chat" 
            className={`nav-link ${location.pathname === '/ai-chat' ? 'active' : ''}`}
          >
            AI助手
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;