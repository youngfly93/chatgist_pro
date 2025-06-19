import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Dna, Microscope, BarChart3 } from 'lucide-react';
import MiniChat from '../components/MiniChat';

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
        <div className="hero-logo">
          <img 
            src="/GIST_gpt.png" 
            alt="GIST AI Logo" 
            width="140" 
            height="140"
            style={{
              borderRadius: '50%',
              backgroundColor: 'white',
              padding: '10px'
            }}
          />
        </div>
        <h1 className="hero-title">GIST AI - 基因信息智能助手</h1>
        <p className="hero-subtitle">探索基因奥秘，AI赋能生命科学</p>
        <div className="hero-cta">
          <button 
            className="cta-button primary"
            onClick={() => document.querySelector('.features-grid')?.scrollIntoView({ behavior: 'smooth' })}
          >
            立即体验
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 10L12 15L17 10"/>
            </svg>
          </button>
        </div>
      </header>
      
      <div className="features-grid">
        <div className="feature-card ai-chat-card">
          <div className="feature-header">
            <Bot className="feature-icon" size={40} />
            <h3>GIST智能助手</h3>
            <p>与AI助手对话，学习GIST相关知识</p>
          </div>
          <MiniChat height="350px" />
          <Link to="/ai-chat" className="full-chat-link">
            进入完整对话 →
          </Link>
        </div>
        
        <div className="feature-split-container">
          <div className="feature-split-card gene-screening">
            <div className="split-card-header">
              <Dna size={48} color="#1C484C" />
              <h3>GIST基因筛选</h3>
              <p>筛选GIST相关基因，使用专业检索式查看文献</p>
            </div>
            
            <div className="split-card-content">
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
                  className="gene-search-input"
                />
                <button
                  onClick={handleQuickSearch}
                  disabled={!quickGene.trim()}
                  className="gene-search-button"
                >
                  <Microscope size={16} />
                </button>
              </div>
              <div className="gene-quick-tags">
                <div className="gene-tags">
                  {['TP53', 'KIT', 'PDGFRA'].map((gene) => (
                    <button
                      key={gene}
                      onClick={() => setQuickGene(gene)}
                      className="gene-tag"
                    >
                      {gene}
                    </button>
                  ))}
                </div>
                <Link to="/gene-info" className="more-options-link">
                  更多选项 →
                </Link>
              </div>
            </div>
          </div>

          <div className="feature-split-divider"></div>

          <div className="feature-split-card data-analysis">
            <div className="split-card-header">
              <BarChart3 size={48} color="#1C484C" />
              <h3>GIST数据分析</h3>
              <p>访问GIST专业数据库，进行深度数据分析</p>
            </div>
            
            <div className="split-card-content">
              <button
                onClick={() => window.open(import.meta.env.VITE_SHINY_URL || 'http://127.0.0.1:4964/', '_blank')}
                className="primary-action-button"
              >
                进入数据库 →
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <section className="about-section">
        <h2>关于GIST AI</h2>
        <p>GIST AI是一个结合人工智能技术的基因信息平台，旨在让基因科学知识更易获取和理解。</p>
      </section>
      
      <style>{`
        @keyframes slide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Home;