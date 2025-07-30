import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  phosphoAnalysis?: {
    status: string;
    data?: any;
    plot?: string;
    message: string;
  };
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // 非流式模式
    try {
        const response = await axios.post('http://localhost:8000/api/chat', {
          message: currentInput,
          stream: false
        });
        
        const aiMessage: Message = { 
          role: 'assistant', 
          content: response.data.reply,
          phosphoAnalysis: response.data.phosphoAnalysis
        };
        
        // 调试日志
        console.log('=== AI Response ===');
        console.log('Reply:', response.data.reply);
        console.log('PhosphoAnalysis:', response.data.phosphoAnalysis);
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (error: any) {
        console.error('Chat error:', error);
        const errorContent = error.response?.data?.error || '抱歉，服务暂时不可用，请稍后重试。';
        const errorDetails = error.response?.data?.details;
        
        const errorMessage: Message = { 
          role: 'assistant', 
          content: errorDetails ? `${errorContent} (${errorDetails})` : errorContent
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h1>GIST辅助智能助手</h1>
      <p className="page-description">协助了解胃肠道间质瘤（GIST）相关知识</p>
      
      <div className="stream-toggle">
        <span style={{color: '#666', fontSize: '14px'}}>
          💡 非流式模式（支持磷酸化分析）
        </span>
      </div>
      
      <div className="chat-box">
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>👋 你好！我是GIST辅助智能助手。</p>
              <p>我可以协助您了解胃肠道间质瘤（GIST）相关知识：</p>
              <p>
                🧬 GIST基本概念和分子机制<br/>
                🔬 基因突变信息（KIT、PDGFRA等）<br/>
                🏥 诊断方法和治疗选择<br/>
                💊 药物信息和作用机制<br/>
                📚 研究进展和文献资料
              </p>
              <p>请注意：我提供的是科普信息，具体医疗决策请咨询专业医生。</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown 
                    components={{
                      p: ({children}) => <p style={{margin: '0.5em 0', lineHeight: '1.6'}}>{children}</p>,
                      h1: ({children}) => <h1 style={{fontSize: '1.2em', fontWeight: 'bold', margin: '0.8em 0 0.4em 0'}}>{children}</h1>,
                      h2: ({children}) => <h2 style={{fontSize: '1.1em', fontWeight: 'bold', margin: '0.7em 0 0.3em 0'}}>{children}</h2>,
                      h3: ({children}) => <h3 style={{fontSize: '1.05em', fontWeight: 'bold', margin: '0.6em 0 0.3em 0'}}>{children}</h3>,
                      ul: ({children}) => <ul style={{margin: '0.5em 0', paddingLeft: '1.5em'}}>{children}</ul>,
                      ol: ({children}) => <ol style={{margin: '0.5em 0', paddingLeft: '1.5em'}}>{children}</ol>,
                      li: ({children}) => <li style={{margin: '0.2em 0'}}>{children}</li>,
                      code: ({children}) => <code style={{backgroundColor: '#f5f5f5', padding: '0.2em 0.4em', borderRadius: '3px', fontSize: '0.9em'}}>{children}</code>,
                      pre: ({children}) => <pre style={{backgroundColor: '#f5f5f5', padding: '0.8em', borderRadius: '6px', overflow: 'auto', margin: '0.5em 0'}}>{children}</pre>,
                      strong: ({children}) => <strong style={{fontWeight: 'bold'}}>{children}</strong>,
                      em: ({children}) => <em style={{fontStyle: 'italic'}}>{children}</em>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
                {msg.phosphoAnalysis && (
                  <div className="phospho-analysis-result" style={{
                    marginTop: '1em',
                    padding: '1em',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h4 style={{margin: '0 0 0.5em 0', color: '#1C484C'}}>磷酸化分析结果</h4>
                    <p style={{margin: '0.5em 0'}}>{msg.phosphoAnalysis.message}</p>
                    {msg.phosphoAnalysis.plot && (
                      <div style={{marginTop: '1em'}}>
                        <img 
                          src={msg.phosphoAnalysis.plot} 
                          alt="分析结果图表" 
                          style={{
                            maxWidth: '100%',
                            borderRadius: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    )}
                    {msg.phosphoAnalysis.data && (
                      <div style={{marginTop: '1em', fontSize: '0.9em'}}>
                        <details>
                          <summary style={{cursor: 'pointer', color: '#1C484C'}}>查看详细数据</summary>
                          <pre style={{
                            marginTop: '0.5em',
                            padding: '0.5em',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            overflow: 'auto',
                            fontSize: '0.85em'
                          }}>
                            {JSON.stringify(msg.phosphoAnalysis.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="loading">AI正在思考...</div>}
        </div>
        
        <div className="input-section">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入您的GIST相关问题..."
            className="chat-input"
          />
          <button onClick={() => sendMessage()} disabled={loading} className="send-button">
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;