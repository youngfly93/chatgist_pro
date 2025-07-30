import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dna } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img 
            src="/GIST_gpt.png" 
            alt="GIST Logo" 
            style={{ 
              width: '32px', 
              height: '32px', 
              marginRight: '8px',
              borderRadius: '50%'
            }} 
          />
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