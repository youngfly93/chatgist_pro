import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  phosphoAnalysis?: any;
}

interface MiniChatProps {
  placeholder?: string;
  height?: string;
}

const MiniChat: React.FC<MiniChatProps> = ({ 
  placeholder = "输入问题，AI助手将为您解答...",
  height = "400px"
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
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
      // 使用非流式响应
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
        phosphoAnalysis: data.phosphoAnalysis
      };
      
      // 调试日志
      console.log('=== MiniChat AI Response ===');
      console.log('Reply:', data.reply);
      console.log('PhosphoAnalysis:', data.phosphoAnalysis);
      
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
            <p>👋 您好！我是GIST AI助手</p>
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
                        <strong style={{color: '#1C484C'}}>磷酸化分析结果</strong>
                        <p style={{margin: '5px 0'}}>{message.phosphoAnalysis.message}</p>
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
                  </>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="mini-loading">AI正在思考...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mini-chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
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