import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, BarChart3, MessageCircle } from 'lucide-react';
import MiniChatSimplified from '../components/MiniChatSimplified';
import AnalysisResults from '../components/AnalysisResults';
import FloatingChat from '../components/FloatingChat';

const Home: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<{
    phosphoAnalysis?: any;
    transcriptomeAnalysis?: any;
    singleCellAnalysis?: any;
    proteomicsAnalysis?: any;
  }>({});

  const handleAnalysisResult = (results: any) => {
    console.log('=== Home: Received Analysis Results ===');
    console.log('Received results:', results);
    
    // 完全替换分析结果，不保留旧结果
    setAnalysisResults(results);
    
    console.log('=== Home: Updated Analysis Results State ===');
    console.log('New state will be:', results);
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
            onClick={() => document.querySelector('.single-feature-container')?.scrollIntoView({ behavior: 'smooth' })}
          >
            立即体验
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 10L12 15L17 10"/>
            </svg>
          </button>
        </div>
      </header>
      
      <div className="analysis-workspace">
        <div className="workspace-header">
          <Bot className="workspace-icon" size={32} />
          <div className="workspace-title">
            <h3>GIST智能分析工作台</h3>
            <p>与AI助手对话，进行基因组学分析</p>
          </div>
          <Link to="/ai-chat" className="full-chat-link">
            进入完整对话 →
          </Link>
        </div>
        
        <div className="workspace-content">
          <div className="chat-panel">
            <div className="panel-header">
              <h4><MessageCircle size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />AI对话</h4>
            </div>
            <MiniChatSimplified 
              height="500px" 
              onAnalysisResult={handleAnalysisResult}
              placeholder="询问基因分析问题，如：KIT基因的单细胞分析"
            />
          </div>
          
          <div className="results-panel">
            <div className="panel-header">
              <h4><BarChart3 size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />分析结果</h4>
            </div>
            <div className="results-content">
              <AnalysisResults 
                key={JSON.stringify(analysisResults)}
                phosphoAnalysis={analysisResults.phosphoAnalysis}
                transcriptomeAnalysis={analysisResults.transcriptomeAnalysis}
                singleCellAnalysis={analysisResults.singleCellAnalysis}
                proteomicsAnalysis={analysisResults.proteomicsAnalysis}
              />
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

      {/* 浮动AI助手 */}
      <FloatingChat />
    </div>
  );
};

export default Home;