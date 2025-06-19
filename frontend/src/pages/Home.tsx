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
                  border: '1px solid #D7E4E5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1C484C';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D7E4E5';
                }}
              />
              <button
                onClick={handleQuickSearch}
                disabled={!quickGene.trim()}
                style={{
                  backgroundColor: quickGene.trim() ? '#1C484C' : '#ccc',
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
                      border: '1px solid #D7E4E5',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      color: '#1C484C',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F2F7F7';
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
                  color: '#1C484C',
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
              <BarChart3 size={20} color="#1C484C" />
              <h4 style={{ margin: 0, fontSize: '16px', color: '#333' }}>GIST数据分析</h4>
            </div>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0' }}>
              访问GIST专业数据库，进行深度数据分析
            </p>
            <button
              onClick={() => window.open('http://127.0.0.1:4964/', '_blank')}
              style={{
                backgroundColor: '#1C484C',
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
                e.currentTarget.style.backgroundColor = '#163A3D';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1C484C';
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