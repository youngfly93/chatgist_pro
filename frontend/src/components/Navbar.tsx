import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { Dna } from 'lucide-react'; // 暂时注释掉未使用的导入

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
          <Link
            to="/loader-test"
            className={`nav-link ${location.pathname === '/loader-test' ? 'active' : ''}`}
          >
            动效测试
          </Link>
          <Link
            to="/chat-demo"
            className={`nav-link ${location.pathname === '/chat-demo' ? 'active' : ''}`}
          >
            聊天演示
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;