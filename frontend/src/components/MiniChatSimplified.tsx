import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Microscope, BarChart3, Beaker, Dna, Bot } from 'lucide-react';
import { LoaderThree } from './ui/loader';

interface PhosphoAnalysis {
  status: string;
  data?: any;
  plot?: string;
  message: string;
  description?: string;
}

interface TranscriptomeAnalysis {
  status: string;
  data?: any;
  plot?: string;
  message: string;
  description?: string;
  correlation_stats?: any;
  roc_stats?: any;
}

interface SingleCellAnalysis {
  status: string;
  data?: any;
  image_base64?: string;
  message: string;
  description?: string;
  gene?: string;
  dataset?: string;
  cell_types?: string[];
  plot_type?: string;
  summary?: string;
  hasData?: boolean;
  hasPlot?: boolean;
  hasAnalyses?: boolean;
}

interface ComprehensiveAnalysis {
  status: string;
  message: string;
  gene: string;
  analyses: {
    [key: string]: PhosphoAnalysis;
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
    warnings: number;
  };
  data?: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  phosphoAnalysis?: PhosphoAnalysis | ComprehensiveAnalysis;
  transcriptomeAnalysis?: TranscriptomeAnalysis;
  singleCellAnalysis?: SingleCellAnalysis;
  proteomicsAnalysis?: any;
}

interface MiniChatProps {
  placeholder?: string;
  height?: string;
  onAnalysisResult?: (results: {
    phosphoAnalysis?: PhosphoAnalysis | ComprehensiveAnalysis;
    transcriptomeAnalysis?: TranscriptomeAnalysis;
    singleCellAnalysis?: SingleCellAnalysis;
  }) => void;
}

const MiniChat: React.FC<MiniChatProps> = ({ 
  placeholder = "输入问题，AI助手将为您解答...",
  height = "400px",
  onAnalysisResult
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // 使用setTimeout确保DOM更新完成后再滚动
    setTimeout(() => {
      const chatContainer = document.querySelector('.mini-chat-messages');
      if (chatContainer) {
        // 使用smooth滚动但限制在容器内
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  useEffect(() => {
    // 只在新消息添加时滚动，避免频繁触发
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 使用Tool Calling API（/api/chat现在指向chat_v2）
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: 'mini-chat-session'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 非流式响应直接解析JSON
      const data = await response.json();
      
      // 添加AI消息
      const aiMessage = {
        role: 'assistant' as const,
        content: data.reply || '抱歉，没有收到有效回复。',
        phosphoAnalysis: data.phosphoAnalysis,
        transcriptomeAnalysis: data.transcriptomeAnalysis,
        singleCellAnalysis: data.singleCellAnalysis
      };

      // 调试日志
      console.log('=== MiniChat AI Response ===');
      console.log('Reply:', data.reply);
      console.log('PhosphoAnalysis:', data.phosphoAnalysis);
      console.log('TranscriptomeAnalysis:', data.transcriptomeAnalysis);
      console.log('SingleCellAnalysis:', data.singleCellAnalysis);
      console.log('ProteomicsAnalysis:', data.proteomicsAnalysis);
      
      // 如果有分析结果，通过回调函数传递给父组件
      if (onAnalysisResult && (data.phosphoAnalysis || data.transcriptomeAnalysis || data.singleCellAnalysis || data.proteomicsAnalysis)) {
        // 只传递有数据的分析结果，清空其他结果
        const newResults: any = {};
        
        if (data.phosphoAnalysis) {
          newResults.phosphoAnalysis = data.phosphoAnalysis;
        }
        if (data.transcriptomeAnalysis) {
          newResults.transcriptomeAnalysis = data.transcriptomeAnalysis;  
        }
        if (data.singleCellAnalysis) {
          newResults.singleCellAnalysis = data.singleCellAnalysis;
        }
        if (data.proteomicsAnalysis) {
          newResults.proteomicsAnalysis = data.proteomicsAnalysis;
        }
        
        console.log('=== Sending Analysis Results to Parent ===');
        console.log('New Results:', newResults);
        
        onAnalysisResult(newResults);
      }
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = '抱歉，发生了错误。';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '连接服务器失败，请检查网络连接。';
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试。AI 正在处理复杂的分析任务，可能需要更多时间。';
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mini-chat-container" style={{ height }}>
      <div className="mini-chat-messages">
        {messages.length === 0 && (
          <div className="mini-welcome-message">
            <div className="welcome-content">
              <h4><Bot size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />您好！我是GIST AI助手</h4>
              <p>我可以帮您进行：</p>
              <ul>
                <li><Microscope size={16} style={{ display: 'inline', marginRight: '6px' }} /> 磷酸化蛋白质组学分析</li>
                <li><Dna size={16} style={{ display: 'inline', marginRight: '6px' }} /> 转录组学分析</li>
                <li><BarChart3 size={16} style={{ display: 'inline', marginRight: '6px' }} /> 单细胞RNA测序分析</li>
              </ul>
              <p>请输入您的问题开始分析！</p>
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`mini-message ${message.role}`}>
            <div className="mini-message-content">
              {message.role === 'assistant' ? (
                <>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  
                  {/* 简化的分析结果提示 */}
                  {message.phosphoAnalysis && (
                    <div className="analysis-notification phospho">
                      <span className="analysis-icon"><Microscope size={16} /></span>
                      <div className="analysis-text">
                        <strong>磷酸化分析已完成</strong>
                        <p>分析结果已显示在右侧面板中</p>
                      </div>
                    </div>
                  )}
                  
                  {message.transcriptomeAnalysis && (
                    <div className="analysis-notification transcriptome">
                      <span className="analysis-icon"><Dna size={16} /></span>
                      <div className="analysis-text">
                        <strong>转录组分析已完成</strong>
                        <p>分析结果已显示在右侧面板中</p>
                      </div>
                    </div>
                  )}
                  
                  {message.singleCellAnalysis && (
                    <div className="analysis-notification singlecell">
                      <span className="analysis-icon"><BarChart3 size={16} /></span>
                      <div className="analysis-text">
                        <strong>单细胞分析已完成</strong>
                        <p>分析结果已显示在右侧面板中</p>
                      </div>
                    </div>
                  )}
                  
                  {message.proteomicsAnalysis && (
                    <div className="analysis-notification proteomics">
                      <span className="analysis-icon"><Beaker size={16} /></span>
                      <div className="analysis-text">
                        <strong>蛋白质组学分析已完成</strong>
                        <p>分析结果已显示在右侧面板中</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="mini-loading">
            <LoaderThree />
            <span>AI正在分析中...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mini-chat-form">
        <div className="mini-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="mini-chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="mini-send-button"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      <style>{`
        .mini-chat-container {
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          overflow: hidden;
        }

        .mini-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mini-welcome-message {
          text-align: center;
          padding: 2rem 1rem;
          color: #6b7280;
        }

        .welcome-content h4 {
          color: #374151;
          margin: 0 0 1rem 0;
        }

        .welcome-content ul {
          text-align: left;
          display: inline-block;
          margin: 1rem 0;
        }

        .welcome-content li {
          margin: 0.5rem 0;
        }

        .mini-message {
          display: flex;
          margin-bottom: 0.5rem;
        }

        .mini-message.user {
          justify-content: flex-end;
        }

        .mini-message.assistant {
          justify-content: flex-start;
        }

        .mini-message-content {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .mini-message.user .mini-message-content {
          background: #3b82f6;
          color: white;
          border-bottom-right-radius: 0.25rem;
        }

        .mini-message.assistant .mini-message-content {
          background: #f3f4f6;
          color: #374151;
          border-bottom-left-radius: 0.25rem;
        }

        .analysis-notification {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
        }

        .analysis-notification.phospho {
          background: #fef3c7;
          border: 1px solid #fbbf24;
        }

        .analysis-notification.transcriptome {
          background: #dcfce7;
          border: 1px solid #22c55e;
        }

        .analysis-notification.singlecell {
          background: #e0e7ff;
          border: 1px solid #6366f1;
        }

        .analysis-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .analysis-text strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .analysis-text p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.8rem;
        }

        .phospho .analysis-text {
          color: #92400e;
        }

        .transcriptome .analysis-text {
          color: #166534;
        }

        .singlecell .analysis-text {
          color: #3730a3;
        }

        .mini-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .mini-chat-form {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .mini-input-container {
          display: flex;
          gap: 0.5rem;
        }

        .mini-chat-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
        }

        .mini-chat-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .mini-send-button {
          padding: 0.75rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .mini-send-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .mini-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default MiniChat;