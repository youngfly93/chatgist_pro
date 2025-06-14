import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [quickGene, setQuickGene] = useState('');

  const handleQuickSearch = () => {
    if (!quickGene.trim()) {
      alert('请输入基因名称');
      return;
    }
    
    // 构建GIST检索式
    const searchQuery = `(GIST) AND (${quickGene.trim()})`;
    const pubmedUrl = `https://www.pubmed.ai/results?q=${encodeURIComponent(searchQuery)}`;
    window.open(pubmedUrl, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuickSearch();
    }
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1 className="hero-title">GIST AI - 基因信息智能助手</h1>
        <p className="hero-subtitle">探索基因奥秘，AI赋能生命科学</p>
        
      </header>
      
      <div className="features-grid">
        <Link to="/ai-chat" className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>GIST智能助手</h3>
          <p>与AI助手对话，学习GIST相关知识</p>
        </Link>
        
        <div className="feature-card" style={{ cursor: 'default' }}>
          <div className="feature-icon">🧬</div>
          <h3>GIST基因筛选</h3>
          <p>筛选GIST相关基因，使用专业检索式查看文献</p>
          
          {/* 快速基因搜索 */}
          <div style={{ marginTop: '20px' }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={quickGene}
                onChange={(e) => setQuickGene(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入基因名称..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4a90e2';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                }}
              />
              <button
                onClick={handleQuickSearch}
                disabled={!quickGene.trim()}
                style={{
                  backgroundColor: quickGene.trim() ? '#4a90e2' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 15px',
                  fontSize: '14px',
                  cursor: quickGene.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease'
                }}
              >
                🔬
              </button>
            </div>
            <div style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#999',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {['TP53', 'KIT', 'PDGFRA'].map((gene) => (
                  <button
                    key={gene}
                    onClick={() => setQuickGene(gene)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      color: '#4a90e2',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f8ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {gene}
                  </button>
                ))}
              </div>
              <Link 
                to="/gene-info"
                style={{
                  fontSize: '12px',
                  color: '#4a90e2',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                更多选项 →
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <section className="about-section">
        <h2>关于GIST AI</h2>
        <p>GIST AI是一个结合人工智能技术的基因信息平台，旨在让基因科学知识更易获取和理解。</p>
        
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '30px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#4a90e2', marginBottom: '10px', fontSize: '16px' }}>🗄️ GIST专业数据库</h3>
          <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
            点击页面顶部的"GIST 数据库"按钮可访问专业数据库
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px'
          }}>
            <span>📊</span>
            <span style={{ 
              color: '#4a90e2',
              fontWeight: '500'
            }}>
              数据库 + AI助手双重体验
            </span>
            <span>🤖</span>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes slide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Home;