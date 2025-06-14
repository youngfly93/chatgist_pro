import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PageNavigator from './components/PageNavigator';
import Home from './pages/Home';
import GeneInfo from './pages/GeneInfo';
import AIChat from './pages/AIChat';
import GistDatabase from './pages/GistDatabase';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'database'>('main');

  const handlePageChange = (page: 'main' | 'database') => {
    setCurrentPage(page);
  };

  return (
    <Router>
      <div className="app" style={{ position: 'relative' }}>
        {/* 页面导航器 - 始终显示 */}
        <PageNavigator currentPage={currentPage} onPageChange={handlePageChange} />
        
        {currentPage === 'main' ? (
          // 主页面 - 原有的GIST AI功能
          <div style={{ minHeight: 'calc(100vh - 90px)' }}>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gene-info" element={<GeneInfo />} />
                <Route path="/ai-chat" element={<AIChat />} />
              </Routes>
            </main>
            <footer className="footer">
              <p>&copy; 2024 GIST AI - 基因信息智能助手</p>
              <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                💡 点击顶部"GIST 数据库"按钮可访问数据库
              </p>
            </footer>
          </div>
        ) : (
          // 数据库页面 - 外部GIST数据库
          <div style={{ height: 'calc(100vh - 90px)' }}>
            <GistDatabase />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;