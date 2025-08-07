import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, BarChart3, MessageCircle, History, X, Clock, ChevronRight } from 'lucide-react';
import MiniChatSimplified from '../components/MiniChatSimplified';
import AnalysisResults from '../components/AnalysisResults';
import FloatingChat from '../components/FloatingChat';

// 历史记录项的类型
interface HistoryItem {
  id: string;
  timestamp: string;
  title: string;
  results: {
    phosphoAnalysis?: any;
    transcriptomeAnalysis?: any;
    singleCellAnalysis?: any;
    proteomicsAnalysis?: any;
  };
}

const Home: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<{
    phosphoAnalysis?: any;
    transcriptomeAnalysis?: any;
    singleCellAnalysis?: any;
    proteomicsAnalysis?: any;
  }>({});
  
  const [analysisHistory, setAnalysisHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setAnalysisHistory(parsed);
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // 保存历史记录到localStorage
  const saveHistory = (history: HistoryItem[]) => {
    try {
      // 只保留最近20条记录
      const trimmedHistory = history.slice(0, 20);
      localStorage.setItem('analysisHistory', JSON.stringify(trimmedHistory));
      setAnalysisHistory(trimmedHistory);
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  // 生成分析标题
  const generateTitle = (results: any) => {
    const parts = [];
    if (results.phosphoAnalysis) {
      if (results.phosphoAnalysis.gene) {
        parts.push(`${results.phosphoAnalysis.gene}磷酸化`);
      } else {
        parts.push('磷酸化分析');
      }
    }
    if (results.transcriptomeAnalysis) {
      if (results.transcriptomeAnalysis.gene) {
        parts.push(`${results.transcriptomeAnalysis.gene}转录组`);
      } else {
        parts.push('转录组分析');
      }
    }
    if (results.singleCellAnalysis) {
      parts.push('单细胞分析');
    }
    if (results.proteomicsAnalysis) {
      if (results.proteomicsAnalysis.gene) {
        parts.push(`${results.proteomicsAnalysis.gene}蛋白质组`);
      } else {
        parts.push('蛋白质组分析');
      }
    }
    return parts.join(' | ') || '分析结果';
  };

  const handleAnalysisResult = (results: any) => {
    console.log('=== Home: Received Analysis Results ===');
    console.log('Received results:', results);
    
    // 完全替换分析结果，不保留旧结果
    setAnalysisResults(results);
    
    // 添加到历史记录
    if (Object.keys(results).length > 0) {
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('zh-CN'),
        title: generateTitle(results),
        results: results
      };
      
      const newHistory = [newHistoryItem, ...analysisHistory];
      saveHistory(newHistory);
    }
    
    console.log('=== Home: Updated Analysis Results State ===');
    console.log('New state will be:', results);
  };

  // 从历史记录恢复分析结果
  const restoreFromHistory = (item: HistoryItem) => {
    setAnalysisResults(item.results);
    setSelectedHistoryItem(item);
    setShowHistory(false);
  };

  // 清空历史记录
  const clearHistory = () => {
    if (window.confirm('确定要清空所有历史记录吗？')) {
      setAnalysisHistory([]);
      localStorage.removeItem('analysisHistory');
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
            <div className="panel-header" style={{ position: 'relative' }}>
              <h4><BarChart3 size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />分析结果</h4>
              {/* 历史记录按钮 */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#6b21d4',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="查看历史记录"
              >
                <History size={20} />
                {analysisHistory.length > 0 && (
                  <span style={{
                    fontSize: '12px',
                    background: '#6b21d4',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {analysisHistory.length}
                  </span>
                )}
              </button>
            </div>
            <div className="results-content">
              <AnalysisResults 
                phosphoAnalysis={analysisResults.phosphoAnalysis}
                transcriptomeAnalysis={analysisResults.transcriptomeAnalysis}
                singleCellAnalysis={analysisResults.singleCellAnalysis}
                proteomicsAnalysis={analysisResults.proteomicsAnalysis}
              />
            </div>
          </div>
          
          {/* 历史记录弹窗 */}
          {showHistory && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}>
                {/* 弹窗标题 */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={24} color="#6b21d4" />
                    分析历史记录
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {analysisHistory.length > 0 && (
                      <button
                        onClick={clearHistory}
                        style={{
                          padding: '8px 16px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        清空历史
                      </button>
                    )}
                    <button
                      onClick={() => setShowHistory(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                      }}
                    >
                      <X size={24} color="#6b7280" />
                    </button>
                  </div>
                </div>
                
                {/* 历史记录列表 */}
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '20px'
                }}>
                  {analysisHistory.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#9ca3af'
                    }}>
                      <History size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p>暂无历史记录</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analysisHistory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => restoreFromHistory(item)}
                          style={{
                            padding: '16px',
                            background: selectedHistoryItem?.id === item.id ? '#f3e8ff' : '#f9fafb',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: selectedHistoryItem?.id === item.id ? '2px solid #6b21d4' : '1px solid #e5e7eb',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedHistoryItem?.id !== item.id) {
                              e.currentTarget.style.background = '#f3f4f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedHistoryItem?.id !== item.id) {
                              e.currentTarget.style.background = '#f9fafb';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '16px' }}>
                                {item.title}
                              </h4>
                              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={14} />
                                {item.timestamp}
                              </p>
                            </div>
                            <ChevronRight size={20} color="#6b7280" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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