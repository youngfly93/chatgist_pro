import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const FloatingChat: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamMode, setStreamMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (useStream: boolean = streamMode) => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (useStream) {
      // 流式处理
      try {
        const response = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentInput,
            stream: true
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        // 添加一个空的AI消息用于流式更新
        let streamingMessageIndex = -1;
        setMessages(prev => {
          const newMessages = [...prev, { role: 'assistant', content: '' }];
          streamingMessageIndex = newMessages.length - 1;
          return newMessages;
        });

        if (reader) {
          let streamingContent = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            streamingContent += chunk;
            
            // 更新流式消息内容
            setMessages(prev => {
              const newMessages = [...prev];
              if (streamingMessageIndex >= 0) {
                newMessages[streamingMessageIndex] = {
                  role: 'assistant',
                  content: streamingContent
                };
              }
              return newMessages;
            });
          }
        }
      } catch (error: any) {
        console.error('Stream chat error:', error);
        const errorMessage: Message = { 
          role: 'assistant', 
          content: '抱歉，流式服务暂时不可用，请稍后重试。'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    } else {
      // 非流式处理（备用方案）
      try {
        const response = await axios.post('http://localhost:8000/api/chat', {
          message: currentInput,
          stream: false
        });
        
        const aiMessage: Message = { 
          role: 'assistant', 
          content: response.data.reply 
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error: any) {
        console.error('Chat error:', error);
        const errorContent = error.response?.data?.error || '抱歉，服务暂时不可用，请稍后重试。';
        
        const errorMessage: Message = { 
          role: 'assistant', 
          content: errorContent
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isExpanded) {
    // 收缩状态 - 只显示聊天图标
    return (
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#4a90e2',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(74, 144, 226, 0.4)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(74, 144, 226, 0.4)';
          }}
          title="打开GIST AI助手"
        >
          🤖
        </button>
      </div>
    );
  }

  // 展开状态 - 显示完整聊天界面
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '400px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid #e0e0e0'
    }}>
      {/* 头部 */}
      <div style={{
        backgroundColor: '#4a90e2',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>GIST AI助手</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>随时为您解答GIST问题</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px'
          }}>
            <span>流式</span>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '30px',
              height: '16px'
            }}>
              <input
                type="checkbox"
                checked={streamMode}
                onChange={(e) => setStreamMode(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: streamMode ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '12px',
                  width: '12px',
                  left: streamMode ? '16px' : '2px',
                  bottom: '2px',
                  backgroundColor: streamMode ? '#4a90e2' : '#ffffff',
                  borderRadius: '50%',
                  transition: '0.3s'
                }}></span>
              </span>
            </label>
          </div>
          <button
            onClick={clearChat}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: 'white',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="清空对话"
          >
            清空
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 5px'
            }}
            title="最小化"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div style={{
        flex: 1,
        padding: '15px',
        overflowY: 'auto',
        backgroundColor: '#fafafa'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            marginTop: '50px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👋</div>
            <div>我是GIST辅助智能助手</div>
            <div style={{ marginTop: '5px', fontSize: '12px' }}>
              您可以边查看数据库边向我咨询问题
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} style={{
            marginBottom: '15px',
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: msg.role === 'user' ? '#4a90e2' : '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: msg.role === 'user' ? 'white' : '#666',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{
              backgroundColor: msg.role === 'user' ? '#4a90e2' : 'white',
              color: msg.role === 'user' ? 'white' : '#333',
              padding: '10px 12px',
              borderRadius: '12px',
              maxWidth: '80%',
              fontSize: '14px',
              lineHeight: '1.4',
              border: msg.role === 'assistant' ? '1px solid #e0e0e0' : 'none'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#666',
            fontSize: '14px'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🤖
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              {streamMode ? 'AI正在回复...' : 'AI正在思考...'}
            </div>
          </div>
        )}
        
        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: 'white'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="输入您的GIST相关问题..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              resize: 'none'
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              backgroundColor: loading || !input.trim() ? '#ccc' : '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 15px',
              fontSize: '14px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingChat;