import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Dna, Microscope, BarChart3 } from 'lucide-react';

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
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6"/>
                <stop offset="50%" stopColor="#1D4ED8"/>
                <stop offset="100%" stopColor="#1E40AF"/>
              </linearGradient>
              <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA"/>
                <stop offset="100%" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
            
            {/* Outer ring */}
            <circle cx="70" cy="70" r="65" fill="url(#logoGradient)" stroke="#ffffff" strokeWidth="3"/>
            
            {/* Inner circle */}
            <circle cx="70" cy="70" r="45" fill="url(#innerGradient)" opacity="0.9"/>
            
            {/* DNA double helix */}
            <g stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.9">
              <path d="M35 45 Q52 40 70 45 Q88 50 105 45"/>
              <path d="M35 55 Q52 50 70 55 Q88 60 105 55"/>
              <path d="M35 65 Q52 60 70 65 Q88 70 105 65"/>
              <path d="M35 75 Q52 70 70 75 Q88 80 105 75"/>
              <path d="M35 85 Q52 80 70 85 Q88 90 105 85"/>
              <path d="M35 95 Q52 90 70 95 Q88 100 105 95"/>
            </g>
            
            {/* DNA base pairs */}
            <g stroke="#ffffff" strokeWidth="1.5" opacity="0.7">
              <line x1="42" y1="45" x2="98" y2="55"/>
              <line x1="42" y1="55" x2="98" y2="65"/>
              <line x1="42" y1="65" x2="98" y2="75"/>
              <line x1="42" y1="75" x2="98" y2="85"/>
              <line x1="42" y1="85" x2="98" y2="95"/>
            </g>
            
            {/* Central AI symbol */}
            <circle cx="70" cy="35" r="12" fill="#ffffff"/>
            <circle cx="65" cy="31" r="2.5" fill="#1D4ED8"/>
            <circle cx="75" cy="31" r="2.5" fill="#1D4ED8"/>
            <ellipse cx="70" cy="38" rx="6" ry="3" fill="none" stroke="#1D4ED8" strokeWidth="1.5"/>
            
            {/* Neural network nodes */}
            <g fill="#ffffff" opacity="0.8">
              <circle cx="45" cy="30" r="3"/>
              <circle cx="95" cy="30" r="3"/>
              <circle cx="30" cy="70" r="3"/>
              <circle cx="110" cy="70" r="3"/>
              <circle cx="45" cy="110" r="3"/>
              <circle cx="95" cy="110" r="3"/>
            </g>
            
            {/* Neural connections */}
            <g stroke="#ffffff" strokeWidth="1" opacity="0.6">
              <line x1="45" y1="30" x2="58" y2="35"/>
              <line x1="95" y1="30" x2="82" y2="35"/>
              <line x1="30" y1="70" x2="55" y2="70"/>
              <line x1="110" y1="70" x2="85" y2="70"/>
              <line x1="45" y1="110" x2="58" y2="105"/>
              <line x1="95" y1="110" x2="82" y2="105"/>
            </g>
          </svg>
        </div>
        <h1 className="hero-title">GIST AI - 基因信息智能助手</h1>
        <p className="hero-subtitle">探索基因奥秘，AI赋能生命科学</p>
        
      </header>
      
      <div className="features-grid">
        <Link to="/ai-chat" className="feature-card">
          <Bot className="feature-icon" size={40} />
          <h3>GIST智能助手</h3>
          <p>与AI助手对话，学习GIST相关知识</p>
        </Link>
        
        <div className="feature-card" style={{ cursor: 'default', display: 'flex', flexDirection: 'column' }}>
          <Dna className="feature-icon" size={40} />
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
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Microscope size={16} />
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

          {/* 分隔线 */}
          <div style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#e0e0e0',
            margin: '25px 0 20px 0'
          }}></div>

          {/* GIST数据分析部分 */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <BarChart3 size={20} color="#4a90e2" />
              <h4 style={{ margin: 0, fontSize: '16px', color: '#333' }}>GIST数据分析</h4>
            </div>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>
              访问GIST专业数据库，进行深度数据分析
            </p>
            <button
              onClick={() => window.open('http://127.0.0.1:4964/', '_blank')}
              style={{
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#357abd';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4a90e2';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              进入数据库 →
            </button>
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