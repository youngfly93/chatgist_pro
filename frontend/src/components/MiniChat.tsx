import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, Dna } from 'lucide-react';
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
  
  // 判断是否为综合分析
  const isComprehensiveAnalysis = (analysis: PhosphoAnalysis | ComprehensiveAnalysis): analysis is ComprehensiveAnalysis => {
    return 'analyses' in analysis && 'summary' in analysis;
  };
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    const currentInput = input;
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
          message: currentInput,
          stream: false
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
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
      
      // 如果有分析结果，通过回调函数传递给父组件
      if (onAnalysisResult && (data.phosphoAnalysis || data.transcriptomeAnalysis || data.singleCellAnalysis)) {
        onAnalysisResult({
          phosphoAnalysis: data.phosphoAnalysis,
          transcriptomeAnalysis: data.transcriptomeAnalysis,
          singleCellAnalysis: data.singleCellAnalysis
        });
      }
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = '抱歉，发生了错误。';
      
      if (error.message?.includes('HTTP error')) {
        errorMessage = '连接服务器失败，请检查网络连接。';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = '无法连接到服务器，请确保服务正在运行。';
      } else if (error.message) {
        errorMessage = `错误：${error.message}`;
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
    <div className="mini-chat" style={{ height }}>
      <div className="mini-chat-messages">
        {messages.length === 0 ? (
          <div className="mini-chat-welcome">
            <p><Bot size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />您好！我是GIST AI助手</p>
            <p>有什么问题可以问我</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`mini-message ${message.role}`}>
              <div className="mini-message-content">
                {message.role === 'assistant' ? (
                  <>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    {message.phosphoAnalysis && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#f0f8ff',
                        borderRadius: '6px',
                        border: '1px solid #e0e0e0',
                        fontSize: '0.9em'
                      }}>
                        {isComprehensiveAnalysis(message.phosphoAnalysis) ? (
                          // 综合分析显示
                          <div>
                            <strong style={{color: '#1C484C'}}>
                              {message.phosphoAnalysis.gene} 基因综合磷酸化分析结果
                            </strong>
                            <div style={{
                              margin: '8px 0',
                              padding: '6px',
                              backgroundColor: '#e8f5e8',
                              borderRadius: '4px',
                              fontSize: '0.85em'
                            }}>
                              <strong>分析概览：</strong>
                              总计 {message.phosphoAnalysis.summary.total} 项分析，
                              成功 {message.phosphoAnalysis.summary.successful} 项，
                              警告 {message.phosphoAnalysis.summary.warnings} 项，
                              失败 {message.phosphoAnalysis.summary.failed} 项
                            </div>
                            
                            {Object.entries(message.phosphoAnalysis.analyses).map(([analysisType, analysis]) => (
                              <div key={analysisType} style={{
                                marginBottom: '8px',
                                padding: '6px',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                              }}>
                                <div style={{
                                  fontSize: '0.9em',
                                  fontWeight: 'bold',
                                  color: '#2c3e50',
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginBottom: '4px'
                                }}>
                                  <span style={{
                                    display: 'inline-block',
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: analysis.status === 'success' ? '#28a745' : 
                                                   analysis.status === 'warning' ? '#ffc107' : '#dc3545',
                                    marginRight: '6px'
                                  }}></span>
                                  {analysis.description || analysisType}
                                </div>
                                <p style={{margin: '4px 0', fontSize: '0.8em', color: '#666'}}>
                                  {analysis.message}
                                </p>
                                
                                {analysis.plot && (
                                  <div style={{marginTop: '6px'}}>
                                    <img 
                                      src={analysis.plot} 
                                      alt={`${analysis.description || analysisType} 分析图表`}
                                      style={{
                                        maxWidth: '100%',
                                        borderRadius: '3px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                      }}
                                    />
                                  </div>
                                )}
                                
                                {analysis.data && (
                                  <details style={{marginTop: '6px', fontSize: '0.8em'}}>
                                    <summary style={{cursor: 'pointer', color: '#1C484C'}}>
                                      查看详细数据
                                    </summary>
                                    <pre style={{
                                      marginTop: '4px',
                                      padding: '4px',
                                      backgroundColor: '#f8f9fa',
                                      borderRadius: '3px',
                                      overflow: 'auto',
                                      fontSize: '0.75em'
                                    }}>
                                      {JSON.stringify(analysis.data, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          // 单个分析显示（原有逻辑）
                          <div>
                            <strong style={{color: '#1C484C'}}>磷酸化分析结果</strong>
                            <p style={{margin: '5px 0'}}>{message.phosphoAnalysis.message}</p>
                            {message.phosphoAnalysis.plot && (
                              <div style={{marginTop: '6px'}}>
                                <img 
                                  src={message.phosphoAnalysis.plot} 
                                  alt="分析结果图表" 
                                  style={{
                                    maxWidth: '100%',
                                    borderRadius: '3px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                  }}
                                />
                              </div>
                            )}
                            {message.phosphoAnalysis.data && (
                              <details style={{marginTop: '5px'}}>
                                <summary style={{cursor: 'pointer', color: '#1C484C'}}>查看详细数据</summary>
                                <pre style={{
                                  marginTop: '5px',
                                  padding: '5px',
                                  backgroundColor: '#fff',
                                  borderRadius: '4px',
                                  overflow: 'auto',
                                  fontSize: '0.85em'
                                }}>
                                  {JSON.stringify(message.phosphoAnalysis.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 转录组分析结果显示 */}
                    {message.transcriptomeAnalysis && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '6px',
                        border: '1px solid #c3e6c3'
                      }}>
                        <strong style={{color: '#1C484C'}}>转录组分析结果</strong>
                        <p style={{margin: '5px 0', fontSize: '0.9em'}}>{message.transcriptomeAnalysis.message}</p>

                        {message.transcriptomeAnalysis.plot && (
                          <div style={{marginTop: '6px'}}>
                            <img
                              src={message.transcriptomeAnalysis.plot}
                              alt="转录组分析图表"
                              style={{
                                maxWidth: '100%',
                                borderRadius: '3px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            />
                          </div>
                        )}

                        {message.transcriptomeAnalysis.correlation_stats && (
                          <div style={{marginTop: '6px', fontSize: '0.85em'}}>
                            <details>
                              <summary style={{cursor: 'pointer', color: '#1C484C'}}>查看相关性统计</summary>
                              <pre style={{
                                marginTop: '5px',
                                padding: '5px',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '0.8em'
                              }}>
                                {JSON.stringify(message.transcriptomeAnalysis.correlation_stats, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}

                        {message.transcriptomeAnalysis.data && (
                          <div style={{marginTop: '6px', fontSize: '0.85em'}}>
                            <details>
                              <summary style={{cursor: 'pointer', color: '#1C484C'}}>查看详细数据</summary>
                              <pre style={{
                                marginTop: '5px',
                                padding: '5px',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                overflow: 'auto',
                                fontSize: '0.8em'
                              }}>
                                {JSON.stringify(message.transcriptomeAnalysis.data, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 单细胞分析结果 */}
                    {message.singleCellAnalysis && (
                      <div style={{marginTop: '15px', padding: '10px', border: '1px solid #e1e5e9', borderRadius: '8px', backgroundColor: '#f8f9fa'}}>
                        <h4 style={{color: '#2c3e50', margin: '0 0 10px 0', fontSize: '0.95em'}}>
                          <Dna size={16} style={{ display: 'inline', marginRight: '6px' }} />单细胞RNA测序分析结果
                        </h4>
                        <p style={{margin: '5px 0', fontSize: '0.9em'}}>{message.singleCellAnalysis.message || message.singleCellAnalysis.summary}</p>
                        
                        {message.singleCellAnalysis.image_base64 && (
                          <div style={{margin: '10px 0'}}>
                            <img 
                              src={`data:image/png;base64,${message.singleCellAnalysis.image_base64}`}
                              alt="Single-cell analysis plot"
                              style={{maxWidth: '100%', height: 'auto', border: '1px solid #ddd', borderRadius: '4px'}}
                            />
                          </div>
                        )}

                        {message.singleCellAnalysis.cell_types && message.singleCellAnalysis.cell_types.length > 0 && (
                          <div style={{margin: '10px 0'}}>
                            <details style={{marginTop: '10px'}}>
                              <summary style={{cursor: 'pointer', color: '#007bff', fontSize: '0.9em'}}>
                                细胞类型信息 ({message.singleCellAnalysis.cell_types.length} 种)
                              </summary>
                              <div style={{marginTop: '5px', padding: '8px', backgroundColor: '#fff', borderRadius: '4px', fontSize: '0.85em'}}>
                                {message.singleCellAnalysis.cell_types.join(', ')}
                              </div>
                            </details>
                          </div>
                        )}

                        {message.singleCellAnalysis.data && (
                          <div style={{margin: '10px 0'}}>
                            <details style={{marginTop: '10px'}}>
                              <summary style={{cursor: 'pointer', color: '#007bff', fontSize: '0.9em'}}>
                                原始数据
                              </summary>
                              <pre style={{
                                marginTop: '5px',
                                padding: '8px',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                fontSize: '0.75em',
                                overflow: 'auto',
                                maxHeight: '200px'
                              }}>
                                {JSON.stringify(message.singleCellAnalysis.data, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="mini-loading" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            margin: '8px 0',
            fontSize: '0.9em'
          }}>
            <LoaderThree />
            <span>AI正在思考...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mini-chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="mini-send-button"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default MiniChat;